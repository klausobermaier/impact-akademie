import { useCallback, useEffect, useMemo, useState } from "react";
import { MODULES, type AnswerValue } from "./data";

const STORAGE_KEY = "startup-audit-state-v1";

export type AuditState = {
  name: string;
  company: string;
  industry: string;
  stage: string;
  answers: Record<string, AnswerValue>;
  challenges: number[];
  openAnswer: string;
};

const DEFAULT_STATE: AuditState = {
  name: "",
  company: "",
  industry: "",
  stage: "",
  answers: {},
  challenges: [],
  openAnswer: "",
};

export function useAuditState() {
  const [state, setState] = useState<AuditState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state, hydrated]);

  const setAnswer = useCallback((qid: string, val: AnswerValue) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [qid]: val } }));
  }, []);

  const toggleChallenge = useCallback((modId: number) => {
    setState((s) => {
      const exists = s.challenges.includes(modId);
      if (exists) return { ...s, challenges: s.challenges.filter((v) => v !== modId) };
      if (s.challenges.length >= 3) return s;
      return { ...s, challenges: [...s.challenges, modId] };
    });
  }, []);

  const updateField = useCallback(<K extends keyof AuditState>(key: K, value: AuditState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const totalQuestions = useMemo(
    () => MODULES.reduce((n, m) => n + m.questions.length, 0),
    [],
  );
  const answeredCount = Object.keys(state.answers).length;
  const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const moduleStats = useMemo(
    () =>
      MODULES.map((mod) => {
        const vals = mod.questions
          .map((q) => state.answers[q.id])
          .filter((v) => v !== undefined) as AnswerValue[];
        const numeric = vals.filter((v): v is 0 | 1 | 2 | 3 | 4 => v !== "na");
        const naCount = vals.filter((v) => v === "na").length;
        const redCount = numeric.filter((v) => v <= 1).length;
        const avg =
          numeric.length > 0
            ? Number((numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1))
            : null;
        const total = mod.questions.length;
        const redPct = numeric.length > 0 ? Math.round((redCount / numeric.length) * 100) : 0;
        const naPct = total > 0 ? Math.round((naCount / total) * 100) : 0;
        return { mod, avg, redPct, naPct, answered: vals.length, total };
      }),
    [state.answers],
  );

  return {
    state,
    hydrated,
    setAnswer,
    toggleChallenge,
    updateField,
    reset,
    totalQuestions,
    answeredCount,
    progressPct,
    moduleStats,
  };
}
