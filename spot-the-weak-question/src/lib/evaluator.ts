// The one seam between the simulation and runtime AI.
//
// Live mode: set VITE_EVALUATOR_URL (and optionally VITE_EVALUATOR_KEY) to a
// protected backend endpoint that implements the contract below — in Lovable,
// the `evaluate-question` edge function. No prompts or keys live in the browser.
//
// Preview mode (no URL configured): a clearly labelled stand-in that only
// returns fixed fixture results for known sample drafts. It never pretends to
// assess free text.

import { RUBRIC_VERSION, type Classification, type QuestionId } from "../content/questions";

export type EvaluationRequest = {
  sessionId: string;
  requestId: string;
  mode: "redesign" | "cold_fix";
  questionId: QuestionId;
  submittedText: string;
  rubricVersion: typeof RUBRIC_VERSION;
};

export type RedesignEvaluation = {
  mode: "redesign";
  requestId: string;
  classification: Classification;
  dependsOnSpecificCourseMaterial: boolean;
  preservesOriginalTopic: boolean;
  evidenceReference: string | null;
  simulatedReply: string;
  rationale: string;
  rubricVersion: typeof RUBRIC_VERSION;
};

export type FixEvaluation = {
  mode: "cold_fix";
  requestId: string;
  fixQuality: "course_specific" | "generic";
  evidenceReference: string | null;
  rationale: string;
  rubricVersion: typeof RUBRIC_VERSION;
};

export interface Evaluator {
  mode: "live" | "preview";
  evaluateRedesign(req: EvaluationRequest): Promise<RedesignEvaluation>;
  evaluateFix(req: EvaluationRequest): Promise<FixEvaluation>;
}

export const MAX_INPUT_CHARS = 1500;

/** Thrown in preview mode when a draft has no fixture result. Consumes no attempt. */
export class PreviewNotConnectedError extends Error {
  constructor() {
    super("Live AI assessment isn't connected in this preview.");
    this.name = "PreviewNotConnectedError";
  }
}

export class InvalidEvaluationError extends Error {
  constructor(detail: string) {
    super(`Invalid evaluation: ${detail}`);
    this.name = "InvalidEvaluationError";
  }
}

// ---------- Validation (applied to every result, live or preview) ----------

function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function validateRedesign(raw: unknown, requestId: string): RedesignEvaluation {
  const r = raw as Partial<RedesignEvaluation> | null;
  if (!r || r.mode !== "redesign") throw new InvalidEvaluationError("wrong mode");
  if (r.requestId !== requestId) throw new InvalidEvaluationError("request ID mismatch");
  if (r.classification !== "vulnerable" && r.classification !== "resilient")
    throw new InvalidEvaluationError("classification");
  if (!isString(r.simulatedReply) || !r.simulatedReply.trim()) throw new InvalidEvaluationError("reply");
  if (!isString(r.rationale)) throw new InvalidEvaluationError("rationale");
  if (typeof r.dependsOnSpecificCourseMaterial !== "boolean" || typeof r.preservesOriginalTopic !== "boolean")
    throw new InvalidEvaluationError("flags");
  // Resilient is only accepted when the structured evidence agrees with it.
  if (
    r.classification === "resilient" &&
    (!r.dependsOnSpecificCourseMaterial || !r.preservesOriginalTopic || !r.evidenceReference?.trim())
  )
    throw new InvalidEvaluationError("contradictory resilient result");
  return r as RedesignEvaluation;
}

export function validateFix(raw: unknown, requestId: string): FixEvaluation {
  const r = raw as Partial<FixEvaluation> | null;
  if (!r || r.mode !== "cold_fix") throw new InvalidEvaluationError("wrong mode");
  if (r.requestId !== requestId) throw new InvalidEvaluationError("request ID mismatch");
  if (r.fixQuality !== "course_specific" && r.fixQuality !== "generic")
    throw new InvalidEvaluationError("fixQuality");
  if (!isString(r.rationale)) throw new InvalidEvaluationError("rationale");
  return r as FixEvaluation;
}

// ---------- Live (HTTP) evaluator ----------

function createHttpEvaluator(url: string, key: string | undefined): Evaluator {
  const cache = new Map<string, unknown>(); // successful results by request ID

  async function post(req: EvaluationRequest): Promise<unknown> {
    if (cache.has(req.requestId)) return cache.get(req.requestId);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}`, apikey: key } : {}),
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Evaluator responded ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    mode: "live",
    async evaluateRedesign(req) {
      const result = validateRedesign(await post(req), req.requestId);
      cache.set(req.requestId, result);
      return result;
    },
    async evaluateFix(req) {
      const result = validateFix(await post(req), req.requestId);
      cache.set(req.requestId, result);
      return result;
    },
  };
}

// ---------- Preview evaluator (fixtures only) ----------

type Fixture = Omit<RedesignEvaluation, "requestId" | "mode" | "rubricVersion">;

const normalise = (t: string) =>
  t
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const v = (simulatedReply: string, rationale: string): Fixture => ({
  classification: "vulnerable",
  dependsOnSpecificCourseMaterial: false,
  preservesOriginalTopic: true,
  evidenceReference: null,
  simulatedReply,
  rationale,
});

const r = (simulatedReply: string, rationale: string, evidenceReference: string): Fixture => ({
  classification: "resilient",
  dependsOnSpecificCourseMaterial: true,
  preservesOriginalTopic: true,
  evidenceReference,
  simulatedReply,
  rationale,
});

/** Builder-only sample drafts. Shown only in preview tools, never as learner hints. */
export const PREVIEW_SAMPLES: Partial<Record<QuestionId, Record<string, Fixture>>> = {
  market: {
    "Define market segmentation.": v(
      "Market segmentation is the process of dividing a market into distinct groups of buyers with different needs or behaviours.",
      "This is the original question; a generic answer still fulfils it.",
    ),
    "Explain market segmentation in more detail.": v(
      "Market segmentation divides a market into groups of buyers who share needs, characteristics or behaviours. Common bases include demographic, geographic, psychographic and behavioural variables, which help firms target and position products.",
      "Generic rewording; no course material is needed to answer.",
    ),
    "As we discussed in week four, define market segmentation.": v(
      "Market segmentation is the process of dividing a market into distinct groups of buyers with different needs or behaviours.",
      "A week label alone doesn't make the answer depend on class material.",
    ),
    "Using the case study we discussed in week four, which segmentation variable explains their targeting strategy, and why?":
      r(
        "I don't have the details of the case study discussed in your week four session, so I can only guess generally at segmentation variables without more context.",
        "The analysis depends on a specific class case study that isn't available.",
        "week-four case study",
      ),
  },
  noble: {
    "List the noble gases.": v(
      "The group 18 elements are helium, neon, argon, krypton, xenon, radon and oganesson.",
      "This is the original question; a generic answer still fulfils it.",
    ),
    "Name the noble gases in order.": v(
      "In order of atomic number: helium, neon, argon, krypton, xenon, radon and oganesson.",
      "The wording changed; the course context did not.",
    ),
    "Using the dataset supplied in our week-three practical, compare the recorded properties of the three named noble gases and explain the pattern.":
      r(
        "I don't have the dataset from your week-three practical, so I can't compare the recorded properties or explain the pattern you found.",
        "The comparison needs the class's own practical dataset.",
        "week-three practical dataset",
      ),
  },
};

const previewEvaluator: Evaluator = {
  mode: "preview",
  async evaluateRedesign(req) {
    await new Promise((res) => setTimeout(res, 800));
    const samples = PREVIEW_SAMPLES[req.questionId] ?? {};
    const match = Object.entries(samples).find(([text]) => normalise(text) === normalise(req.submittedText));
    if (!match) throw new PreviewNotConnectedError();
    return validateRedesign(
      { ...match[1], mode: "redesign", requestId: req.requestId, rubricVersion: RUBRIC_VERSION },
      req.requestId,
    );
  },
  async evaluateFix() {
    await new Promise((res) => setTimeout(res, 400));
    throw new PreviewNotConnectedError();
  },
};

const url = import.meta.env.VITE_EVALUATOR_URL as string | undefined;
const key = import.meta.env.VITE_EVALUATOR_KEY as string | undefined;

export const evaluator: Evaluator = url ? createHttpEvaluator(url, key) : previewEvaluator;
