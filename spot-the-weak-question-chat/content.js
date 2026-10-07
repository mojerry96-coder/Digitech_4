/* ==========================================================
   Authored content: questions, Sage's replies, Kemi's feedback.
   Answer keys live here; they are never shown before the learner
   commits a judgement.
   ========================================================== */
(function (global) {
  "use strict";

  const QUESTIONS = {
    market: {
      id: "market", label: "Market segmentation",
      text: "Define market segmentation.",
      reply: "Market segmentation is the process of dividing a market into distinct groups of buyers with different needs or behaviours.",
      expected: "vulnerable",
      feedback: "Sage gave a complete textbook definition without knowing anything about your course. A student could paste that straight in.",
      reason: "A textbook definition answered it."
    },
    noble: {
      id: "noble", label: "Noble gases",
      text: "List the noble gases.",
      reply: "The group 18 elements are helium, neon, argon, krypton, xenon, radon and oganesson.",
      expected: "vulnerable",
      feedback: "One standard list answered it completely. Nothing in the question needs your class.",
      reason: "A standard list answered it."
    },
    source: {
      id: "source", label: "Primary source",
      text: "Using the primary source document we analysed in week six, explain why the author's account differs from the textbook version.",
      reply: "I don't have access to the specific primary source your class analysed in week six, so I can't compare it to the textbook account.",
      expected: "resilient",
      feedback: "Sage couldn't answer, because the question depends on the week-six source your class analysed. That's what a strong question looks like.",
      reason: "It depends on the source your class analysed."
    },
    water: {
      id: "water", label: "Water cycle",
      text: "Explain the water cycle.",
      reply: "Water evaporates, condenses into clouds and returns as precipitation. It collects in rivers, lakes and oceans, and the cycle continues.",
      expected: "vulnerable",
      reason: "Sage answered completely with no class material."
    },
    "practice-immunity": {
      id: "practice-immunity", label: "Immunity",
      text: "Explain how vaccines create immunity in the body.",
      reply: "Vaccines train the immune system to recognise a pathogen or part of it. This builds immune memory, which supports a faster response to later exposure.",
      expected: "vulnerable",
      reason: "A general explanation answered it without class material."
    },
    "practice-trial": {
      id: "practice-trial", label: "Vaccine trial",
      text: "Using the dataset we reviewed in week nine, which vaccine trial showed the strongest results, and why?",
      reply: "I don't have the specific dataset your class reviewed in week nine, so I can't tell which trial showed the strongest results.",
      expected: "resilient",
      reason: "The comparison needs the week-nine dataset your class reviewed."
    }
  };

  const FLIP_IDS = ["market", "noble", "source"];
  const REDESIGN_IDS = ["market", "noble"];
  const PRACTICE_IDS = ["practice-immunity", "practice-trial"];

  const LABEL = { vulnerable: "Vulnerable", resilient: "Resilient" };

  // The concept, shown on both options. It defines the words, never the answer.
  const DEFINITION = {
    vulnerable: "AI can answer it without anything from your course.",
    resilient: "AI can't answer it without something only your class has."
  };

  /** Causal explanation for the unaided and practice questions, shown only in the audit. */
  function explain(id, choice) {
    const q = QUESTIONS[id];
    const right = choice === q.expected;
    if (q.expected === "vulnerable") {
      return right
        ? "Sage answered it instantly and completely, with no class material. That's the warning sign."
        : "This one is vulnerable. Sage's reply used no class material at all: it answered instantly and completely, which is the warning sign.";
    }
    return right
      ? `Sage couldn't answer. ${q.reason}`
      : `This one is resilient. Sage couldn't answer, because ${q.reason.charAt(0).toLowerCase() + q.reason.slice(1)} There was nothing to fix.`;
  }

  global.Content = { QUESTIONS, FLIP_IDS, REDESIGN_IDS, PRACTICE_IDS, LABEL, DEFINITION, explain };
})(window);
