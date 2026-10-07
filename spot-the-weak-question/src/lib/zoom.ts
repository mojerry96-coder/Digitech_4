// Uniform scaling sizes everything from the page width, which on its own would
// cancel out browser zoom (zooming in shrinks the CSS width, so the scale drops
// by the same amount). This tracks the zoom level as the change in
// devicePixelRatio since load and feeds it back into --px, so Ctrl/Cmd + still
// enlarges content.
//
// Limits: Safari does not change devicePixelRatio on zoom, so there the fix is
// inert. A page that first loads already zoomed treats that level as 100%.

export function installZoomTracking(): () => void {
  const root = document.documentElement;
  const base = window.devicePixelRatio || 1;

  const update = () => {
    const zoom = Math.max(1, (window.devicePixelRatio || 1) / base);
    root.style.setProperty("--zoom", zoom.toFixed(3));
  };

  update();
  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}
