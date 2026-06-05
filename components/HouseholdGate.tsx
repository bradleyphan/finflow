"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

export function HouseholdGate() {
  const { createHousehold, joinHousehold } = useStore();
  const [mode, setMode] = useState<"choose" | "join">("choose");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      await createHousehold();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await joinHousehold(code);
    if (!ok) {
      setError("That code doesn't look right. Codes look like “couple-x4f9z”.");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900">FinFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Your shared financial dashboard</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          {mode === "choose" ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">Set up your household</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Create a shared budget you and your partner can both view and edit from any device.
              </p>

              <button
                onClick={handleCreate}
                disabled={busy}
                className="w-full bg-black text-white text-sm font-semibold py-3 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create a new household"}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <button
                onClick={() => { setMode("join"); setError(null); }}
                className="w-full border border-slate-200 text-slate-700 text-sm font-semibold py-3 rounded-full hover:bg-slate-50 transition-colors"
              >
                Join with a code
              </button>

              <p className="text-xs text-slate-400 mt-5 text-center leading-relaxed">
                One of you creates the household, then shares the code (or link) with the other. You&apos;ll both see the same live budget.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMode("choose"); setError(null); }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <h2 className="text-lg font-bold text-slate-900">Join a household</h2>
              <p className="text-sm text-slate-500 mt-1 mb-5">
                Enter the code your partner shared with you.
              </p>
              <form onSubmit={handleJoin} className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  placeholder="couple-x4f9z"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  disabled={busy || !code.trim()}
                  className="w-full bg-black text-white text-sm font-semibold py-3 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {busy ? "Joining…" : "Join household"}
                </button>
              </form>
            </>
          )}

          {error && (
            <p className="text-xs text-orange-500 font-medium mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
