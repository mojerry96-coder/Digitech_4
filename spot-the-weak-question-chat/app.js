/* ==========================================================
   SPOT THE WEAK QUESTION — single-page controller
   Built on the Fix the Prompt engine: one conversation, one dock.
   The thread is derived entirely from state; the stage decides
   what the dock asks for.
   ========================================================== */
(function () {
  "use strict";

  const C = window.Content;
  const E = window.FlipEvaluator;
  const Q = C.QUESTIONS;
  const STORAGE_KEY = "spot-the-weak-question:v1";
  const MAX_TRIES = 2;

  const STAGES = [
    "intro", "flip-ask", "flip-judge", "flip-done", "redesign", "redesign-done",
    "cold-ask", "cold-judge", "cold-done", "end", "practice-ask", "practice-judge", "closed"
  ];
  const STAGE_LABEL = {
    intro: "", "flip-ask": "Run the flip test", "flip-judge": "Run the flip test", "flip-done": "Run the flip test",
    redesign: "Redesign and retest", "redesign-done": "Redesign and retest",
    "cold-ask": "One more, unaided", "cold-judge": "One more, unaided", "cold-done": "One more, unaided",
    end: "Your question audit", "practice-ask": "Extra practice", "practice-judge": "Extra practice", closed: "Your question audit"
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WORKING_FIRST = ["Reading the question…", "Taking that in…", "Looking at what's being asked…"];
  const WORKING_THEN = ["Writing an answer…", "Putting that together…", "Drafting a reply…"];
  const anyOf = (list) => list[Math.floor(Math.random() * list.length)];

  /* ---------------- State ---------------- */
  function shuffled(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function freshState() {
    return {
      stage: "intro",
      flip: { index: 0, asked: [], choices: {}, draft: null },
      redesign: {
        index: 0,
        drafts: { market: Q.market.text, noble: Q.noble.text },
        attempts: { market: [], noble: [] },
        status: { market: "pending", noble: "pending" }
      },
      asides: [], // messages that were not a redesign: { qid, after, prompt, message }
      cold: { asked: false, choice: null, fix: "", result: null },
      practice: { order: shuffled(C.PRACTICE_IDS), active: null, asked: false, choice: null, fix: "", results: [] },
      complete: false
    };
  }
  let state = freshState();
  let busy = false; // true while Sage is "thinking"

  const at = (s) => STAGES.indexOf(state.stage) >= STAGES.indexOf(s);
  const practiceLeft = () => state.practice.order.filter((id) => id !== state.practice.active && !state.practice.results.some((r) => r.id === id));

  /** Evidence record, posted to the host on Finish. */
  function result() {
    return {
      flipTest: C.FLIP_IDS.map((id) => ({ questionId: id, choice: state.flip.choices[id] || null, correct: state.flip.choices[id] === Q[id].expected })),
      redesigns: C.REDESIGN_IDS.map((id) => {
        const list = state.redesign.attempts[id];
        return {
          questionId: id,
          attempts: list.map((a) => ({ text: a.text, verdict: a.verdict, reason: a.reason })),
          finalText: list.length ? list[list.length - 1].text : null,
          finalStatus: state.redesign.status[id]
        };
      }),
      officialCold: state.cold.result,
      practice: state.practice.results,
      completionStatus: state.complete
    };
  }

  function save() {
    window.SpotWeakResult = result();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: keep going in memory */ }
  }

  function load() {
    try {
      if (new URLSearchParams(location.search).has("reset")) { localStorage.removeItem(STORAGE_KEY); return; }
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && !saved.complete && STAGES.includes(saved.stage)) state = Object.assign(freshState(), saved);
    } catch (e) { /* ignore */ }
  }

  /* ---------------- Helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arrow = `<i class="ph-bold ph-arrow-right" aria-hidden="true"></i>`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function announce(msg) { const el = $("#live"); el.textContent = ""; setTimeout(() => (el.textContent = msg), 40); }

  function badge(verdict, label) {
    const icon = verdict === "resilient" ? "ph-shield-check" : verdict === "vulnerable" ? "ph-warning-circle" : "ph-clock";
    const text = label || (verdict === "resilient" ? "Resilient" : "Still vulnerable");
    return `<span class="tier tier-${verdict}"><i class="ph-fill ${icon}" aria-hidden="true"></i>${text}</span>`;
  }

  const replyHtml = (text) => `<p>${esc(text)}</p>`;

  /* ==========================================================
     THREAD — derived entirely from state
     ========================================================== */
  function asidesAt(qid, after) {
    const list = [];
    state.asides.forEach((a, n) => {
      if (a.qid !== qid || a.after !== after) return;
      list.push({ id: `as-${n}-user`, kind: "user", meta: "You", text: a.prompt });
      list.push({ id: `as-${n}-ai`, kind: "ai", tested: true, aside: true, html: replyHtml(a.message) });
    });
    return list;
  }

  /** Ask → reply → judgement, for a question with no feedback (unaided and practice). */
  function unaidedItems(prefix, id, asked, res) {
    const list = [];
    if (asked) {
      list.push({ id: `${prefix}-q`, kind: "user", meta: "The question", text: Q[id].text });
      list.push({ id: `${prefix}-ai`, kind: "ai", tested: true, html: replyHtml(Q[id].reply) });
    }
    if (res) {
      list.push({ id: `${prefix}-you`, kind: "user", meta: "Your judgement", text: C.LABEL[res.choice], small: true });
      if (res.fix) list.push({ id: `${prefix}-fix`, kind: "user", meta: "Your fix", text: res.fix });
    }
    return list;
  }

  function items() {
    const list = [
      { id: "intro", kind: "step", art: window.Characters.clip("tade-puzzled"), eyebrow: "The question stack",
        text: "Three exam questions are about to go in front of students. Before they do, run the flip test on each one." }
    ];

    if (at("flip-ask")) {
      list.push({ id: "step-flip", kind: "step", eyebrow: "Run the flip test",
        text: "Ask the AI each question, the way a student would. Then judge it." });
      C.FLIP_IDS.forEach((id, i) => {
        if (!state.flip.asked.includes(id)) return;
        list.push({ id: `flip-${id}-q`, kind: "user", meta: `Question ${i + 1} of 3`, text: Q[id].text });
        list.push({ id: `flip-${id}-ai`, kind: "ai", tested: true, html: replyHtml(Q[id].reply) });
        const choice = state.flip.choices[id];
        if (choice) {
          list.push({ id: `flip-${id}-you`, kind: "user", meta: "Your judgement", text: C.LABEL[choice], small: true });
          list.push({ id: `flip-${id}-coach`, kind: "coach", ok: choice === Q[id].expected, html: coachHtml(id, choice) });
        }
      });
    }

    if (at("redesign")) {
      list.push({ id: "step-redesign", kind: "step", eyebrow: "Redesign and retest",
        text: "Two of these could be answered without your course. Make each one depend on something only your class has.",
        sub: "For example, a case study, a dataset or a lab result from your class. Two tries each." });
      C.REDESIGN_IDS.forEach((id, i) => {
        if (i > state.redesign.index) return;
        const tries = state.redesign.attempts[id];
        list.push({ id: `rd-${id}-head`, kind: "divider", text: `Question ${i + 1} of 2 · ${Q[id].label}` });
        list.push({ id: `rd-${id}-orig`, kind: "user", meta: "The weak question", text: Q[id].text });
        tries.forEach((a, k) => {
          list.push(...asidesAt(id, k));
          list.push({ id: `rd-${id}-${k}-user`, kind: "user", meta: "Your redesign", text: a.text });
          list.push({ id: `rd-${id}-${k}-ai`, kind: "ai", tested: true, verdict: a.verdict, note: a.note, html: replyHtml(a.reply) });
        });
        list.push(...asidesAt(id, tries.length));
      });
    }

    if (at("cold-ask")) {
      list.push({ id: "step-cold", kind: "step", eyebrow: "One more, unaided",
        text: "A question from a different subject. No feedback this time: test it and judge it on your own." });
      list.push(...unaidedItems("cold", "water", state.cold.asked, state.cold.result));
      if (state.cold.result) list.push({ id: "cold-recorded", kind: "line", text: "Recorded. You'll see how it went in your audit." });
    }

    if (at("end")) list.push({ id: "audit", kind: "card", html: auditCard() });

    // Optional practice: each run sits after the audit, in the order it happened
    const runs = [...state.practice.results.map((r) => ({ id: r.id, res: r, asked: true }))];
    if (state.practice.active) runs.push({ id: state.practice.active, res: null, asked: state.practice.asked });
    runs.forEach(({ id, res, asked }) => {
      list.push({ id: `pr-${id}-step`, kind: "step", eyebrow: "Extra practice · not scored",
        text: "One more on your own. Your recorded result won't change." });
      list.push(...unaidedItems(`pr-${id}`, id, asked, res));
      if (res) list.push({ id: `pr-${id}-card`, kind: "card", html: practiceCard(res) });
    });

    return list;
  }

  function coachHtml(id, choice) {
    const q = Q[id];
    const ok = choice === q.expected;
    const head = ok ? `Yes, ${q.expected}.` : `Not quite. This one is ${q.expected}.`;
    return `<span class="coach-mark" aria-hidden="true"><i class="ph-bold ${ok ? "ph-check-circle" : "ph-x-circle"}"></i></span>
      <p><b>${head}</b> ${esc(q.feedback)}</p>`;
  }

  function renderItem(item) {
    const el = document.createElement("div");
    el.dataset.id = item.id;
    if (item.kind === "user") {
      el.className = "msg msg-user" + (item.small ? " small" : "");
      el.innerHTML = `${item.meta ? `<span class="msg-meta">${item.meta}</span>` : ""}<div class="bubble">${esc(item.text)}</div>`;
    } else if (item.kind === "ai") {
      el.className = "msg msg-ai";
      el.innerHTML = `
        <span class="avatar" aria-hidden="true"><img src="assets/cast/sage-avatar.png" alt="" /></span>
        <div class="ai-body">
          ${item.tested ? `<div class="think-art">${window.Characters.clip("sage-think")}<p class="think-line" data-think>${anyOf(WORKING_FIRST)}</p></div>` : ""}
          ${item.verdict ? `<div class="ai-head">${badge(item.verdict)}${item.note ? `<span class="ai-note">${esc(item.note)}</span>` : ""}</div>` : ""}
          <div class="reply${item.aside ? " reply-aside" : ""}">${item.html}</div>
        </div>`;
    } else if (item.kind === "coach") {
      el.className = "coach";
      el.innerHTML = `
        <span class="avatar avatar-kemi" aria-hidden="true"><img src="assets/cast/kemi-talk.png" alt="" /></span>
        <div class="coach-body ${item.ok ? "ok" : "no"}">${item.html}</div>`;
    } else if (item.kind === "step") {
      el.className = "step";
      el.innerHTML = `${item.art ? `<div class="step-art">${item.art}</div>` : ""}<span class="step-eyebrow">${item.eyebrow}</span><p>${item.text}</p>${item.sub ? `<p class="step-sub">${item.sub}</p>` : ""}`;
    } else if (item.kind === "divider") {
      el.className = "divider";
      el.innerHTML = `<span>${esc(item.text)}</span>`;
    } else if (item.kind === "line") {
      el.className = "line-note";
      el.innerHTML = `<i class="ph ph-lock-simple" aria-hidden="true"></i>${esc(item.text)}`;
    } else {
      el.className = "card-item";
      el.innerHTML = item.html;
    }
    return el;
  }

  const host = () => $("#thread-inner");

  /* Append anything new. Tested replies "think" first, then the reply lands. */
  function syncThread(animate) {
    const root = host();
    const fresh = [];
    items().forEach((item) => {
      if (root.querySelector(`[data-id="${item.id}"]`)) return;
      const el = renderItem(item);
      root.appendChild(el);
      fresh.push({ el, item });
    });
    if (!animate) { at("flip-ask") ? scrollToEnd(false) : scrollToStart(); return Promise.resolve(); }

    const thinking = fresh.filter((f) => f.item.tested);
    fresh.forEach(({ el, item }) => { if (!item.tested) el.classList.add("enter"); });
    if (!thinking.length) { scrollToEnd(true); return Promise.resolve(); }

    busy = true;
    renderDock();
    thinking.forEach(({ el }) => el.classList.add("thinking"));
    scrollToEnd(true);
    const quick = thinking.every(({ item }) => item.aside);
    const beat = setTimeout(() => {
      thinking.forEach(({ el }) => {
        const line = el.querySelector("[data-think]");
        if (line) line.textContent = anyOf(WORKING_THEN);
      });
    }, 800);
    return new Promise((resolve) => {
      setTimeout(() => {
        clearTimeout(beat);
        thinking.forEach(({ el }) => { el.classList.remove("thinking"); el.classList.add("reveal"); });
        busy = false;
        scrollToEnd(true);
        resolve();
      }, reducedMotion ? 150 : quick ? 900 : 1700);
    });
  }

  function scrollToStart() {
    const t = $("#thread");
    requestAnimationFrame(() => t.scrollTo({ top: 0, behavior: "auto" }));
  }
  function scrollToEnd(smooth) {
    const t = $("#thread");
    const go = () => t.scrollTo({ top: t.scrollHeight, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
    requestAnimationFrame(go);
    setTimeout(go, 120); // clips settle after first paint and change the height
  }

  /* ---------------- Cards ---------------- */
  function auditCard() {
    const correct = C.FLIP_IDS.filter((id) => state.flip.choices[id] === Q[id].expected).length;
    const resilient = C.REDESIGN_IDS.filter((id) => state.redesign.status[id] === "resilient").length;
    const cold = state.cold.result;

    const flipRows = C.FLIP_IDS.map((id) => {
      const choice = state.flip.choices[id];
      const ok = choice === Q[id].expected;
      return `<li>
        <span class="mark ${ok ? "ok" : "no"}" aria-hidden="true"><i class="ph-bold ${ok ? "ph-check-circle" : "ph-x-circle"}"></i></span>
        <div><b>${Q[id].label}</b><span>You said ${choice ? C.LABEL[choice] : "nothing"}. ${ok ? "Correct" : `It's ${C.LABEL[Q[id].expected].toLowerCase()}`}: ${Q[id].reason.charAt(0).toLowerCase() + Q[id].reason.slice(1)}</span>
        <span class="sr-only">${ok ? "Correct" : "Incorrect"}</span></div>
      </li>`;
    }).join("");

    const redesignRows = C.REDESIGN_IDS.map((id) => {
      const tries = state.redesign.attempts[id];
      const last = tries[tries.length - 1];
      const status = state.redesign.status[id];
      return `<article class="audit-rd">
        <div class="audit-rd-head"><b>${Q[id].label}</b>${badge(status === "resilient" ? "resilient" : "vulnerable")}<span class="audit-meta">${plural(tries.length, "try", "tries")}</span></div>
        <div class="compare">
          <div class="compare-col"><span>Original</span><p>${esc(Q[id].text)}</p></div>
          <div class="compare-col"><span>Your final version</span><p>${last ? esc(last.text) : "Not tested"}</p></div>
        </div>
        ${last ? `<p class="audit-why">${esc(last.note)}</p>` : ""}
      </article>`;
    }).join("");

    return `
      <div class="summary">
        <div class="summary-art">${window.Characters.clip("trio-cheer")}</div>
        <span class="step-eyebrow">Your question audit</span>
        <h2 class="summary-title">You spotted ${correct} of 3, and made ${resilient} of 2 resilient.</h2>
        <section class="audit-block">
          <h3>Flip test <span class="audit-score">${correct} of 3 correct</span></h3>
          <ul class="audit-list">${flipRows}</ul>
        </section>
        <section class="audit-block">
          <h3>Redesign <span class="audit-score">${resilient} of 2 resilient</span></h3>
          ${redesignRows}
        </section>
        ${cold ? `<section class="audit-block">
          <h3>One more, unaided <span class="audit-score">${cold.correct ? "Judged correctly" : "Misjudged"}</span></h3>
          ${unaidedDetail(cold)}
        </section>` : ""}
        <p class="closing-line">Next: take one real question from your own course, and redesign it the same way.</p>
      </div>`;
  }

  function unaidedDetail(r) {
    const q = Q[r.id];
    return `
      <p class="audit-question">${esc(q.text)}</p>
      <div class="audit-pairs"><div><span>You said</span> <b>${C.LABEL[r.choice]}</b></div><div><span>Answer</span> <b>${C.LABEL[q.expected]}</b></div></div>
      <p class="audit-why">${esc(C.explain(r.id, r.choice))}</p>
      ${r.fix ? `<div class="audit-fix">
        <div><span class="audit-meta">Your fix</span> <q>${esc(r.fix)}</q></div>
        <div>${badge(r.fixQuality === "course_specific" ? "resilient" : "vulnerable", r.fixQuality === "course_specific" ? "Course-specific" : "Too generic")} <span class="audit-meta">${esc(r.fixNote)}</span></div>
      </div>` : ""}`;
  }

  function practiceCard(r) {
    return `<div class="practice-card">
      <div class="audit-rd-head"><b>${Q[r.id].label}</b><span class="not-scored">Not scored</span>
        ${badge(r.correct ? "resilient" : "vulnerable", r.correct ? "Judged correctly" : "Misjudged")}</div>
      ${unaidedDetail(r)}
    </div>`;
  }

  /* ==========================================================
     DOCK — the one place the learner acts
     ========================================================== */
  const dock = () => $("#dock");

  function renderDock() {
    const d = dock();
    $("#stage-label").textContent = STAGE_LABEL[state.stage];
    document.body.dataset.stage = state.stage;
    const view = DOCK[state.stage];
    const inner = view.html();
    d.innerHTML = inner.includes("dock-bare") ? inner : `<div class="dock-inner">${inner}</div>`;
    d.classList.toggle("busy", busy);
    view.bind && view.bind(d);
  }

  function bare(label, name, icon = arrow) {
    return `<div class="dock-bare"><button type="button" class="primary-cta" data-action="${name}">${label} ${icon}</button></div>`;
  }
  const onClick = (d, name, fn) => $(`[data-action="${name}"]`, d).addEventListener("click", fn);

  /** The question in a composer, sent the way a student would paste it into an AI tool. */
  function askCard(text, meta) {
    return `
      <div class="composer">
        <div class="ask-text">${esc(text)}</div>
        <div class="composer-foot">
          <span class="ask-meta">${meta}</span>
          <button type="button" class="send send-wide" data-action="ask" ${busy ? "disabled" : ""}>
            ${busy ? `<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">Asking</span>` : `Ask AI <i class="ph-bold ph-arrow-up" aria-hidden="true"></i>`}
          </button>
        </div>
      </div>`;
  }

  function composer({ id, value, placeholder, label, used, total }) {
    const left = total - used;
    return `
      <div class="composer${busy ? " is-busy" : ""}">
        <label class="sr-only" for="${id}">${label}</label>
        <textarea id="${id}" rows="1" placeholder="${esc(placeholder)}" spellcheck="true" ${busy ? "disabled" : ""}>${esc(value)}</textarea>
        <div class="composer-foot">
          <span class="tries" role="img" aria-label="${left} ${left === 1 ? "try" : "tries"} left">
            ${Array.from({ length: total }, (_, n) => `<i class="${n < used ? "used" : ""}"></i>`).join("")}
            ${left} ${left === 1 ? "try" : "tries"} left
          </span>
          <button type="button" class="send" data-action="send" aria-label="Test it" disabled>
            ${busy ? `<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>` : `<i class="ph-bold ph-arrow-up" aria-hidden="true"></i>`}
          </button>
        </div>
      </div>`;
  }

  function bindComposer(root, onDraft, onSend) {
    const ta = $("textarea", root);
    const btn = $('[data-action="send"]', root);
    const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, ta.offsetWidth * 0.4) + "px"; };
    const refresh = () => { btn.disabled = busy || !ta.value.trim(); };
    ta.addEventListener("input", () => { onDraft(ta.value); grow(); refresh(); save(); });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!btn.disabled) onSend(ta.value.trim()); }
    });
    btn.addEventListener("click", () => { if (!btn.disabled) onSend(ta.value.trim()); });
    grow(); refresh();
    if (!busy) setTimeout(() => { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); }, 60);
  }

  /** Vulnerable / Resilient, each with its meaning. Optional fix field for the unaided questions. */
  function judgeHtml({ value, withFix, fix, submitLabel }) {
    const needsFix = withFix && value === "vulnerable";
    const ready = value && (!needsFix || fix.trim().length >= 2);
    return `
      <p class="judge-q" id="judge-q">Is this question…</p>
      <div class="judge-options" role="radiogroup" aria-labelledby="judge-q">
        ${["vulnerable", "resilient"].map((v) => `
          <button type="button" role="radio" class="judge-opt" data-val="${v}" aria-checked="${value === v}"
            tabindex="${value ? (value === v ? 0 : -1) : (v === "vulnerable" ? 0 : -1)}">
            <span class="judge-radio" aria-hidden="true"></span>
            <span class="judge-text"><b>${C.LABEL[v]}</b><small>${C.DEFINITION[v]}</small></span>
          </button>`).join("")}
      </div>
      ${needsFix ? `
        <label class="fix-label" for="fix-input">Your course-specific fix</label>
        <textarea id="fix-input" class="fix-input" rows="2" spellcheck="true">${esc(fix)}</textarea>` : ""}
      <div class="dock-row"><button type="button" class="primary-cta" data-action="confirm" ${ready ? "" : "disabled"}>${submitLabel} ${arrow}</button></div>`;
  }

  function bindJudge(d, { get, set, withFix, getFix, setFix, onConfirm }) {
    const confirm = $('[data-action="confirm"]', d);
    const opts = [...d.querySelectorAll(".judge-opt")];
    opts.forEach((b, idx) => {
      b.addEventListener("click", () => {
        if (get() === b.dataset.val) return;
        set(b.dataset.val);
        save();
        renderDock(); // shows or hides the fix field
        const again = $(`.judge-opt[data-val="${b.dataset.val}"]`, dock());
        if (again) again.focus({ preventScroll: true });
      });
      b.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        opts[1 - idx].click();
      });
    });
    const fixEl = $("#fix-input", d);
    if (withFix && fixEl) {
      const grow = () => { fixEl.style.height = "auto"; fixEl.style.height = Math.min(fixEl.scrollHeight, fixEl.offsetWidth * 0.3) + "px"; };
      fixEl.addEventListener("input", () => {
        setFix(fixEl.value);
        confirm.disabled = fixEl.value.trim().length < 2;
        grow(); save();
      });
      grow();
    }
    confirm.addEventListener("click", () => {
      if (confirm.disabled) return;
      onConfirm(get(), withFix ? getFix() : "");
    });
  }

  /** Record an unaided judgement. The fix is assessed silently; nothing is shown until the audit. */
  function unaidedResult(id, choice, fix) {
    const q = Q[id];
    const withFix = choice === "vulnerable" ? fix.trim() : null;
    const assessed = withFix ? E.evaluateFix(withFix) : null;
    return {
      id, choice, fix: withFix,
      correct: choice === q.expected,
      fixQuality: assessed ? assessed.quality : "not_applicable",
      fixNote: assessed ? assessed.note : "",
      submittedAt: new Date().toISOString()
    };
  }

  const DOCK = {
    intro: {
      html: () => bare("Start the audit", "start"),
      bind: (d) => onClick(d, "start", () => setStage("flip-ask"))
    },

    "flip-ask": {
      html: () => askCard(Q[C.FLIP_IDS[state.flip.index]].text, `Question ${state.flip.index + 1} of 3 · send it as a student would`),
      bind: (d) => onClick(d, "ask", () => {
        if (busy) return;
        const id = C.FLIP_IDS[state.flip.index];
        if (!state.flip.asked.includes(id)) state.flip.asked.push(id);
        save();
        syncThread(true).then(() => { announce(`Sage replied: ${Q[id].reply}`); setStage("flip-judge"); });
      })
    },

    "flip-judge": {
      html: () => judgeHtml({ value: state.flip.draft, submitLabel: "Confirm judgement" }),
      bind: (d) => bindJudge(d, {
        get: () => state.flip.draft,
        set: (v) => (state.flip.draft = v),
        onConfirm: (choice) => {
          const id = C.FLIP_IDS[state.flip.index];
          if (state.flip.choices[id]) return;
          state.flip.choices[id] = choice;
          state.flip.draft = null;
          const last = state.flip.index === C.FLIP_IDS.length - 1;
          if (!last) state.flip.index += 1;
          const ok = choice === Q[id].expected;
          announce(ok ? `Yes, ${Q[id].expected}. ${Q[id].feedback}` : `Not quite. This one is ${Q[id].expected}. ${Q[id].feedback}`);
          setStage(last ? "flip-done" : "flip-ask");
        }
      })
    },

    "flip-done": {
      html: () => bare("Redesign the weak ones", "next"),
      bind: (d) => onClick(d, "next", () => setStage("redesign"))
    },

    redesign: {
      html: () => {
        const id = C.REDESIGN_IDS[state.redesign.index];
        return composer({
          id: "redesign-input", value: state.redesign.drafts[id], placeholder: "Redesign the question…",
          label: `Your redesign of: ${Q[id].text} Two tries.`, used: state.redesign.attempts[id].length, total: MAX_TRIES
        });
      },
      bind: (d) => {
        const id = C.REDESIGN_IDS[state.redesign.index];
        bindComposer(d, (v) => (state.redesign.drafts[id] = v), (text) => sendRedesign(id, text));
      }
    },

    "redesign-done": {
      html: () => bare(state.redesign.index === 0 ? "Next question" : "Continue", "next"),
      bind: (d) => onClick(d, "next", () => {
        if (state.redesign.index === 0) { state.redesign.index = 1; setStage("redesign"); }
        else setStage("cold-ask");
      })
    },

    "cold-ask": {
      html: () => askCard(Q.water.text, "Send it as a student would"),
      bind: (d) => onClick(d, "ask", () => {
        if (busy) return;
        state.cold.asked = true;
        save();
        syncThread(true).then(() => { announce(`Sage replied: ${Q.water.reply}`); setStage("cold-judge"); });
      })
    },

    "cold-judge": {
      html: () => judgeHtml({ value: state.cold.choice, withFix: true, fix: state.cold.fix, submitLabel: "Submit" }),
      bind: (d) => bindJudge(d, {
        get: () => state.cold.choice,
        set: (v) => (state.cold.choice = v),
        withFix: true,
        getFix: () => state.cold.fix,
        setFix: (v) => (state.cold.fix = v),
        onConfirm: (choice, fix) => {
          if (state.cold.result) return; // locked: one official attempt
          state.cold.result = unaidedResult("water", choice, fix);
          announce("Recorded. You'll see how it went in your audit.");
          setStage("cold-done");
        }
      })
    },

    "cold-done": {
      html: () => bare("See your audit", "next"),
      bind: (d) => onClick(d, "next", () => setStage("end"))
    },

    end: { html: () => endDock(true), bind: (d) => bindEnd(d) },

    "practice-ask": {
      html: () => askCard(Q[state.practice.active].text, "Extra practice · send it as a student would"),
      bind: (d) => onClick(d, "ask", () => {
        if (busy) return;
        state.practice.asked = true;
        save();
        syncThread(true).then(() => setStage("practice-judge"));
      })
    },

    "practice-judge": {
      html: () => judgeHtml({ value: state.practice.choice, withFix: true, fix: state.practice.fix, submitLabel: "Submit practice" }),
      bind: (d) => bindJudge(d, {
        get: () => state.practice.choice,
        set: (v) => (state.practice.choice = v),
        withFix: true,
        getFix: () => state.practice.fix,
        setFix: (v) => (state.practice.fix = v),
        onConfirm: (choice, fix) => {
          const id = state.practice.active;
          if (!id || state.practice.results.some((r) => r.id === id)) return;
          state.practice.results.push(unaidedResult(id, choice, fix));
          state.practice.active = null;
          announce("Practice recorded. Your official result hasn't changed.");
          setStage(state.complete ? "closed" : "end");
        }
      })
    },

    closed: { html: () => endDock(false), bind: (d) => bindEnd(d) }
  };

  function endDock(canFinish) {
    const left = practiceLeft().length;
    return `<div class="dock-bare">
      ${left ? `<button type="button" class="ghost-btn" data-action="practice" aria-describedby="practice-note">Practice again <small id="practice-note">Optional · doesn't change your result</small></button>` : `<span class="dock-note">All practice questions done</span>`}
      ${canFinish
        ? `<button type="button" class="primary-cta" data-action="finish">Finish ${arrow}</button>`
        : `<button type="button" class="ghost-btn" data-action="replay"><i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i>Start again</button>`}
    </div>`;
  }

  function bindEnd(d) {
    const practice = $('[data-action="practice"]', d);
    if (practice) practice.addEventListener("click", () => {
      const next = practiceLeft()[0];
      if (!next) return;
      Object.assign(state.practice, { active: next, asked: false, choice: null, fix: "" });
      setStage("practice-ask");
    });
    const finish = $('[data-action="finish"]', d);
    if (finish) finish.addEventListener("click", () => {
      state.complete = true;
      setStage("closed");
      announce("Finished. Your audit has been recorded.");
      try {
        if (window.parent && window.parent !== window) window.parent.postMessage({ type: "spot-the-weak-question:complete", result: result() }, "*");
      } catch (e) { /* not embedded */ }
    });
    const replay = $('[data-action="replay"]', d);
    if (replay) replay.addEventListener("click", () => {
      state = freshState();
      save();
      host().innerHTML = "";
      syncThread(false);
      renderDock();
      $("#thread").scrollTo({ top: 0 });
    });
  }

  function sendRedesign(id, text) {
    const tries = state.redesign.attempts[id];
    if (busy || !text || state.redesign.status[id] !== "pending" || tries.length >= MAX_TRIES) return;

    // Not a redesign: Sage answers in character and no try is used
    const verdict = window.Intent.check(text, { id, label: Q[id].label, original: Q[id].text, tested: tries.map((a) => a.text) });
    if (verdict) {
      state.asides.push({ qid: id, after: tries.length, prompt: text, message: verdict.message });
      if (["chatty", "asking", "unreadable"].includes(verdict.kind)) state.redesign.drafts[id] = "";
      save();
      syncThread(true).then(() => { announce(verdict.message); renderDock(); });
      return;
    }

    const r = E.evaluateRedesign(text, id);
    tries.push({ text, verdict: r.verdict, reason: r.reason, note: r.note, reply: r.reply });
    const status = r.verdict === "resilient" ? "resilient" : tries.length >= MAX_TRIES ? "unresolved" : "pending";
    state.redesign.status[id] = status;
    save();
    syncThread(true).then(() => {
      const left = MAX_TRIES - tries.length;
      announce(`${r.verdict === "resilient" ? "Resilient" : "Still vulnerable"}. ${r.note} ${status === "pending" ? `${left} ${left === 1 ? "try" : "tries"} left.` : ""}`);
      if (status === "pending") renderDock(); else setStage("redesign-done");
    });
  }

  function setStage(stage) {
    state.stage = stage;
    save();
    syncThread(true).then(() => {
      renderDock();
      const first = $("button:not([disabled]), textarea", dock());
      if (first && !$("textarea", dock())) first.focus({ preventScroll: true });
    });
  }

  /* ---------------- Boot ---------------- */
  $("#replay-walkthrough").addEventListener("click", () => window.Walkthrough.run().then(() => {
    const b = $("button, textarea", dock()); if (b) b.focus({ preventScroll: true });
  }));
  load();
  const resumed = state.stage !== "intro";
  syncThread(false);
  if (resumed) window.addEventListener("load", () => scrollToEnd(false), { once: true });
  renderDock();
  save();

  window.SpotWeak = {
    resumed,
    // Opener → loading → walkthrough → loading → simulation. A returning learner goes straight in.
    start: async () => {
      const params = new URLSearchParams(location.search);
      if (!resumed && !params.has("nowalk") && window.Walkthrough) {
        await window.Walkthrough.loader();
        await window.Walkthrough.run();
        await window.Walkthrough.loader(1300);
      }
      if (!resumed) scrollToStart();
      const b = $("button, textarea", dock());
      if (b) b.focus({ preventScroll: true });
    },
    reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    get state() { return state; },
    get result() { return result(); }
  };
})();
