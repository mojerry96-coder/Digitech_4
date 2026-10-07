/* ==========================================================
   Intent check — is this actually a redesigned question?
   Adapted from Fix the Prompt. Runs before the evaluator. When the
   learner sends something that is not a redesign (a greeting, a
   question to Sage, the original untouched, a version already
   tested, gibberish, or a different subject), Sage answers in
   character and no try is used. It never says what to write.
   ========================================================== */
(function (global) {
  "use strict";

  const norm = (s) => String(s || "").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  const bare = (s) => norm(s).replace(/[.!?,;:"']/g, "");
  const WORDS = /[a-z']{2,}/g;

  const ASKING = [
    /\b(what|which|how)\b[^?]*\b(should|do|can|would) (i|we)\b/,
    /\b(help me|help please|any help|give me a hint|hint please|tell me what|show me what|what do you think)\b/,
    /^(help|hint|hints|i need help|not sure|no idea|i don'?t know|idk|dunno)\b/,
    /\bwhat('s| is)? (missing|wrong|the answer)\b/,
    /\b(is|was) (this|that|it) (right|correct|ok|okay|good|fine|enough)\b/,
    /\b(give|tell) me the answer\b/,
    /\bcan you (help|tell|show) me\b/,
    /\b(rewrite|redesign|fix) (it|this) for me\b/
  ];

  const CHATTY = [
    /^(hi|hii+|hey+|hello|yo|sup|good (morning|afternoon|evening)|greetings)\b/,
    /^(ok|okay|k|kk|cool|nice|great|fine|sure|alright|right|yes|no|yeah|nah|done|next|continue|start|go)\b[.!]*$/,
    /^(thanks|thank you|ty|cheers|please|sorry)\b/,
    /^(test|testing|hmm+|erm|uh+|lol|haha)\b/,
    /^(this|that|it) (is|was|feels) (hard|difficult|confusing|easy|tricky|unclear)\b/,
    /^i (don'?t|do not) (get|understand) (this|it)\b/
  ];

  function message(kind, opts) {
    const topic = opts.label.toLowerCase();
    switch (kind) {
      case "unchanged": return "That's the original question, word for word. Change it first, then test it again.";
      case "repeat": return "You've already tested that version. Change it, then test it again.";
      case "unreadable": return "I can't read that as a question. Write it the way it would appear on an exam paper.";
      case "chatty": return "Nothing to answer yet. Send me your redesigned question and I'll answer it the way a student's AI would.";
      case "asking": return "I can't tell you what to write — that's the part you're practising. Send me your redesigned question and I'll answer it as it stands.";
      case "off-topic": return `That's moved away from ${topic}. Keep the question about ${topic}, then make it depend on your class.`;
      default: return "";
    }
  }

  /**
   * check("hello", { id: "market", label: "Market segmentation", original: "…", tested: ["…"] })
   * → { kind, message } when it is not a redesign, or null when it is.
   */
  function check(text, opts) {
    const t = norm(text);
    const flat = bare(text);
    const verdict = (kind) => ({ kind, message: message(kind, opts) });
    if (!t) return verdict("unreadable");
    if (flat === bare(opts.original)) return verdict("unchanged");
    if ((opts.tested || []).some((p) => bare(p) === flat)) return verdict("repeat");
    if (CHATTY.some((re) => re.test(t))) return verdict("chatty");
    if (ASKING.some((re) => re.test(t))) return verdict("asking");

    const words = t.match(WORDS) || [];
    const readable = words.filter((w) => /[aeiouy]/.test(w));
    if (words.length < 3 || readable.length < 2 || t.replace(/[^a-z ]/g, "").length < t.length * 0.55) {
      return verdict("unreadable");
    }
    if (global.FlipEvaluator && !global.FlipEvaluator.onTopic(text, opts.id)) return verdict("off-topic");
    return null;
  }

  global.Intent = { check };
})(window);
