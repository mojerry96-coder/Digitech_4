/* ==========================================================
   Loading screen + walkthrough (captions only)
   From Fix the Prompt. Plays the real interface by itself with a
   separate demo question ("Define opportunity cost."), so it shows
   how to play without giving away any assessed answer.
   ========================================================== */
(function (global) {
  "use strict";

  const C = global.Characters;
  const reduced = global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 200) : ms));

  /* ---------------- Loading screen: Tade walking on the spot ---------------- */
  function loader(ms = 1700) {
    const el = document.createElement("div");
    el.className = "scene-loader";
    el.setAttribute("role", "status");
    el.innerHTML = `${C.clip("tade-walk")}<span class="sr-only">Loading</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("in"), 20);
    return wait(ms).then(() => {
      el.classList.remove("in");
      return wait(420);
    }).then(() => el.remove());
  }

  /* ---------------- Walkthrough scenes ---------------- */
  const DEMO_Q = "Define opportunity cost.";
  const DEMO_REPLY = "Opportunity cost is the value of the next best alternative you give up when you make a choice. For example, an hour spent working is an hour you can't spend studying.";
  const DEMO_FIX = "Using the price data from our week-two market survey, what was the stallholder's opportunity cost of switching to rice?";
  const DEMO_FIX_REPLY = "I don't have the data from your week two session, so I can't answer this properly. I could only guess in general terms.";

  const avatar = () => `<span class="avatar" aria-hidden="true"><img src="assets/cast/sage-avatar.png" alt="" /></span>`;
  const DEFS = global.Content.DEFINITION;

  const SCENES = [
    {
      min: 6500,
      caption: "Welcome. Before an exam question goes in front of students, run the flip test: ask AI the question, the way a student would.",
      html: () => `<div class="wt-hero">${C.clip("trio-wave")}</div>`
    },
    {
      min: 9500,
      caption: "Here's an example. AI answers “Define opportunity cost.” instantly and completely, without knowing anything about your course. A student could copy that straight in.",
      html: () => `
        <div class="wt-thread">
          <div class="msg msg-user"><span class="msg-meta">The question</span><div class="bubble">${DEMO_Q}</div></div>
          <div class="msg msg-ai wt-later" data-show="reply">${avatar()}<div class="ai-body"><div class="reply"><p>${DEMO_REPLY}</p></div></div></div>
        </div>`,
      run: async (s) => { await wait(2600); s.show('[data-show="reply"]'); }
    },
    {
      min: 9500,
      caption: "So you judge it. Vulnerable means AI can answer it without your course. Resilient means AI needs something only your class has.",
      html: () => `
        <div class="dock-inner wt-panel">
          <p class="judge-q">Is this question…</p>
          <div class="judge-options">
            ${["vulnerable", "resilient"].map((v) => `
              <button type="button" tabindex="-1" class="judge-opt" data-k="${v}" aria-checked="false">
                <span class="judge-radio" aria-hidden="true"></span>
                <span class="judge-text"><b>${v === "vulnerable" ? "Vulnerable" : "Resilient"}</b><small>${DEFS[v]}</small></span>
              </button>`).join("")}
          </div>
          <div class="dock-row"><button type="button" tabindex="-1" class="primary-cta" data-k="confirm" disabled>Confirm judgement <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></button></div>
        </div>`,
      run: async (s) => {
        await wait(3600); await s.tap('[data-k="vulnerable"]');
        s.q('[data-k="vulnerable"]').setAttribute("aria-checked", "true");
        s.q('[data-k="confirm"]').disabled = false;
        await wait(1400); await s.tap('[data-k="confirm"]');
      }
    },
    {
      min: 12500,
      caption: "Then redesign the weak ones. Make the question depend on something only your class has, like a dataset or a case study, and test it again.",
      html: () => `
        <div class="wt-thread">
          <div class="msg msg-user wt-later" data-show="sent"><span class="msg-meta">Your redesign</span><div class="bubble">${DEMO_FIX}</div></div>
          <div class="msg msg-ai wt-later" data-show="thinking">
            ${avatar()}
            <div class="ai-body"><div class="wt-think">${C.clip("sage-think")}<p class="think-line">Writing an answer…</p></div></div>
          </div>
          <div class="msg msg-ai wt-later" data-show="reply">${avatar()}<div class="ai-body">
            <div class="ai-head"><span class="tier tier-resilient"><i class="ph-fill ph-shield-check" aria-hidden="true"></i>Resilient</span><span class="ai-note">It depends on data only your class has.</span></div>
            <div class="reply"><p>${DEMO_FIX_REPLY}</p></div>
          </div></div>
          <div class="composer wt-composer" data-show="composer">
            <textarea tabindex="-1" rows="3" readonly aria-hidden="true"></textarea>
            <div class="composer-foot">
              <span class="tries" aria-hidden="true"><i></i><i></i>2 tries left</span>
              <button type="button" tabindex="-1" class="send" data-k="send" disabled><i class="ph-bold ph-arrow-up" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>`,
      run: async (s) => {
        await wait(500);
        await s.type("textarea", DEMO_FIX, 4200);
        s.q('[data-k="send"]').disabled = false;
        await s.tap('[data-k="send"]');
        s.hide('[data-show="composer"]');
        s.show('[data-show="sent"]');
        s.show('[data-show="thinking"]');
        await wait(1700);
        s.hide('[data-show="thinking"]');
        s.cursorOff();
        s.show('[data-show="reply"]');
      }
    },
    {
      min: 9500,
      caption: "You'll test three questions with feedback, redesign two with two tries each, then do one more on your own, with no feedback until your audit.",
      html: () => `
        <ol class="wt-plan">
          <li><span class="n">3</span>Run the flip test, with feedback</li>
          <li class="wt-later" data-show="b"><span class="n">2</span>Redesign and retest, two tries each</li>
          <li class="wt-later" data-show="c"><span class="n">1</span>One more, unaided</li>
        </ol>`,
      run: async (s) => { await wait(2400); s.show('[data-show="b"]'); await wait(2400); s.show('[data-show="c"]'); }
    },
    {
      min: 4000, end: true,
      caption: "There's no timer, so take your time. Ready? Let's begin.",
      html: () => `<div class="wt-hero">${C.clip("trio-cheer")}<button type="button" class="primary-cta wt-begin" data-k="begin">Let's begin <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></button></div>`
    }
  ];

  /* ---------------- Video explainer (default) ----------------
     The rendered motion-graphics explainer (swq-explainer-video), voiced,
     with on-by-default captions. The end card's "Let's begin" is a real
     button laid exactly over the drawn one. Falls back to the scripted,
     captioned walkthrough below if the video can't play. */
  const VIDEO_SRC = "assets/video/explainer.mp4";
  const CAPTIONS_SRC = "assets/video/explainer.en.vtt";
  const BEGIN_AT = 29.2; // seconds: the drawn button has landed

  function runVideo() {
    return new Promise((resolve, reject) => {
      const el = document.createElement("div");
      el.className = "wt wt-video";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "How it works");
      el.innerHTML = `
        <div class="wt-top">
          <span class="step-eyebrow">How it works</span>
          <div class="wt-controls">
            <button type="button" class="icon-btn" data-k="mute" aria-pressed="false" aria-label="Mute narration"><i class="ph ph-speaker-high" aria-hidden="true"></i></button>
            <button type="button" class="ghost-btn" data-k="skip">Skip <i class="ph-bold ph-skip-forward" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="wtv-stage">
          <div class="wtv-frame">
            <video playsinline preload="auto" src="${VIDEO_SRC}">
              <track kind="captions" srclang="en" label="English" src="${CAPTIONS_SRC}" default />
            </video>
            <button type="button" class="wtv-begin" data-k="begin" tabindex="-1">Let's begin <i class="ph-bold ph-arrow-right" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="wt-progress" aria-hidden="true"><i></i></div>`;
      document.body.appendChild(el);
      setTimeout(() => el.classList.add("in"), 20);

      const video = el.querySelector("video");
      const begin = el.querySelector('[data-k="begin"]');
      const bar = el.querySelector(".wt-progress i");
      const muteBtn = el.querySelector('[data-k="mute"]');
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        video.pause();
        el.classList.remove("in");
        setTimeout(() => { el.remove(); resolve(); }, reduced ? 0 : 420);
      };
      const setMuted = (m) => {
        video.muted = m;
        muteBtn.setAttribute("aria-pressed", String(m));
        muteBtn.setAttribute("aria-label", m ? "Unmute narration" : "Mute narration");
        muteBtn.innerHTML = `<i class="ph ${m ? "ph-speaker-slash" : "ph-speaker-high"}" aria-hidden="true"></i>`;
      };
      const showBegin = () => {
        if (begin.classList.contains("on")) return;
        begin.classList.add("on");
        begin.tabIndex = 0;
        begin.focus({ preventScroll: true });
      };

      el.querySelector('[data-k="skip"]').addEventListener("click", finish);
      begin.addEventListener("click", finish);
      muteBtn.addEventListener("click", () => setMuted(!video.muted));
      el.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); finish(); } });
      video.addEventListener("timeupdate", () => {
        if (video.duration) bar.style.width = `${(video.currentTime / video.duration) * 100}%`;
        if (video.currentTime >= BEGIN_AT) showBegin();
      });
      video.addEventListener("ended", showBegin);
      video.addEventListener("error", () => {
        if (done) return;
        done = true;
        el.remove();
        reject(new Error("explainer video unavailable"));
      }, { once: true });

      // Captions on by default for the narration.
      if (video.textTracks && video.textTracks[0]) video.textTracks[0].mode = "showing";

      el.querySelector('[data-k="skip"]').focus({ preventScroll: true });
      // Sound plays because the learner has just clicked Begin. If the browser still
      // blocks it, play muted with captions and let them unmute.
      video.play().catch(() => { setMuted(true); video.play().catch(() => {}); });
    });
  }

  function run() {
    return runVideo().catch(() => runScripted());
  }

  /* ---------------- Scripted walkthrough (fallback) ---------------- */
  function runScripted() {
    return new Promise((resolve) => {
      const el = document.createElement("div");
      el.className = "wt";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "How it works");
      el.innerHTML = `
        <div class="wt-top">
          <span class="step-eyebrow">How it works</span>
          <div class="wt-controls">
            <button type="button" class="ghost-btn" data-k="skip">Skip <i class="ph-bold ph-skip-forward" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="wt-stage"></div>
        <div class="wt-bottom">
          <div class="wt-host">${C.clip("kemi-talk")}</div>
          <p class="wt-caption" aria-live="polite"></p>
        </div>
        <div class="wt-progress" aria-hidden="true"><i></i></div>
        <div class="wt-cursor" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z" fill="#fff" stroke="#1C2B6B" stroke-width="1.8" stroke-linejoin="round"/></svg>
        </div>`;
      document.body.appendChild(el);
      setTimeout(() => el.classList.add("in"), 20);

      const stage = el.querySelector(".wt-stage");
      const caption = el.querySelector(".wt-caption");
      const cursor = el.querySelector(".wt-cursor");
      const bar = el.querySelector(".wt-progress i");
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        el.classList.remove("in");
        setTimeout(() => { el.remove(); resolve(); }, reduced ? 0 : 420);
      };

      el.querySelector('[data-k="skip"]').addEventListener("click", finish);
      el.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); finish(); } });

      const helpers = (root) => ({
        root,
        q: (sel) => root.querySelector(sel),
        show: (sel) => root.querySelector(sel)?.classList.add("shown"),
        hide: (sel) => root.querySelector(sel)?.classList.add("gone"),
        cursorOff: () => cursor.classList.remove("on"),
        async tap(sel) {
          const target = root.querySelector(sel);
          if (!target || done) return;
          const r = target.getBoundingClientRect(), o = el.getBoundingClientRect();
          cursor.classList.add("on");
          cursor.style.transform = `translate(${r.left - o.left + r.width / 2 - 6}px, ${r.top - o.top + r.height / 2 - 4}px)`;
          await wait(650);
          cursor.classList.add("press");
          target.classList.add("pressed");
          await wait(220);
          cursor.classList.remove("press");
          target.classList.remove("pressed");
        },
        async type(sel, text, ms) {
          const ta = root.querySelector(sel);
          const step = ms / text.length;
          for (let i = 1; i <= text.length && !done; i++) { ta.value = text.slice(0, i); await wait(step); }
        }
      });

      async function scene(i) {
        if (done) return;
        const sc = SCENES[i];
        stage.classList.remove("enter");
        stage.innerHTML = sc.html();
        void stage.offsetWidth;
        stage.classList.add("enter");
        cursor.classList.remove("on");
        caption.textContent = sc.caption;
        bar.style.width = `${((i + 1) / SCENES.length) * 100}%`;

        const beginBtn = stage.querySelector('[data-k="begin"]');
        if (beginBtn) { beginBtn.addEventListener("click", finish); beginBtn.focus({ preventScroll: true }); }

        const started = performance.now();
        if (sc.run) await sc.run(helpers(stage));
        const left = sc.min - (performance.now() - started);
        if (left > 0) await wait(left);
        if (sc.end) return; // wait for "Let's begin"
        await wait(500);
        if (i + 1 < SCENES.length) scene(i + 1);
      }

      el.querySelector('[data-k="skip"]').focus({ preventScroll: true });
      scene(0);
    });
  }

  global.Walkthrough = { run, loader };
})(window);
