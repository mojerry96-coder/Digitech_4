/* ==========================================================
   Keeps browser zoom working under uniform scaling.
   --px is sized from the page width, and zooming in shrinks that
   width, which would cancel the zoom out. Track the zoom level as
   the change in devicePixelRatio since load and feed it into --px.
   Limits: Safari doesn't change devicePixelRatio on zoom, and a page
   first loaded already zoomed treats that level as 100%.
   ========================================================== */
(function () {
  "use strict";
  const root = document.documentElement;
  const base = window.devicePixelRatio || 1;
  const update = () => {
    const zoom = Math.max(1, (window.devicePixelRatio || 1) / base);
    root.style.setProperty("--zoom", zoom.toFixed(3));
  };
  update();
  window.addEventListener("resize", update);
})();
