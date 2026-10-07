// Gameplay 3: one official unaided question (or an optional practice item).
// No hints, no correctness signal; the result is locked on submit.

import { useRef, useState } from "react";
import { QUESTIONS, RUBRIC_VERSION } from "../content/questions";
import { nowIso, useAnnounce, useFocusOnChange, useTimers } from "../lib/hooks";
import {
  activeColdQuestion,
  lockCold,
  markColdReplySeen,
  setColdClassification,
  setColdFix,
  type ColdEvidence,
  type Session,
} from "../state/session";
import { newId, type Updater } from "../state/useSession";
import { Loading } from "./Icons";
import { JudgementChoice } from "./JudgementChoice";

type Props = { session: Session; update: Updater; onSubmitted: (attempt: ColdEvidence) => void };

export function ColdState({ session, update, onSubmitted }: Props) {
  const qid = activeColdQuestion(session);
  const q = QUESTIONS[qid];
  const practice = Boolean(session.activePracticeId);
  const { classification, proposedFix, replySeen } = session.coldDraft;
  const [asking, setAsking] = useState(false);
  const submitted = useRef(false);
  const later = useTimers();
  const announce = useAnnounce();
  const headingRef = useFocusOnChange<HTMLHeadingElement>(qid);

  const fixRequired = classification === "vulnerable";
  const canSubmit =
    replySeen && classification !== null && (!fixRequired || proposedFix.trim().length >= 2);

  const ask = () => {
    if (asking || replySeen) return;
    setAsking(true);
    later(() => {
      update(markColdReplySeen);
      setAsking(false);
      announce("AI reply received.");
    }, 600);
  };

  const submit = () => {
    if (!canSubmit || submitted.current || !classification) return;
    submitted.current = true;
    const attempt: ColdEvidence = {
      attemptId: newId(),
      questionId: qid,
      mode: practice ? "practice" : "official",
      replySeen: true,
      classification,
      proposedFix: classification === "vulnerable" ? proposedFix : null,
      submittedAt: nowIso(),
      locked: true,
      evaluation: {
        status: classification === "vulnerable" ? "pending" : "complete",
        classificationCorrect: classification === q.expected,
        fixQuality: classification === "vulnerable" ? null : "not_applicable",
        rationale: null,
        rubricVersion: RUBRIC_VERSION,
      },
    };
    update((s) => lockCold(s, attempt));
    onSubmitted(attempt);
    announce(practice ? "Practice answer submitted." : "Audit submitted.");
  };

  return (
    <div className="workspace">
      <section className="work-region" aria-labelledby="cold-title">
        <h1 id="cold-title" className="state-title" ref={headingRef} tabIndex={-1}>
          One more, unaided
        </h1>
        <div key={qid} className="content-enter">
          {practice && <p className="state-meta">Extra practice · Not scored</p>}
          <div className="question-block">
            <p className="field-label">Question</p>
            <p className="question-text">{q.text}</p>
          </div>

          {replySeen && (
            <JudgementChoice
              name={`cold-${qid}`}
              inline
              value={classification}
              onChange={(c) => update((s) => setColdClassification(s, c))}
            />
          )}

          {replySeen && fixRequired && (
            <div className="question-block controls-enter">
              <label className="field-label" htmlFor={`fix-${qid}`}>
                Your course-specific fix
              </label>
              <textarea
                id={`fix-${qid}`}
                className="fix-editor"
                value={proposedFix}
                maxLength={1500}
                onChange={(e) => update((s) => setColdFix(s, e.target.value))}
              />
            </div>
          )}
        </div>
      </section>

      <section className="response-region" aria-labelledby="cold-reply-heading" aria-busy={asking}>
        <h2 id="cold-reply-heading" className="response-heading">
          Simulated AI reply
        </h2>
        <div className="reply-slot">
          {replySeen ? (
            <p className="reply-text reply-enter">{q.reply}</p>
          ) : asking ? (
            <Loading label="Asking AI…" />
          ) : null}
        </div>
        <div className="action-row">
          {replySeen ? (
            <button className="primary-button" type="button" disabled={!canSubmit} onClick={submit}>
              {practice ? "Submit practice" : "Submit audit"}
            </button>
          ) : (
            <button className="primary-button" type="button" disabled={asking} onClick={ask}>
              {asking ? "Asking AI…" : "Ask AI"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
