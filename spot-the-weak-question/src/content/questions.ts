// Authored simulation content. Answer keys live here and must never be rendered
// into labels, hints or pre-commit UI.

export type Classification = "vulnerable" | "resilient";
export type QuestionId =
  | "market"
  | "noble"
  | "source"
  | "water"
  | "practice-immunity"
  | "practice-trial";

export type Question = {
  id: QuestionId;
  label: string;
  text: string;
  reply: string;
  expected: Classification;
  auditReason: string;
};

export const QUESTIONS: Record<QuestionId, Question> = {
  market: {
    id: "market",
    label: "Market segmentation",
    text: "Define market segmentation.",
    reply:
      "Market segmentation is the process of dividing a market into distinct groups of buyers with different needs or behaviours.",
    expected: "vulnerable",
    auditReason: "The reply needed no course-specific material.",
  },
  noble: {
    id: "noble",
    label: "Noble gases",
    text: "List the noble gases.",
    reply:
      "The group 18 elements are helium, neon, argon, krypton, xenon, radon and oganesson.",
    expected: "vulnerable",
    auditReason: "A standard factual list answered the question.",
  },
  source: {
    id: "source",
    label: "Primary source",
    text: "Using the primary source document we analysed in week six, explain why the author's account differs from the textbook version.",
    reply:
      "I don't have access to the specific primary source your class analysed in week six, so I can't compare it to the textbook account.",
    expected: "resilient",
    auditReason: "The answer depends on the specific source used in class.",
  },
  water: {
    id: "water",
    label: "Water cycle",
    text: "Explain the water cycle.",
    reply:
      "Water evaporates, condenses into clouds and returns as precipitation. It collects in rivers, lakes and oceans, and the cycle continues.",
    expected: "vulnerable",
    auditReason: "The explanation needed no course-specific material.",
  },
  "practice-immunity": {
    id: "practice-immunity",
    label: "Immunity",
    text: "Explain how vaccines create immunity in the body.",
    reply:
      "Vaccines train the immune system to recognise a pathogen or part of it. This develops immune memory that can support a faster response to later exposure.",
    expected: "vulnerable",
    auditReason: "A general explanation can answer this without class material.",
  },
  "practice-trial": {
    id: "practice-trial",
    label: "Vaccine trial",
    text: "Using the dataset we reviewed in week nine, which vaccine trial showed the strongest results, and why?",
    reply:
      "I don't have the specific dataset your class reviewed in week nine, so I can't determine which trial showed the strongest results.",
    expected: "resilient",
    auditReason: "The comparison needs the specific week-nine dataset.",
  },
};

export const TEST_IDS = ["market", "noble", "source"] as const;
export const REDESIGN_IDS = ["market", "noble"] as const;
export const PRACTICE_IDS = ["practice-immunity", "practice-trial"] as const;
export type RedesignId = (typeof REDESIGN_IDS)[number];
export type PracticeId = (typeof PRACTICE_IDS)[number];

export const RUBRIC_VERSION = "flip-test-v1" as const;

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  vulnerable: "Vulnerable",
  resilient: "Resilient",
};
