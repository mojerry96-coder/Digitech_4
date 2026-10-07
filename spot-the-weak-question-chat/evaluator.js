/* ==========================================================
   Flip-test evaluator — deterministic, no live LLM.
   A redesigned question is resilient only when it still asks about
   the original topic AND depends on material only this class has
   (a case study, a dataset, a lab result…), used for a real task
   rather than as decoration on a definition.
   Runs silently; the UI shows only Sage's reply and the verdict.
   ========================================================== */
(function (global) {
  "use strict";

  const norm = (s) => String(s || "").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

  /* Material a class produces or examines itself: AI cannot know it. */
  const DATA_NOUNS =
    "case[- ]stud(?:y|ies)|data[- ]?sets?|data|results?|readings?|observations?|measurements?|recordings?|" +
    "findings|figures|records?|logbooks?|lab(?:oratory)?(?: work)?|practicals?|experiments?|field[- ]?(?:trip|work|visit)s?|" +
    "site visits?|surveys?|questionnaires?|interviews?|transcripts?|responses|guest (?:lecture|speaker|talk)s?|" +
    "debates?|role[- ]?plays?|primary sources?|source documents?|archives?|samples?|specimens?|projects?|portfolios?|" +
    "company|firm|business|organi[sz]ation|brand|campaign|scenario|example|incident|placement";
  const DATA_RE = new RegExp("\\b(" + DATA_NOUNS + ")\\b", "i");

  /* Material that only repeats general knowledge: AI can still answer. */
  const INFO_RE = /\b(lecture notes?|notes|slides?|handouts?|textbooks?|reading list|readings? list|course ?book|lectures?|videos?|articles?)\b/i;

  /* Signals that the material belongs to this class. */
  const OWN_RE = /\b(we|our|us|your class|the class|this class|in class|this course|our course|week[- ](?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)|session \d+|lab \d+|practical \d+|last (?:week|term|semester|lesson|class))\b/i;
  const CLASS_VERB_RE = /\b(collected|recorded|gathered|observed|measured|visited|analy[sz]ed|reviewed|watched|ran|conducted|carried out|handed out|supplied|provided|shared|discussed|studied|examined|interviewed|surveyed)\b/i;

  /* Weak decorations: a week label or "as discussed" alone. */
  const DECORATION_RE = /\b(week[- ]\w+|as (?:we )?discussed|as taught|in class|in our (?:lecture|session|class)|from class|do not use ai|don't use ai|without ai)\b/i;

  /* Purely definitional tasks. */
  const DEFINE_RE = /\b(define|definition of|what is|what are|meaning of|list|name|state)\b/i;
  const ANALYTIC_RE = /\b(why|how|which|compare|contrast|rank|analy[sz]e|interpret|evaluate|assess|justify|explain the pattern|explain why|explain how|identify which|account for|differ|pattern|trend|recommend|apply|calculate|critique|decide|argue)\b/i;

  const TOPIC = {
    market: /\b(segment\w*|target(?:ing|ed)?|market\w*|customers?|consumers?|buyers?|audiences?|positioning)\b/i,
    noble: /\b(noble|helium|neon|argon|krypton|xenon|radon|oganesson|group 18|group eighteen|inert gas(?:es)?)\b/i
  };

  const GENERIC_REPLY = {
    market: "Market segmentation means dividing a market into groups of buyers who share similar needs, characteristics or behaviours. Firms usually segment by demographic, geographic, psychographic or behavioural variables, then choose which segments to target.",
    noble: "The noble gases are the group 18 elements: helium, neon, argon, krypton, xenon, radon and oganesson. Their full outer electron shells make them very unreactive."
  };

  const ORDERED_NOBLE = "In order of atomic number: helium, neon, argon, krypton, xenon, radon and oganesson.";

  const CASE_REPLY = {
    market: "Here's a well-known example: a car maker segments by income and lifestyle, offering budget models to students and premium models to professionals. Each group gets its own product, price and message.",
    noble: "Here's a typical example: helium, neon and argon are all unreactive because their outer electron shells are full, and reactivity data usually shows xenon forming a few compounds under extreme conditions."
  };

  function cleanNoun(n) {
    const s = n.toLowerCase().replace(/-/g, " ");
    if (/^data ?sets?$/.test(s)) return "dataset";
    if (s === "data" || s === "figures" || s === "records" || s === "record") return "data";
    if (/^case stud/.test(s)) return "case study";
    return s.replace(/s$/, "") || s;
  }

  /** "a case study", "an interview", "data" */
  const withArticle = (noun) => (noun === "data" ? "data" : `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`);

  function weekPhrase(t) {
    const m = t.match(/\bweek[- ](\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i);
    return m ? `week ${m[1].toLowerCase()}` : "";
  }

  /**
   * evaluateRedesign("…", "market") →
   * { verdict: "resilient"|"vulnerable", reason: key, note: string, reply: string, material: string|null }
   */
  function evaluateRedesign(text, id) {
    const t = norm(text);
    const dataMatch = t.match(DATA_RE);
    const owned = OWN_RE.test(t) || CLASS_VERB_RE.test(t);
    const definitional = DEFINE_RE.test(t) && !ANALYTIC_RE.test(t);
    const ordered = /\b(order|sequence|rank)\b/i.test(t);
    const generic = id === "noble" && ordered ? ORDERED_NOBLE : GENERIC_REPLY[id];

    if (dataMatch && owned && !definitional) {
      const noun = cleanNoun(dataMatch[1]);
      const week = weekPhrase(t);
      const where = week ? ` from your ${week} session` : " your class used";
      return {
        verdict: "resilient",
        reason: "depends",
        material: noun,
        note: `It depends on ${withArticle(noun)} only your class has.`,
        reply: `I don't have the ${noun}${where}, so I can't answer this properly. I could only guess in general terms, and that wouldn't match what your class actually found.`
      };
    }

    if (dataMatch && owned && definitional) {
      return {
        verdict: "vulnerable", reason: "decoration", material: null,
        note: "The class reference is decoration: a general answer still works.",
        reply: `I don't need your class material for that. ${generic}`
      };
    }

    if (dataMatch && !owned) {
      const noun = cleanNoun(dataMatch[1]);
      return {
        verdict: "vulnerable", reason: "any-material", material: null,
        note: `Any ${noun} would do, so AI picks its own.`,
        reply: /case stud|example|company|firm|scenario/i.test(dataMatch[1]) ? CASE_REPLY[id] : `I can use a typical ${noun} for that. ${generic}`
      };
    }

    if (INFO_RE.test(t)) {
      return {
        verdict: "vulnerable", reason: "info", material: null,
        note: "Notes and slides repeat general knowledge, so AI can still answer.",
        reply: `I haven't seen your notes, but they'll say much the same as this. ${generic}`
      };
    }

    if (DECORATION_RE.test(t) || OWN_RE.test(t)) {
      return {
        verdict: "vulnerable", reason: "label", material: null,
        note: "A week number or “as discussed” doesn't name any class material.",
        reply: `I don't know what your class covered, but I don't need to. ${generic}`
      };
    }

    return {
      verdict: "vulnerable", reason: "generic", material: null,
      note: "New wording, same general question: AI still answers it.",
      reply: generic
    };
  }

  /** True when the rewrite still asks about the original topic. */
  function onTopic(text, id) {
    return TOPIC[id] ? TOPIC[id].test(norm(text)) : true;
  }

  /**
   * evaluateFix("the rainfall readings our class logged…") →
   * { quality: "course_specific"|"generic", note }
   * The unaided task asks for one short course-specific detail, not a full question.
   */
  function evaluateFix(text) {
    const t = norm(text);
    const dataMatch = t.match(DATA_RE);
    const owned = OWN_RE.test(t) || CLASS_VERB_RE.test(t) || /\b(campus|our|class)\b/i.test(t);
    if (dataMatch && owned) {
      const noun = cleanNoun(dataMatch[1]);
      return { quality: "course_specific", note: `Names ${withArticle(noun)} only your class has, so AI couldn't answer without it.` };
    }
    if (dataMatch) {
      return { quality: "generic", note: `Any ${cleanNoun(dataMatch[1])} would do. Make it one only your class has.` };
    }
    if (INFO_RE.test(t)) {
      return { quality: "generic", note: "Notes and slides repeat general knowledge, so AI could still answer." };
    }
    if (DECORATION_RE.test(t) || OWN_RE.test(t)) {
      return { quality: "generic", note: "A week number or “as discussed” doesn't name any class material." };
    }
    return { quality: "generic", note: "It doesn't name any class material, so AI could still answer." };
  }

  global.FlipEvaluator = { evaluateRedesign, evaluateFix, onTopic };
})(typeof window !== "undefined" ? window : globalThis);
