/* ==========================================================
   OPENER — each logo fades in at its own place in the line and
   the row re-centres as each one joins. ~4.5s, skippable.
   From Fix the Prompt; hands over to window.SpotWeak.start().
   ========================================================== */
(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const row = intro.querySelector(".intro-logos");
  const logos = [...intro.querySelectorAll(".intro-logo")];
  const beginBtn = intro.querySelector(".intro-begin");
  const skipBtn = intro.querySelector(".intro-skip");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const timers = [];
  let finished = false;
  let shownCount = 1;

  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  /**
   * Slide the row so the logos that have arrived sit centred on screen.
   * Layout positions only: getBoundingClientRect would include the entry scale.
   * The row is transformed, so some browsers measure logo offsets from the row itself.
   */
  function centreOn(count) {
    const shown = logos.slice(0, Math.max(count, 1));
    const first = shown[0];
    const last = shown[shown.length - 1];
    const mid = (first.offsetLeft + last.offsetLeft + last.offsetWidth) / 2;
    const rowMid = (first.offsetParent === row ? 0 : row.offsetLeft) + row.offsetWidth / 2;
    row.style.setProperty("--shift", `${rowMid - mid}px`);
  }

  function showBegin() {
    timers.forEach(clearTimeout);
    logos.forEach((el) => el.classList.add("in", "set"));
    shownCount = logos.length;
    centreOn(logos.length);
    intro.classList.add("st-line", "st-title", "st-begin");
    beginBtn.focus({ preventScroll: true });
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    window.SpotWeak && window.SpotWeak.start();
    intro.classList.add("out");
    setTimeout(() => { intro.classList.add("gone"); intro.setAttribute("aria-hidden", "true"); }, reduced ? 0 : 700);
  }

  beginBtn.addEventListener("click", finish);
  skipBtn.addEventListener("click", showBegin);
  document.addEventListener("keydown", (e) => {
    if (finished || e.key !== "Escape") return;
    e.preventDefault();
    showBegin();
  });
  window.addEventListener("resize", () => centreOn(shownCount));

  // Dev link, or returning mid-session: bypass the opener entirely
  const resumed = window.SpotWeak && window.SpotWeak.resumed;
  if (params.has("skipintro") || resumed) {
    finish();
    intro.classList.add("gone");
    return;
  }

  if (reduced) { showBegin(); return; }

  function play() {
    if (finished) return;
    centreOn(1);
    const ENTER = 350, GAP = 1000, HOLD = 700;
    logos.forEach((el, i) => {
      at(ENTER + i * GAP, () => {
        shownCount = i + 1;
        centreOn(shownCount); // the row slides; the newcomer fades in beside it
        el.classList.add("in");
      });
      at(ENTER + i * GAP + HOLD, () => el.classList.add("set"));
    });
    const settled = ENTER + (logos.length - 1) * GAP + HOLD;
    at(settled + 500, () => intro.classList.add("st-line"));
    at(settled + 750, () => intro.classList.add("st-title"));
    at(settled + 1400, () => { intro.classList.add("st-begin"); beginBtn.focus({ preventScroll: true }); });
  }

  // The logos must be laid out before the centre offsets mean anything.
  const imgs = [...intro.querySelectorAll(".intro-logo img")];
  Promise.all(imgs.map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })))
    .then(() => setTimeout(play, 0));
})();
