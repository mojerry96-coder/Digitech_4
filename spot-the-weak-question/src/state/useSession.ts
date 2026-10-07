import { useCallback, useEffect, useRef, useState } from "react";
import { PRACTICE_IDS, type PracticeId } from "../content/questions";
import { createSession, type Session } from "./session";

const STORAGE_KEY = "digitech.swq.session.v1";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.schemaVersion === 1 && typeof parsed.sessionId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function saveSession(s: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: the session still works for this page view */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function shuffledPracticeOrder(): PracticeId[] {
  const ids = [...PRACTICE_IDS];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

export type Updater = (fn: (s: Session) => Session) => void;

/** Holds the learner session and persists every change. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  const update: Updater = useCallback((fn) => {
    setSession((prev) => (prev ? fn(prev) : prev));
  }, []);

  /** Creates the session exactly once, at Start. */
  const start = useCallback(() => {
    setSession((prev) => prev ?? createSession(newId(), shuffledPracticeOrder()));
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return { session, sessionRef, update, start, reset };
}
