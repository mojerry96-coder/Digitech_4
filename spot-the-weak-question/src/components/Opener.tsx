// MIVA shell opener, ported from opener/reference (Fix the Prompt) and retitled.
// The row slides so whatever logos have arrived stay centred; logos never fly.

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

const LOGOS = [
  { cls: "lg-ekiti", src: "/logos/ekiti.svg", alt: "Government of Ekiti State, Nigeria" },
  { cls: "lg-miva", src: "/logos/miva.svg", alt: "MIVA Open University" },
  { cls: "lg-tof", src: "/logos/tof.svg", alt: "Tunji Olowolafe Foundation" },
];

type Props = { reducedMotion: boolean; onGone: () => void };

export function Opener({ reducedMotion, onGone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const beginRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const shownCount = useRef(1);
  const finished = useRef(false);

  const [logoState, setLogoState] = useState<("" | "in" | "in set")[]>(["", "", ""]);
  const [stage, setStage] = useState({ line: false, title: false, begin: false, out: false });

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  /** Layout positions only: getBoundingClientRect would include the entry scale. */
  const centreOn = useCallback((count: number) => {
    const row = rowRef.current;
    const shown = logoRefs.current.slice(0, Math.max(count, 1)).filter(Boolean) as HTMLSpanElement[];
    if (!row || shown.length === 0) return;
    const first = shown[0];
    const last = shown[shown.length - 1];
    const mid = (first.offsetLeft + last.offsetLeft + last.offsetWidth) / 2;
    // Logo offsets may be measured from the row itself (it is transformed) or from its parent.
    const rowMid = (first.offsetParent === row ? 0 : row.offsetLeft) + row.offsetWidth / 2;
    row.style.setProperty("--shift", `${rowMid - mid}px`);
  }, []);

  const showBegin = useCallback(() => {
    clearTimers();
    shownCount.current = LOGOS.length;
    setLogoState(["in set", "in set", "in set"]);
    centreOn(LOGOS.length);
    setStage({ line: true, title: true, begin: true, out: false });
  }, [centreOn]);

  useEffect(() => {
    if (stage.begin) beginRef.current?.focus({ preventScroll: true });
  }, [stage.begin]);

  // Start only once all three logos have loaded, so the measurements are real.
  useLayoutEffect(() => {
    if (reducedMotion) {
      showBegin();
      return;
    }
    let cancelled = false;
    const imgs = Array.from(rootRef.current?.querySelectorAll<HTMLImageElement>(".intro-logo img") ?? []);
    Promise.all(
      imgs.map((img) =>
        img.complete ? null : new Promise<void>((r) => { img.onload = img.onerror = () => r(); }),
      ),
    ).then(() =>
      requestAnimationFrame(() => {
        if (cancelled || finished.current) return;
        centreOn(1);
        const ENTER = 350, GAP = 1000, HOLD = 700;
        LOGOS.forEach((_, i) => {
          at(ENTER + i * GAP, () => {
            shownCount.current = i + 1;
            centreOn(i + 1);
            setLogoState((s) => s.map((v, j) => (j === i ? "in" : v)) as typeof s);
          });
          at(ENTER + i * GAP + HOLD, () =>
            setLogoState((s) => s.map((v, j) => (j === i ? "in set" : v)) as typeof s),
          );
        });
        const settled = ENTER + (LOGOS.length - 1) * GAP + HOLD;
        at(settled + 500, () => setStage((s) => ({ ...s, line: true })));
        at(settled + 750, () => setStage((s) => ({ ...s, title: true })));
        at(settled + 1400, () => setStage((s) => ({ ...s, begin: true })));
      }),
    );
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [reducedMotion, centreOn, showBegin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished.current || e.key !== "Escape") return;
      e.preventDefault();
      showBegin();
    };
    const onResize = () => centreOn(shownCount.current);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [showBegin, centreOn]);

  const begin = () => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    setStage((s) => ({ ...s, out: true }));
    window.setTimeout(onGone, reducedMotion ? 0 : 700);
  };

  const cls = [
    "intro",
    stage.line && "st-line",
    stage.title && "st-title",
    stage.begin && "st-begin",
    stage.out && "out",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={cls} role="dialog" aria-modal="true" aria-label="Spot the Weak Question">
      <div className="intro-motif" aria-hidden="true" />
      <div className="intro-inner">
        <div className="intro-logos" ref={rowRef}>
          {LOGOS.map((logo, i) => (
            <Fragment key={logo.cls}>
              {i > 0 && <span className="intro-rule" aria-hidden="true" />}
              <span
                className={`intro-logo ${logo.cls} ${logoState[i]}`}
                ref={(el) => { logoRefs.current[i] = el; }}
              >
                <img src={logo.src} alt={logo.alt} />
              </span>
            </Fragment>
          ))}
        </div>
        <p className="intro-tagline">Study. Anywhere. Anyone. Anytime.</p>
        <h1 className="intro-title">
          Spot the <span className="accent">Weak</span> Question
        </h1>
        <p className="intro-sub">AI Literacy · Unit 2.4</p>
        <button
          ref={beginRef}
          className="primary-button intro-begin"
          type="button"
          onClick={begin}
          tabIndex={stage.begin ? 0 : -1}
        >
          Begin <ArrowRight />
        </button>
      </div>
      <button className="intro-skip" type="button" onClick={showBegin} tabIndex={stage.begin ? -1 : 0}>
        Skip <kbd>Esc</kbd>
      </button>
    </div>
  );
}
