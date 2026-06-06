"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { DashboardData, Income, Budget, Subscription, FixedExpense, Goal } from "./types";
import { defaultData } from "./data";

const CODE_KEY = "finflow_household";
const LOCAL_DATA_KEY = "finflow_data_v2";
const SAVE_DEBOUNCE_MS = 600;
const POLL_INTERVAL_MS = 12_000;

export type StoreStatus = "loading" | "needsHousehold" | "ready";
export type StoreMode = "remote" | "local";

interface StoreContextType {
  data: DashboardData;
  status: StoreStatus;
  mode: StoreMode;
  householdCode: string | null;
  syncing: boolean;
  // Household management
  createHousehold: () => Promise<string>;
  joinHousehold: (code: string) => Promise<boolean>;
  leaveHousehold: () => void;
  // Mutators
  updateIncome: (income: Income) => void;
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  addFixedExpense: (exp: FixedExpense) => void;
  removeFixedExpense: (id: string) => void;
  updateFixedExpense: (id: string, exp: Partial<FixedExpense>) => void;
  addBudget: (budget: Budget) => void;
  removeBudget: (id: string) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  updateSplitRatio: (ratioUser1: number) => void;
  updateNames: (user1Name: string, user2Name: string) => void;
  addGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Merge persisted/remote data with defaults so new fields never break old saves
function migrate(parsed: Partial<DashboardData> | null | undefined): DashboardData {
  const p = parsed || {};
  return {
    income: {
      ...defaultData.income,
      ...(p.income || {}),
      user1Hourly: { ...defaultData.income.user1Hourly, ...(p.income?.user1Hourly || {}) },
      user2Hourly: { ...defaultData.income.user2Hourly, ...(p.income?.user2Hourly || {}) },
    },
    subscriptions: p.subscriptions ?? defaultData.subscriptions,
    fixedExpenses: p.fixedExpenses ?? defaultData.fixedExpenses,
    budgets: p.budgets ?? defaultData.budgets,
    goals: p.goals ?? defaultData.goals,
    splitRatioUser1: p.splitRatioUser1 ?? defaultData.splitRatioUser1,
    user1Name: p.user1Name ?? defaultData.user1Name,
    user2Name: p.user2Name ?? defaultData.user2Name,
  };
}

function generateCode(): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `couple-${rand}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [status, setStatus] = useState<StoreStatus>("loading");
  const [mode, setMode] = useState<StoreMode>("remote");
  const [householdCode, setHouseholdCode] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const codeRef = useRef<string | null>(null);
  const modeRef = useRef<StoreMode>("remote");
  const dirtyRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Persistence helpers ----
  const saveLocal = useCallback((next: DashboardData) => {
    try {
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const saveRemote = useCallback(async (code: string, next: DashboardData) => {
    setSyncing(true);
    try {
      await fetch("/api/household", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, data: next }),
      });
      dirtyRef.current = false;
    } catch {
      /* keep dirty; will retry on next change */
    } finally {
      setSyncing(false);
    }
  }, []);

  const scheduleSave = useCallback(
    (next: DashboardData) => {
      dirtyRef.current = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (modeRef.current === "local") {
          saveLocal(next);
          dirtyRef.current = false;
        } else if (codeRef.current) {
          void saveRemote(codeRef.current, next);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [saveLocal, saveRemote]
  );

  // Apply a local mutation (updates state + schedules a save)
  const mutate = useCallback(
    (updater: (prev: DashboardData) => DashboardData) => {
      setData((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  // ---- Initial load ----
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Probe whether the backend database is configured
      let dbConfigured = false;
      try {
        const res = await fetch("/api/household?code=probe-check");
        dbConfigured = res.status !== 503;
      } catch {
        dbConfigured = false;
      }

      if (cancelled) return;

      if (!dbConfigured) {
        // Local-only fallback (no shared sync) — load from localStorage
        setMode("local");
        modeRef.current = "local";
        try {
          const raw = localStorage.getItem(LOCAL_DATA_KEY);
          if (raw) setData(migrate(JSON.parse(raw)));
        } catch {
          /* ignore */
        }
        setStatus("ready");
        return;
      }

      // Remote mode
      setMode("remote");
      modeRef.current = "remote";

      // Support invite links: /?join=couple-xxxx
      let joinParam: string | null = null;
      try {
        joinParam = new URLSearchParams(window.location.search).get("join");
      } catch {
        /* ignore */
      }

      const savedCode = localStorage.getItem(CODE_KEY);
      const codeToUse = joinParam || savedCode;

      if (joinParam) {
        // Clean the URL so the token isn't left in the address bar / history
        try {
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          /* ignore */
        }
      }

      if (!codeToUse) {
        setStatus("needsHousehold");
        return;
      }

      await loadHousehold(codeToUse.toLowerCase(), cancelled);
    }

    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHousehold(code: string, cancelled = false) {
    setStatus("loading");
    try {
      const res = await fetch(`/api/household?code=${encodeURIComponent(code)}`);
      const json = await res.json();
      if (cancelled) return;

      codeRef.current = code;
      setHouseholdCode(code);
      try {
        localStorage.setItem(CODE_KEY, code);
      } catch {
        /* ignore */
      }

      if (json.data) {
        setData(migrate(json.data));
      } else {
        // Fresh household — seed with defaults and persist
        setData(defaultData);
        void saveRemote(code, defaultData);
      }
      setStatus("ready");
    } catch {
      if (!cancelled) setStatus("needsHousehold");
    }
  }

  // ---- Polling so both partners see live updates ----
  useEffect(() => {
    if (status !== "ready" || mode !== "remote" || !householdCode) return;

    const id = setInterval(async () => {
      if (dirtyRef.current || syncing) return; // don't clobber pending local edits
      try {
        const res = await fetch(`/api/household?code=${encodeURIComponent(householdCode)}`);
        const json = await res.json();
        if (json.data && !dirtyRef.current) {
          setData(migrate(json.data));
        }
      } catch {
        /* ignore transient errors */
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [status, mode, householdCode, syncing]);

  // ---- Household actions ----
  const createHousehold = useCallback(async (): Promise<string> => {
    const code = generateCode();
    localStorage.setItem(CODE_KEY, code);
    codeRef.current = code;
    setHouseholdCode(code);
    setData(defaultData);
    await saveRemote(code, defaultData);
    setStatus("ready");
    return code;
  }, [saveRemote]);

  const joinHousehold = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const code = rawCode.trim().toLowerCase();
      if (!/^[a-z0-9-]{4,40}$/.test(code)) return false;
      localStorage.setItem(CODE_KEY, code);
      await loadHousehold(code);
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const leaveHousehold = useCallback(() => {
    localStorage.removeItem(CODE_KEY);
    codeRef.current = null;
    setHouseholdCode(null);
    setData(defaultData);
    setStatus("needsHousehold");
  }, []);

  // ---- Mutators ----
  const updateIncome = (income: Income) => mutate((prev) => ({ ...prev, income }));

  const addSubscription = (sub: Subscription) =>
    mutate((prev) => ({ ...prev, subscriptions: [...prev.subscriptions, sub] }));

  const removeSubscription = (id: string) =>
    mutate((prev) => ({ ...prev, subscriptions: prev.subscriptions.filter((s) => s.id !== id) }));

  const updateSubscription = (id: string, sub: Partial<Subscription>) =>
    mutate((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, ...sub } : s)),
    }));

  const addFixedExpense = (exp: FixedExpense) =>
    mutate((prev) => ({ ...prev, fixedExpenses: [...prev.fixedExpenses, exp] }));

  const removeFixedExpense = (id: string) =>
    mutate((prev) => ({ ...prev, fixedExpenses: prev.fixedExpenses.filter((e) => e.id !== id) }));

  const updateFixedExpense = (id: string, exp: Partial<FixedExpense>) =>
    mutate((prev) => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map((e) => (e.id === id ? { ...e, ...exp } : e)),
    }));

  const addBudget = (budget: Budget) =>
    mutate((prev) => ({ ...prev, budgets: [...prev.budgets, budget] }));

  const removeBudget = (id: string) =>
    mutate((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.id !== id) }));

  const updateBudget = (id: string, budget: Partial<Budget>) =>
    mutate((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => (b.id === id ? { ...b, ...budget } : b)),
    }));

  const updateSplitRatio = (ratioUser1: number) => {
    const clamped = Math.min(1, Math.max(0, ratioUser1));
    mutate((prev) => ({ ...prev, splitRatioUser1: clamped }));
  };

  const updateNames = (user1Name: string, user2Name: string) =>
    mutate((prev) => ({ ...prev, user1Name, user2Name }));

  const addGoal = (goal: Goal) =>
    mutate((prev) => ({ ...prev, goals: [...(prev.goals ?? []), goal] }));

  const removeGoal = (id: string) =>
    mutate((prev) => ({ ...prev, goals: (prev.goals ?? []).filter((g) => g.id !== id) }));

  const updateGoal = (id: string, goal: Partial<Goal>) =>
    mutate((prev) => ({
      ...prev,
      goals: (prev.goals ?? []).map((g) => (g.id === id ? { ...g, ...goal } : g)),
    }));

  const resetData = () => mutate(() => defaultData);

  return (
    <StoreContext.Provider
      value={{
        data,
        status,
        mode,
        householdCode,
        syncing,
        createHousehold,
        joinHousehold,
        leaveHousehold,
        updateIncome,
        addSubscription,
        removeSubscription,
        updateSubscription,
        addFixedExpense,
        removeFixedExpense,
        updateFixedExpense,
        addBudget,
        removeBudget,
        updateBudget,
        updateSplitRatio,
        updateNames,
        addGoal,
        removeGoal,
        updateGoal,
        resetData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
