// Gameplay 1: run the flip test on three prepared questions. No live AI here.

import { useState } from "react";
import { QUESTIONS, TEST_IDS } from "../content/questions";
import { useAnnounce, useFocusOnChange, useTimers, nowIso } from "../lib/hooks";
import { commitTest, markTestReplySeen, setTestDraft, type Session } from "../state/session";
import type { Updater } from "../state/useSession";
import { ArrowRight, ChatBubble, Loading } from "./Icons";
import { JudgementChoice } from "./JudgementChoice";

type Props = { session: Session; update: Updater };

export function TestState({ session, update }: Props) {
  const index = session.currentTestIndex;
  const id = TEST_IDS[index];
  const q = QUESTIONS[id];
  const replySeen = Boolean(session.tests[id]?.replySeen);
  const choice = session.testDrafts[id] ?? null;
  const [asking, setAsking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const later = useTimers();
  const announce = useAnnounce();
  const headingRef = useFocusOnChange<HTMLHeadingElement>(id);

  const ask = () => {
    if (asking || replySeen) return;
    setAsking(true);
    later(() => {
      update((s) => markTestReplySeen(s, id));
      setAsking(false);
      announce("AI reply received. Choose vulnerable or resilient.");
    }, 600);
  };

  const confirm = () => {
    if (!choice || confirming) return;
    setConfirming(true);
    update((s) => commitTest(s, id, choice, nowIso()));
    announce(index < TEST_IDS.length - 1 ? `Judgement saved. Question ${index + 2} of 3.` : "Judgement saved.");
    later(() => setConfirming(false), 0);
  };

  return (
    <div className="workspace">
      <section className="work-region" aria-labelledby="test-title">
        <h1 id="test-title" className="state-title" ref={headingRef} tabIndex={-1}>
          Run the flip test
        </h1>
        <div key={id} className="content-enter">
          <p className="state-meta">Question {index + 1} of 3</p>
          <p className="state-instruction">Ask AI. Then decide: vulnerable, or resilient?</p>
          <div className="question-block">
            <p className="field-label">Question</p>
            <p className="question-text">{q.text}</p>
          </div>
        </div>
        <div className="region-foot">
          {replySeen && (
            <p className="quiet-status">
              <ChatBubble /> AI reply received
            </p>
          )}
        </div>
      </section>

      <section className="response-region" aria-label="Simulated AI reply" aria-busy={asking}>
        <div key={id} className="content-enter">
          {(asking || replySeen) && <p className="response-label">Simulated AI reply</p>}
          <div className="reply-slot">
            {replySeen ? (
              <p className="reply-text reply-enter">{q.reply}</p>
            ) : asking ? (
              <Loading label="Asking AI…" />
            ) : null}
          </div>
          {replySeen && (
            <JudgementChoice name={`judgement-${id}`} value={choice} onChange={(c) => update((s) => setTestDraft(s, id, c))} />
          )}
        </div>
        <div className="action-row">
          {replySeen ? (
            <button className="primary-button primary-button--wide" type="button" disabled={!choice} onClick={confirm}>
              Confirm judgement <ArrowRight />
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
