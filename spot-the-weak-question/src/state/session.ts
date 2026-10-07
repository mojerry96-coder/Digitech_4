// Session evidence and guarded transitions. Pure functions: each returns the
// session unchanged when a guard fails, so double clicks and stale callbacks
// cannot create extra attempts or overwrite committed evidence.

import {
  QUESTIONS,
  REDESIGN_IDS,
  TEST_IDS,
  type Classification,
  type PracticeId,
  type QuestionId,
  type RedesignId,
} from "../content/questions";

export type View = "cover" | "test" | "redesign" | "cold" | "audit";

export type TestEvidence = {
  questionId: QuestionId;
  replySeen: boolean;
  classification: Classification | null;
  committedAt: string | null;
};

export type RedesignAttempt = {
  requestId: string;
  submittedText: string;
  reply: string;
  classification: Classification;
  rationale: string;
  rubricVersion: string;
  submittedAt: string;
};

export type RedesignEvidence = {
  questionId: RedesignId;
  draft: string;
  attempts: RedesignAttempt[];
  finalText: string | null;
  finalStatus: "pending" | "resilient" | "unresolved";
};

export type FixQuality = "course_specific" | "generic" | "not_applicable" | null;

export type ColdEvidence = {
  attemptId: string;
  questionId: QuestionId;
  mode: "official" | "practice";
  replySeen: boolean;
  classification: Classification;
  proposedFix: string | null;
  submittedAt: string;
  locked: true;
  evaluation: {
    status: "pending" | "complete" | "unavailable";
    classificationCorrect: boolean;
    fixQuality: FixQuality;
    rationale: string | null;
    rubricVersion: string;
  };
};

export type PendingRetest = {
  requestId: string;
  questionId: RedesignId;
  submittedText: string;
};

export type Session = {
  schemaVersion: 1;
  sessionId: string;
  view: View;
  currentTestIndex: number;
  currentRedesignIndex: number;
  tests: Partial<Record<QuestionId, TestEvidence>>;
  /** Radio choices made but not yet confirmed. */
  testDrafts: Partial<Record<QuestionId, Classification>>;
  redesigns: Record<RedesignId, RedesignEvidence>;
  /** A retest in flight, kept so a refresh can retry the same request ID. */
  pendingRetest: PendingRetest | null;
  officialCold: ColdEvidence | null;
  practiceAttempts: ColdEvidence[];
  practiceOrder: PracticeId[];
  usedPracticeIds: PracticeId[];
  activePracticeId: PracticeId | null;
  coldDraft: { classification: Classification | null; proposedFix: string; replySeen: boolean };
  completedAt: string | null;
};

export function createSession(sessionId: string, practiceOrder: PracticeId[]): Session {
  const redesign = (id: RedesignId): RedesignEvidence => ({
    questionId: id,
    draft: QUESTIONS[id].text,
    attempts: [],
    finalText: null,
    finalStatus: "pending",
  });
  return {
    schemaVersion: 1,
    sessionId,
    view: "test",
    currentTestIndex: 0,
    currentRedesignIndex: 0,
    tests: {},
    testDrafts: {},
    redesigns: { market: redesign("market"), noble: redesign("noble") },
    pendingRetest: null,
    officialCold: null,
    practiceAttempts: [],
    practiceOrder,
    usedPracticeIds: [],
    activePracticeId: null,
    coldDraft: { classification: null, proposedFix: "", replySeen: false },
    completedAt: null,
  };
}

// ---------- Test ----------

export function markTestReplySeen(s: Session, id: QuestionId): Session {
  if (s.view !== "test" || TEST_IDS[s.currentTestIndex] !== id) return s;
  const item = s.tests[id];
  if (item?.replySeen) return s;
  return {
    ...s,
    tests: {
      ...s.tests,
      [id]: { questionId: id, replySeen: true, classification: null, committedAt: null },
    },
  };
}

export function setTestDraft(s: Session, id: QuestionId, choice: Classification): Session {
  const item = s.tests[id];
  if (s.view !== "test" || !item?.replySeen || item.committedAt) return s;
  return { ...s, testDrafts: { ...s.testDrafts, [id]: choice } };
}

export function commitTest(s: Session, id: QuestionId, choice: Classification, now: string): Session {
  const item = s.tests[id];
  if (s.view !== "test" || TEST_IDS[s.currentTestIndex] !== id || !item?.replySeen || item.committedAt)
    return s;
  const tests = { ...s.tests, [id]: { ...item, classification: choice, committedAt: now } };
  const next = s.currentTestIndex + 1;
  return {
    ...s,
    tests,
    currentTestIndex: Math.min(next, TEST_IDS.length - 1),
    view: next === TEST_IDS.length ? "redesign" : "test",
  };
}

// ---------- Redesign ----------

export function setRedesignDraft(s: Session, id: RedesignId, draft: string): Session {
  const item = s.redesigns[id];
  if (s.view !== "redesign" || item.finalStatus !== "pending") return s;
  if (s.pendingRetest?.questionId === id) return s; // submitted snapshot is frozen
  return { ...s, redesigns: { ...s.redesigns, [id]: { ...item, draft } } };
}

export function recordRetest(s: Session, id: RedesignId, attempt: RedesignAttempt): Session {
  const item = s.redesigns[id];
  if (
    s.view !== "redesign" ||
    REDESIGN_IDS[s.currentRedesignIndex] !== id ||
    item.finalStatus !== "pending" ||
    item.attempts.length >= 2 ||
    !attempt.submittedText.trim() ||
    item.attempts.some(
      (a) => a.requestId === attempt.requestId || a.submittedText.trim() === attempt.submittedText.trim(),
    )
  )
    return s;
  const attempts = [...item.attempts, attempt];
  const status: RedesignEvidence["finalStatus"] =
    attempt.classification === "resilient" ? "resilient" : attempts.length === 2 ? "unresolved" : "pending";
  return {
    ...s,
    redesigns: {
      ...s.redesigns,
      [id]: { ...item, attempts, finalText: attempt.submittedText, finalStatus: status },
    },
  };
}

export function advanceRedesign(s: Session, expectedId: RedesignId): Session {
  if (
    s.view !== "redesign" ||
    REDESIGN_IDS[s.currentRedesignIndex] !== expectedId ||
    s.redesigns[expectedId].finalStatus === "pending"
  )
    return s;
  if (s.currentRedesignIndex === REDESIGN_IDS.length - 1) {
    return {
      ...s,
      view: "cold",
      activePracticeId: null,
      coldDraft: { classification: null, proposedFix: "", replySeen: false },
    };
  }
  return { ...s, currentRedesignIndex: s.currentRedesignIndex + 1 };
}

// ---------- Cold (official and practice) ----------

export function activeColdQuestion(s: Session): QuestionId {
  return s.activePracticeId ?? "water";
}

export function markColdReplySeen(s: Session): Session {
  if (s.view !== "cold" || s.coldDraft.replySeen) return s;
  return { ...s, coldDraft: { ...s.coldDraft, replySeen: true } };
}

export function setColdClassification(s: Session, c: Classification): Session {
  if (s.view !== "cold" || !s.coldDraft.replySeen) return s;
  return { ...s, coldDraft: { ...s.coldDraft, classification: c } };
}

export function setColdFix(s: Session, fix: string): Session {
  if (s.view !== "cold") return s;
  return { ...s, coldDraft: { ...s.coldDraft, proposedFix: fix } };
}

export function lockCold(s: Session, result: ColdEvidence): Session {
  if (
    s.view !== "cold" ||
    !s.coldDraft.replySeen ||
    !result.replySeen ||
    !s.coldDraft.classification ||
    result.classification !== s.coldDraft.classification
  )
    return s;
  if (
    result.classification === "vulnerable" &&
    (!result.proposedFix?.trim() || result.proposedFix !== s.coldDraft.proposedFix)
  )
    return s;
  if (result.classification === "resilient" && result.proposedFix !== null) return s;
  if (result.mode === "official") {
    if (s.officialCold || s.activePracticeId || result.questionId !== "water") return s;
    return { ...s, officialCold: result, view: "audit" };
  }
  if (
    !s.activePracticeId ||
    result.questionId !== s.activePracticeId ||
    s.practiceAttempts.some((a) => a.attemptId === result.attemptId || a.questionId === result.questionId)
  )
    return s;
  return {
    ...s,
    practiceAttempts: [...s.practiceAttempts, result],
    activePracticeId: null,
    view: "audit",
  };
}

/** Updates only the evaluation fields of an existing locked attempt. */
export function updateColdEvaluation(
  s: Session,
  attemptId: string,
  patch: Pick<ColdEvidence["evaluation"], "status" | "fixQuality" | "rationale">,
): Session {
  const apply = (a: ColdEvidence): ColdEvidence =>
    a.attemptId === attemptId && a.evaluation.status !== "complete"
      ? { ...a, evaluation: { ...a.evaluation, ...patch } }
      : a;
  return {
    ...s,
    officialCold: s.officialCold ? apply(s.officialCold) : null,
    practiceAttempts: s.practiceAttempts.map(apply),
  };
}

// ---------- Audit ----------

export function beginPractice(s: Session): Session {
  if (s.view !== "audit" || !s.officialCold) return s;
  const next = s.practiceOrder.find((id) => !s.usedPracticeIds.includes(id));
  if (!next) return s;
  return {
    ...s,
    view: "cold",
    activePracticeId: next,
    usedPracticeIds: [...s.usedPracticeIds, next],
    coldDraft: { classification: null, proposedFix: "", replySeen: false },
  };
}

export function finishSession(s: Session, now: string): Session {
  if (s.view !== "audit" || s.completedAt) return s;
  return { ...s, completedAt: now };
}

export function auditSummary(s: Session) {
  const correct = TEST_IDS.filter(
    (id) => s.tests[id]?.committedAt && s.tests[id]?.classification === QUESTIONS[id].expected,
  ).length;
  const resilient = REDESIGN_IDS.filter((id) => s.redesigns[id].finalStatus === "resilient").length;
  return {
    correct,
    totalClassifications: TEST_IDS.length,
    resilient,
    totalRedesigns: REDESIGN_IDS.length,
    officialCold: s.officialCold,
    practice: s.practiceAttempts,
  };
}

export function practiceRemaining(s: Session): number {
  return s.practiceOrder.filter((id) => !s.usedPracticeIds.includes(id)).length;
}
