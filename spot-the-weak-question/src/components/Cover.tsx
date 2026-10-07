import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

type CoverMedia = { src: string; poster?: string } | null;
/** Future approved silent motion graphic. No asset exists yet; keep null until supplied. */
export const COVER_MEDIA: CoverMedia = null;

type Props = { reducedMotion: boolean; focusStart: boolean; onStart: () => void };

export function Cover({ reducedMotion, focusStart, onStart }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const startedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const media = COVER_MEDIA;
  const canAnimate = Boolean(media) && !reducedMotion && !failed;

  useEffect(() => {
    if (!focusStart) return;
    // Wait a frame so the shell's inert attribute has been removed first.
    const raf = requestAnimationFrame(() => startRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [focusStart]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canAnimate) return;
    const sync = () => {
      if (document.hidden || paused) video.pause();
      else void video.play().catch(() => setPaused(true));
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [canAnimate, paused]);

  const begin = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    videoRef.current?.pause();
    onStart();
  };

  return (
    <section className="cover" aria-labelledby="cover-title">
      {canAnimate && media ? (
        <video
          ref={videoRef}
          className="cover-media"
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setFailed(true)}
        />
      ) : media?.poster && !posterFailed ? (
        <img className="cover-media" src={media.poster} alt="" aria-hidden="true" onError={() => setPosterFailed(true)} />
      ) : null}
      {media && <div className="cover-scrim" aria-hidden="true" />}

      {!media && (
        <div className="cover-art" aria-hidden="true">
          <div className="paper paper--1">Define market segmentation.</div>
          <div className="paper paper--2">List the noble gases.</div>
          <div className="paper paper--3">
            Using the primary source document we analysed in week six, explain why the author's account differs
            from the textbook version.
          </div>
        </div>
      )}

      <div className="cover-content content-enter">
        <p className="cover-eyebrow">The Flip-Test Challenge</p>
        <h1 id="cover-title" className="cover-title">
          Spot the Weak Question
        </h1>
        <p className="cover-copy">Before any of these go in front of a student, run the test you saw in the video. Ready?</p>
        <button ref={startRef} className="primary-button cover-start" type="button" onClick={begin}>
          Start the Audit <ArrowRight />
        </button>
      </div>

      {canAnimate && (
        <button className="secondary-button cover-pause" type="button" onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume background animation" : "Pause background animation"}
        </button>
      )}
    </section>
  );
}
