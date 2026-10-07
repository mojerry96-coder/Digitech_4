// Ending: evidence audit built entirely from stored session values.

import { useRef, useState, type KeyboardEvent } from "react";
import { CLASSIFICATION_LABEL, QUESTIONS, REDESIGN_IDS, TEST_IDS } from "../content/questions";
import { useAnnounce } from "../lib/hooks";
import { auditSummary, practiceRemaining, type ColdEvidence, type Session } from "../state/session";

type Category = "classifications" | "redesigns" | "officialCold" | "practiceDetail";

type Props = {
  session: Session;
  evaluating: ReadonlySet<string>;
  onRetryAssessment: (attempt: ColdEvidence) => void;
  onPractice: () => void;
  onFinish: () => void;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function coldStatusLine(a: ColdEvidence): string {
  if (a.evaluation.status === "pending") return "Assessment pending";
  return a.evaluation.classificationCorrect ? "Correctly classified" : "Misclassified";
}

export function AuditState({ session, evaluating, onRetryAssessment, onPractice, onFinish }: Props) {
  const summary = auditSummary(session);
  const [category, setCategory] = useState<Category>("classifications");
  const tabRefs = useRef<Partial<Record<Category, HTMLButtonElement | null>>>({});
  const announce = useAnnounce();
  const remaining = practiceRemaining(session);

  const categories: { id: Category; title: string; sub: string }[] = [
    { id: "classifications", title: "Flip-test accuracy", sub: `${summary.correct} of 3 correct` },
    { id: "redesigns", title: "Redesign effectiveness", sub: `${summary.resilient} of 2 resilient` },
    {
      id: "officialCold",
      title: "Cold application",
      sub: summary.officialCold ? coldStatusLine(summary.officialCold) : "Recorded",
    },
  ];
  if (summary.practice.length > 0) {
    categories.push({
      id: "practiceDetail",
      title: "Extra practice",
      sub: `${plural(summary.practice.length, "attempt", "attempts")} · Not scored`,
    });
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    const jump = e.key === "Home" ? 0 : e.key === "End" ? categories.length - 1 : null;
    if (!delta && jump === null) return;
    e.preventDefault();
    const nextIndex = jump ?? (i + delta + categories.length) % categories.length;
    const next = categories[nextIndex].id;
    setCategory(next);
    tabRefs.current[next]?.focus();
  };

  const finish = () => {
    onFinish();
    announce("Simulation complete. Your audit has been recorded.");
  };

  return (
    <div className="workspace">
      <section className="work-region" aria-labelledby="audit-title">
        <h1 id="audit-title" className="state-title content-enter" tabIndex={-1}>
          Your question audit
        </h1>
        <div className="audit-tabs" role="tablist" aria-orientation="vertical" aria-label="Evidence">
          {categories.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => { tabRefs.current[c.id] = el; }}
              id={`tab-${c.id}`}
              role="tab"
              type="button"
              className="audit-category"
              aria-selected={category === c.id}
              aria-controls="audit-panel"
              tabIndex={category === c.id ? 0 : -1}
              onClick={() => setCategory(c.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="audit-category-title">{c.title}</span>
              <span className="audit-category-sub">{c.sub}</span>
            </button>
          ))}
        </div>
        <p className="audit-transfer">Take one question from your own course and redesign it.</p>

        <div className="region-foot">
          {remaining > 0 ? (
            <>
              <button
                className="secondary-button"
                type="button"
                onClick={onPractice}
                aria-describedby="practice-note"
              >
                Practice Again
              </button>
              <p id="practice-note" className="audit-practice-note">
                Optional · Original result stays unchanged
              </p>
            </>
          ) : (
            <p className="audit-practice-note">All practice questions completed</p>
          )}
        </div>
      </section>

      <section className="response-region">
        <div
          id="audit-panel"
          key={category}
          role="tabpanel"
          aria-labelledby={`tab-${category}`}
          className="content-enter"
          tabIndex={0}
        >
          {category === "classifications" && <ClassificationsDetail session={session} />}
          {category === "redesigns" && <RedesignsDetail session={session} />}
          {category === "officialCold" && summary.officialCold && (
            <>
              <h2 className="audit-detail-title">Cold application</h2>
              <p className="audit-lede">Your official, unaided attempt. Practice never changes this result.</p>
              <div className="audit-items">
                <ColdItem attempt={summary.officialCold} evaluating={evaluating} onRetry={onRetryAssessment} />
              </div>
            </>
          )}
          {category === "practiceDetail" && (
            <>
              <h2 className="audit-detail-title">Extra practice</h2>
              <p className="audit-lede">Not scored. Shown in the order you tried them.</p>
              <div className="audit-items">
                {summary.practice.map((a) => (
                  <ColdItem key={a.attemptId} attempt={a} evaluating={evaluating} onRetry={onRetryAssessment} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="action-row">
          {session.completedAt && <p className="audit-complete">Simulation complete. Your audit has been recorded.</p>}
          <button className="primary-button" type="button" onClick={finish}>
            Finish
          </button>
        </div>
      </section>
    </div>
  );
}

function ClassificationsDetail({ session }: { session: Session }) {
  return (
    <>
      <h2 className="audit-detail-title">Flip-test accuracy</h2>
      <p className="audit-lede">An instant, complete, context-free reply is the warning sign.</p>
      <div className="audit-items">
        {TEST_IDS.map((id) => {
          const q = QUESTIONS[id];
          const chosen = session.tests[id]?.classification ?? null;
          const correct = chosen === q.expected;
          return (
            <article key={id} className="audit-item">
              <div className="audit-item-head">
                <h3 className="audit-item-title">{q.label}</h3>
                <span className={`status ${correct ? "status--good" : "status--bad"}`}>
                  {correct ? "Correct" : "Incorrect"}
                </span>
              </div>
              <dl className="audit-pairs-row">
                <div className="audit-pair">
                  <dt>You chose</dt>
                  <dd>{chosen ? CLASSIFICATION_LABEL[chosen] : "Not recorded"}</dd>
                </div>
                <div className="audit-pair">
                  <dt>Answer</dt>
                  <dd>{CLASSIFICATION_LABEL[q.expected]}</dd>
                </div>
              </dl>
              <p className="audit-reason">{q.auditReason}</p>
            </article>
          );
        })}
      </div>
    </>
  );
}

function RedesignsDetail({ session }: { session: Session }) {
  return (
    <>
      <h2 className="audit-detail-title">Redesign effectiveness</h2>
      <div className="audit-items">
        {REDESIGN_IDS.map((id) => {
          const q = QUESTIONS[id];
          const item = session.redesigns[id];
          const resilient = item.finalStatus === "resilient";
          const last = item.attempts[item.attempts.length - 1];
          const n = item.attempts.length;
          return (
            <article key={id} className="audit-item">
              <div className="audit-item-head">
                <h3 className="audit-item-title">{q.label}</h3>
                <span className={`status ${resilient ? "status--good" : "status--bad"}`}>
                  {resilient ? "Resilient" : "Still vulnerable"}
                  <span className="status-meta"> · {plural(n, "attempt", "attempts")}</span>
                </span>
              </div>
              <dl>
                <div className="audit-pair">
                  <dt>Original</dt>
                  <dd>{q.text}</dd>
                </div>
                <div className="audit-pair">
                  <dt>Final</dt>
                  <dd>{item.finalText ?? "Not tested"}</dd>
                </div>
              </dl>
              {last && <p className="audit-reason">{last.rationale}</p>}
              {n > 1 && (
                <details className="audit-history">
                  <summary>Show every attempt</summary>
                  <ol>
                    {item.attempts.map((a) => (
                      <li key={a.requestId}>
                        {a.submittedText}{" "}
                        <span className="status-meta">
                          · {a.classification === "resilient" ? "Resilient" : "Still vulnerable"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function coldExplanation(a: ColdEvidence): string {
  const q = QUESTIONS[a.questionId];
  if (q.expected === "vulnerable") {
    return a.classification === "vulnerable"
      ? "The reply answered fully with no class-specific material, so the question is vulnerable."
      : "The reply used no class-specific material: it answered instantly and completely. That is the warning sign, so this question is vulnerable.";
  }
  return a.classification === "resilient"
    ? `The AI couldn't answer. ${q.auditReason}`
    : `The AI couldn't answer, because it lacked the class material. ${q.auditReason} That dependence makes the question resilient.`;
}

function ColdItem({
  attempt,
  evaluating,
  onRetry,
}: {
  attempt: ColdEvidence;
  evaluating: ReadonlySet<string>;
  onRetry: (a: ColdEvidence) => void;
}) {
  const q = QUESTIONS[attempt.questionId];
  const correct = attempt.evaluation.classificationCorrect;
  const busy = evaluating.has(attempt.attemptId);
  const ev = attempt.evaluation;

  return (
    <article className="audit-item">
      <div className="audit-item-head">
        <h3 className="audit-item-title">{q.label}</h3>
        <span className={`status ${correct ? "status--good" : "status--bad"}`}>
          {correct ? "Correct classification" : "Misclassified"}
        </span>
      </div>
      <dl>
        <div className="audit-pair">
          <dt>Question</dt>
          <dd>{q.text}</dd>
        </div>
        <div className="audit-pairs-row">
          <div className="audit-pair">
            <dt>You chose</dt>
            <dd>{CLASSIFICATION_LABEL[attempt.classification]}</dd>
          </div>
          <div className="audit-pair">
            <dt>Answer</dt>
            <dd>{CLASSIFICATION_LABEL[q.expected]}</dd>
          </div>
        </div>
        {attempt.proposedFix !== null && (
          <div className="audit-pair">
            <dt>Your fix</dt>
            <dd>{attempt.proposedFix}</dd>
          </div>
        )}
      </dl>
      <p className="audit-reason">{coldExplanation(attempt)}</p>

      {attempt.proposedFix !== null && (
        <dl className="audit-pair">
          <dt>Fix assessment</dt>
          {ev.status === "complete" && (
            <dd>
              <span className={`status ${ev.fixQuality === "course_specific" ? "status--good" : "status--bad"}`}>
                {ev.fixQuality === "course_specific" ? "Names course-specific material" : "Too generic"}
              </span>
              {ev.rationale && <p className="audit-reason">{ev.rationale}</p>}
              {ev.fixQuality === "generic" && !ev.rationale && (
                <p className="audit-reason">It doesn't identify actual course material the question would need.</p>
              )}
            </dd>
          )}
          {ev.status === "unavailable" && (
            <dd className="audit-reason">Not assessed: live AI assessment isn't connected in this preview.</dd>
          )}
          {ev.status === "pending" && (
            <dd>
              <span className="status status--neutral">{busy ? "Assessing…" : "Assessment pending"}</span>{" "}
              {!busy && (
                <button className="secondary-button secondary-button--small" type="button" onClick={() => onRetry(attempt)}>
                  Retry assessment
                </button>
              )}
            </dd>
          )}
        </dl>
      )}
    </article>
  );
}
