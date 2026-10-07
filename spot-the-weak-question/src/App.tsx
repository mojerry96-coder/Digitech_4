// One persistent shell, one route. Views change through state, never navigation.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AuditState } from "./components/AuditState";
import { BrandHeader } from "./components/BrandHeader";
import { ColdState } from "./components/ColdState";
import { Cover } from "./components/Cover";
import { Opener } from "./components/Opener";
import { RedesignState } from "./components/RedesignState";
import { TestState } from "./components/TestState";
import { RUBRIC_VERSION } from "./content/questions";
import { evaluator, PreviewNotConnectedError } from "./lib/evaluator";
import { AnnounceContext, nowIso, useReducedMotion } from "./lib/hooks";
import { installZoomTracking } from "./lib/zoom";
import {
  beginPractice,
  finishSession,
  updateColdEvaluation,
  type ColdEvidence,
  type Session,
} from "./state/session";
import { useSession } from "./state/useSession";

type Props = {
  /** Host programme callback. Without one, Finish shows an in-page completion state. */
  onFinish?: (session: Session) => void;
};

export default function App({ onFinish }: Props) {
  const { session, sessionRef, update, start, reset } = useSession();
  const reducedMotion = useReducedMotion();

  // Returning learners (or ?skipintro) bypass the opener entirely.
  const [openerVisible, setOpenerVisible] = useState(
    () => !session && !new URLSearchParams(window.location.search).has("skipintro"),
  );
  const [focusStart, setFocusStart] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [evaluating, setEvaluating] = useState<ReadonlySet<string>>(new Set());
  const inFlight = useRef(new Set<string>());
  const frameRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const view = session?.view ?? "cover";
  const theme = view === "cover" || view === "audit" ? "dark" : "light";

  useEffect(() => installZoomTracking(), []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // The opener is modal: everything behind it is inert.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (openerVisible) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }, [openerVisible]);

  // On every view change, move focus to the new state's heading.
  const prevView = useRef(view);
  useEffect(() => {
    if (prevView.current === view) return;
    prevView.current = view;
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => mainRef.current?.querySelector<HTMLElement>("h1[tabindex='-1']")?.focus());
  }, [view]);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  /** Silent fix assessment. Retries reuse the same locked text and request ID. */
  const evaluateCold = useCallback(
    async (attempt: ColdEvidence) => {
      const s = sessionRef.current;
      if (!s || attempt.proposedFix === null || inFlight.current.has(attempt.attemptId)) return;
      inFlight.current.add(attempt.attemptId);
      setEvaluating(new Set(inFlight.current));
      try {
        const result = await evaluator.evaluateFix({
          sessionId: s.sessionId,
          requestId: attempt.attemptId,
          mode: "cold_fix",
          questionId: attempt.questionId,
          submittedText: attempt.proposedFix,
          rubricVersion: RUBRIC_VERSION,
        });
        update((cur) =>
          updateColdEvaluation(cur, attempt.attemptId, {
            status: "complete",
            fixQuality: result.fixQuality,
            rationale: result.rationale,
          }),
        );
      } catch (err) {
        if (err instanceof PreviewNotConnectedError) {
          update((cur) =>
            updateColdEvaluation(cur, attempt.attemptId, { status: "unavailable", fixQuality: null, rationale: null }),
          );
        }
        // Any other failure leaves the attempt pending; the audit offers Retry assessment.
      } finally {
        inFlight.current.delete(attempt.attemptId);
        setEvaluating(new Set(inFlight.current));
      }
    },
    [sessionRef, update],
  );

  // After a refresh, retry any assessment that was still pending.
  useEffect(() => {
    const s = sessionRef.current;
    if (!s) return;
    [s.officialCold, ...s.practiceAttempts]
      .filter((a): a is ColdEvidence => Boolean(a && a.evaluation.status === "pending" && a.proposedFix !== null))
      .forEach((a) => void evaluateCold(a));
  }, [sessionRef, evaluateCold]);

  const handleReset = () => {
    reset();
    setFocusStart(false);
    setOpenerVisible(true);
    window.scrollTo({ top: 0 });
  };

  const handleFinish = () => {
    update((s) => finishSession(s, nowIso()));
    if (onFinish && sessionRef.current) onFinish(sessionRef.current);
  };

  let content: JSX.Element;
  if (!session) {
    content = <Cover reducedMotion={reducedMotion} focusStart={focusStart} onStart={start} />;
  } else if (session.view === "test") {
    content = <TestState session={session} update={update} />;
  } else if (session.view === "redesign") {
    content = <RedesignState session={session} update={update} reducedMotion={reducedMotion} />;
  } else if (session.view === "cold") {
    content = <ColdState session={session} update={update} onSubmitted={(a) => void evaluateCold(a)} />;
  } else {
    content = (
      <AuditState
        session={session}
        evaluating={evaluating}
        onRetryAssessment={(a) => void evaluateCold(a)}
        onPractice={() => update(beginPractice)}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <AnnounceContext.Provider value={announce}>
      <div className="weak-question-app" data-theme={theme}>
        <div ref={frameRef} className="app-frame">
          <BrandHeader onReset={handleReset} />
          <main ref={mainRef} className="app-main">
            {content}
          </main>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
        {openerVisible && (
          <Opener
            reducedMotion={reducedMotion}
            onGone={() => {
              setOpenerVisible(false);
              setFocusStart(true);
            }}
          />
        )}
      </div>
    </AnnounceContext.Provider>
  );
}
