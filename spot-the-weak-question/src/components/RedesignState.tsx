// Gameplay 2: redesign both intended weak questions; two valid retests each.

import { useEffect, useRef, useState } from "react";
import { QUESTIONS, REDESIGN_IDS, RUBRIC_VERSION, type RedesignId } from "../content/questions";
import {
  evaluator,
  MAX_INPUT_CHARS,
  PREVIEW_SAMPLES,
  PreviewNotConnectedError,
} from "../lib/evaluator";
import { nowIso, useAnnounce, useDocumentHidden, useFocusOnChange, wordCount } from "../lib/hooks";
import {
  advanceRedesign,
  recordRetest,
  setRedesignDraft,
  type PendingRetest,
  type RedesignAttempt,
  type Session,
} from "../state/session";
import { newId, type Updater } from "../state/useSession";
import { ArrowRight, Loading } from "./Icons";

type Props = { session: Session; update: Updater; reducedMotion: boolean };

export function RedesignState(props: Props) {
  const id = REDESIGN_IDS[props.session.currentRedesignIndex];
  // Keyed per question so local review/timer state never leaks into the next item.
  return <RedesignItem key={id} id={id} {...props} />;
}

function RedesignItem({ id, session, update, reducedMotion }: Props & { id: RedesignId }) {
  const index = session.currentRedesignIndex;
  const q = QUESTIONS[id];
  const item = session.redesigns[id];
  const draft = item.draft;
  const draftTrim = draft.trim();
  const closed = item.finalStatus !== "pending";
  const pending: PendingRetest | null = session.pendingRetest?.questionId === id ? session.pendingRetest : null;
  const lastAttempt = item.attempts[item.attempts.length - 1] ?? null;
  const matching = item.attempts.find((a) => a.submittedText.trim() === draftTrim) ?? null;
  const shown: RedesignAttempt | null = matching ?? lastAttempt;
  const stale = Boolean(shown && !matching); // draft edited since its last result
  const remaining = 2 - item.attempts.length;
  const isLast = index === REDESIGN_IDS.length - 1;

  const [error, setError] = useState<string | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);
  const [resultFocused, setResultFocused] = useState(false);
  const hidden = useDocumentHidden();
  const announce = useAnnounce();
  const headingRef = useFocusOnChange<HTMLHeadingElement>(id);
  const mounted = useRef(true);
  const inFlight = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = async (req: PendingRetest) => {
    if (inFlight.current === req.requestId) return;
    inFlight.current = req.requestId;
    try {
      const result = await evaluator.evaluateRedesign({
        sessionId: session.sessionId,
        requestId: req.requestId,
        mode: "redesign",
        questionId: req.questionId,
        submittedText: req.submittedText,
        rubricVersion: RUBRIC_VERSION,
      });
      const attempt: RedesignAttempt = {
        requestId: req.requestId,
        submittedText: req.submittedText,
        reply: result.simulatedReply,
        classification: result.classification,
        rationale: result.rationale,
        rubricVersion: result.rubricVersion,
        submittedAt: nowIso(),
      };
      // Ignore stale responses: only the request still pending may record an attempt.
      update((s) =>
        s.pendingRetest?.requestId === req.requestId
          ? { ...recordRetest(s, req.questionId, attempt), pendingRetest: null }
          : s,
      );
      if (mounted.current) {
        announce(
          `Reply received. ${result.classification === "resilient" ? "Resilient" : "Still vulnerable"}.`,
        );
      }
    } catch (err) {
      update((s) => (s.pendingRetest?.requestId === req.requestId ? { ...s, pendingRetest: null } : s));
      if (mounted.current) {
        const message =
          err instanceof PreviewNotConnectedError
            ? "Preview mode: this draft can't be assessed without the live AI. Try a sample draft."
            : "Couldn't complete the test. Try again.";
        setError(message);
        announce(message);
      }
    } finally {
      if (inFlight.current === req.requestId) inFlight.current = null;
    }
  };

  // A refresh during a live request resumes the same request ID instead of a new attempt.
  useEffect(() => {
    if (pending && !inFlight.current) void run(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ask = () => {
    setError(null);
    if (pending || closed || matching) return;
    if (!draftTrim) {
      setError("Enter a question to test.");
      return;
    }
    if (draft.length > MAX_INPUT_CHARS) {
      setError(`Keep your question under ${MAX_INPUT_CHARS} characters.`);
      return;
    }
    const req: PendingRetest = { requestId: newId(), questionId: id, submittedText: draft };
    update((s) => (s.pendingRetest ? s : { ...s, pendingRetest: req }));
    void run(req);
  };

  // Readable presentation interval after the item closes; not a learner deadline.
  const autoPaused = keepOpen || resultFocused || hidden || reducedMotion;
  useEffect(() => {
    if (!closed || autoPaused || !lastAttempt) return;
    const ms = Math.max(6500, wordCount(lastAttempt.reply) * 300);
    const t = window.setTimeout(() => update((s) => advanceRedesign(s, id)), ms);
    return () => clearTimeout(t);
  }, [closed, autoPaused, lastAttempt, id, update]);

  useEffect(() => {
    if (!closed) return;
    announce(
      item.finalStatus === "resilient"
        ? "Resilient. Retests are closed for this question."
        : "Still vulnerable after two retests. Retests are closed for this question.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closed]);

  const next = () => update((s) => advanceRedesign(s, id));
  const nextLabel = isLast ? "Continue" : "Next question";

  const attemptsText = closed
    ? item.finalStatus === "resilient"
      ? `Resilient after ${item.attempts.length} ${item.attempts.length === 1 ? "attempt" : "attempts"}`
      : "No attempts remaining"
    : `${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining`;

  const samples = evaluator.mode === "preview" ? Object.keys(PREVIEW_SAMPLES[id] ?? {}) : [];

  return (
    <div className="workspace">
      <section className="work-region" aria-labelledby="redesign-title">
        <h1 id="redesign-title" className="state-title" ref={headingRef} tabIndex={-1}>
          Redesign and retest
        </h1>
        <div className="content-enter">
          <p className="state-meta">
            Question {index + 1} of 2 · {q.label}
          </p>
          <p className="state-instruction">Add course-specific detail.</p>

          <div className="question-block">
            <label className="field-label field-label--strong" htmlFor={`editor-${id}`}>
              Your question
            </label>
            <textarea
              id={`editor-${id}`}
              className="question-editor"
              value={draft}
              readOnly={closed || Boolean(pending)}
              maxLength={MAX_INPUT_CHARS + 200}
              aria-describedby={`attempts-${id} help-${id}`}
              onChange={(e) => {
                setError(null);
                update((s) => setRedesignDraft(s, id, e.target.value));
              }}
            />
            <p id={`attempts-${id}`} className="field-help">
              {attemptsText}
              {draft.length > MAX_INPUT_CHARS - 200 && (
                <span className="char-count">
                  {" "}
                  · {draft.length} / {MAX_INPUT_CHARS} characters
                </span>
              )}
            </p>
            <div id={`help-${id}`}>
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
              {!closed && !pending && matching && item.attempts.length > 0 && (
                <p className="field-help">Edit your question to test again.</p>
              )}
            </div>
            {samples.length > 0 && !closed && (
              <details className="preview-samples">
                <summary>Preview only: insert a sample draft</summary>
                <ul>
                  {samples.map((text) => (
                    <li key={text}>
                      <button
                        type="button"
                        disabled={Boolean(pending)}
                        onClick={() => {
                          setError(null);
                          update((s) => setRedesignDraft(s, id, text));
                        }}
                      >
                        {text}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
        <div className="region-foot">
          {index === 0 && <p className="field-help">Up next: {QUESTIONS[REDESIGN_IDS[1]].label}</p>}
        </div>
      </section>

      <section
        className="response-region"
        aria-labelledby="reply-heading"
        aria-busy={Boolean(pending)}
        onFocus={() => setResultFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setResultFocused(false);
        }}
      >
        <h2 id="reply-heading" className="response-heading">
          Simulated AI reply
        </h2>
        <div className="reply-slot">
          {pending ? (
            <Loading label="Asking AI…" />
          ) : shown ? (
            <div key={shown.requestId} className="reply-enter">
              {stale && <p className="reply-note">Reply to your previous version</p>}
              <p className={`reply-text${stale ? " reply-text--stale" : ""}`}>{shown.reply}</p>
              {!stale && (
                <p
                  className={`status result-status ${
                    shown.classification === "resilient" ? "status--good" : "status--bad"
                  }`}
                >
                  {shown.classification === "resilient" ? "Resilient" : "Still vulnerable"}
                </p>
              )}
            </div>
          ) : (
            <p className="reply-placeholder">Your reply will appear here.</p>
          )}
        </div>

        <div className="action-row">
          {closed ? (
            autoPaused ? (
              <button className="primary-button" type="button" onClick={next}>
                {nextLabel} <ArrowRight />
              </button>
            ) : (
              <div className="auto-advance">
                <span>Moving on shortly.</span>
                <button className="secondary-button secondary-button--small" type="button" onClick={() => setKeepOpen(true)}>
                  Keep result open
                </button>
              </div>
            )
          ) : (
            <button className="primary-button" type="button" disabled={Boolean(pending) || Boolean(matching)} onClick={ask}>
              {pending ? "Asking AI…" : item.attempts.length === 0 ? "Ask AI" : "Test again"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
