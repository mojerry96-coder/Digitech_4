import { createContext, useContext, useEffect, useRef, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return hidden;
}

/** setTimeout that is cleared automatically on unmount. */
export function useTimers() {
  const timers = useRef(new Set<number>());
  useEffect(() => {
    const set = timers.current;
    return () => set.forEach((t) => clearTimeout(t));
  }, []);
  return (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };
}

/** Moves focus to the element whenever `key` changes, skipping the first render. */
export function useFocusOnChange<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus({ preventScroll: false });
  }, [key]);
  return ref;
}

export const AnnounceContext = createContext<(message: string) => void>(() => {});
export const useAnnounce = () => useContext(AnnounceContext);

export const nowIso = () => new Date().toISOString();

export const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
