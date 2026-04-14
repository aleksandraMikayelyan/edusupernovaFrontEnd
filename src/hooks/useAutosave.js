/**
 * useAutosave — debounced per-question autosave hook.
 *
 * Watches `value`. After `delay` ms of no changes, calls
 * TestsApi.submitAnswer(testId, quizId, value).
 *
 * Does NOT fire if value is blank — avoids marking questions as
 * "answered" with an empty string.
 *
 * Returns saveState: "idle" | "saving" | "saved" | "error"
 * and savedAt: Date | null (timestamp of last successful save).
 */

import { useState, useEffect, useRef } from "react";
import { TestsApi } from "../api/index.js";

export default function useAutosave(testId, quizId, value, delay = 2000) {
  const [saveState, setSaveState] = useState("idle");
  const [savedAt,   setSavedAt]   = useState(null);

  const timerRef   = useRef(null);
  const retryRef   = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    // Clear any pending debounce / retry when inputs change
    clearTimeout(timerRef.current);
    clearTimeout(retryRef.current);

    if (!testId || !quizId || !value || value.trim() === "") return;

    setSaveState("idle");

    timerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      setSaveState("saving");
      try {
        await TestsApi.submitAnswer(testId, quizId, value);
        if (!mountedRef.current) return;
        setSaveState("saved");
        setSavedAt(new Date());
      } catch {
        if (!mountedRef.current) return;
        setSaveState("error");
        // Retry once after 5 s
        retryRef.current = setTimeout(async () => {
          if (!mountedRef.current) return;
          setSaveState("saving");
          try {
            await TestsApi.submitAnswer(testId, quizId, value);
            if (!mountedRef.current) return;
            setSaveState("saved");
            setSavedAt(new Date());
          } catch {
            if (mountedRef.current) setSaveState("error");
          }
        }, 5000);
      }
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(retryRef.current);
    };
  }, [testId, quizId, value, delay]);

  return { saveState, savedAt };
}
