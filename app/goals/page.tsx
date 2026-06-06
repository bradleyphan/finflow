"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateGoalStatuses, formatCurrency, formatMonths } from "@/lib/calculations";
import { GoalKind } from "@/lib/types";
import clsx from "clsx";

const KIND_OPTIONS: { value: GoalKind; label: string; desc: string; color: string }[] = [
  { value: "savings", label: "Savings", desc: "Saving toward a target", color: "#3B82F6" },
  { value: "emergency", label: "Emergency Fund", desc: "Safety net cushion", color: "#10B981" },
  { value: "debt", label: "Debt Payoff", desc: "Paying down a balance", color: "#F59E0B" },
];

const emptyForm = {
  name: "",
  kind: "savings" as GoalKind,
  target: "",
  current: "",
  monthlyContribution: "",
};

function kindMeta(kind: GoalKind) {
  return KIND_OPTIONS.find((k) => k.value === kind) ?? KIND_OPTIONS[0];
}

function kindIcon(kind: GoalKind) {
  if (kind === "emergency") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (kind === "debt") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function GoalsPage() {
  const { data, addGoal, updateGoal, removeGoal } = useStore();
  const goals = calculateGoalStatuses(data);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm, editingId]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(id: string) {
    const g = data.goals.find((x) => x.id === id);
    if (!g) return;
    setForm({
      name: g.name,
      kind: g.kind,
      target: String(g.target),
      current: String(g.current),
      monthlyContribution: String(g.monthlyContribution),
    });
    setEditingId(id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const meta = kindMeta(form.kind);
    const payload = {
      name: form.name.trim() || meta.label,
      kind: form.kind,
      target: parseFloat(form.target) || 0,
      current: parseFloat(form.current) || 0,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      icon: form.kind,
      color: meta.color,
    };
    if (editingId) {
      updateGoal(editingId, payload);
    } else {
      addGoal({ id: `goal_${Date.now()}`, ...payload });
    }
    closeForm();
  }

  // Household roll-up (savings/emergency count toward "saved", debt counts toward "remaining")
  const totalSaved = goals
    .filter((g) => g.kind !== "debt")
    .reduce((s, g) => s + g.current, 0);
  const totalSavingsTarget = goals
    .filter((g) => g.kind !== "debt")
    .reduce((s, g) => s + g.target, 0);
  const debtRemaining = goals
    .filter((g) => g.kind === "debt")
    .reduce((s, g) => s + g.remaining, 0);
  const monthlyCommitted = goals.reduce((s, g) => s + g.monthlyContribution, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Plan ahead</p>
          <h1 className="text-3xl font-bold text-slate-900">Goals &amp; Debt</h1>
          <p className="text-slate-500 text-sm mt-1">Track savings, your emergency fund, and debt payoff</p>
        </div>
        <button
          onClick={showForm ? closeForm : openAdd}
          className="bg-black text-white text-sm font-bold rounded-full px-5 py-2.5 hover:bg-slate-800 transition-colors shrink-0"
        >
          {showForm ? "Close" : "+ Add Goal"}
        </button>
      </div>

      {/* Roll-up stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBox label="Total Saved" value={formatCurrency(totalSaved)} sub={totalSavingsTarget > 0 ? `of ${formatCurrency(totalSavingsTarget)}` : "no targets yet"} tone="emerald" />
        <StatBox label="Savings Target" value={formatCurrency(totalSavingsTarget)} sub="across all goals" tone="blue" />
        <StatBox label="Debt Remaining" value={formatCurrency(debtRemaining)} sub="left to pay off" tone="amber" />
        <StatBox label="Monthly Toward Goals" value={formatCurrency(monthlyCommitted)} sub="committed / mo" tone="violet" />
      </div>

      {/* Add / edit form */}
      {showForm && (
        <div ref={formRef} className="scroll-mt-24 mb-6">
          <Card>
            <CardBody>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">
                {editingId ? "Edit goal" : "New goal"}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Goal type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {KIND_OPTIONS.map((k) => (
                      <button
                        key={k.value}
                        type="button"
                        onClick={() => setForm({ ...form, kind: k.value })}
                        className={clsx(
                          "rounded-2xl border p-3 text-left transition-all",
                          form.kind === k.value ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ color: k.color }}>{kindIcon(k.value)}</span>
                          <span className="text-sm font-bold text-slate-800">{k.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{k.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Name</label>
                  <input
                    type="text"
                    placeholder={form.kind === "debt" ? "e.g. Car Loan" : form.kind === "emergency" ? "e.g. Emergency Fund" : "e.g. House Down Payment"}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MoneyField
                    label={form.kind === "debt" ? "Total balance" : "Target amount"}
                    value={form.target}
                    onChange={(v) => setForm({ ...form, target: v })}
                  />
                  <MoneyField
                    label={form.kind === "debt" ? "Paid off so far" : "Saved so far"}
                    value={form.current}
                    onChange={(v) => setForm({ ...form, current: v })}
                  />
                  <MoneyField
                    label="Monthly contribution"
                    value={form.monthlyContribution}
                    onChange={(v) => setForm({ ...form, monthlyContribution: v })}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" className="bg-black text-white text-sm font-bold rounded-full px-6 py-2.5 hover:bg-slate-800 transition-colors">
                    {editingId ? "Save changes" : "Add goal"}
                  </button>
                  <button type="button" onClick={closeForm} className="text-sm font-semibold text-slate-500 rounded-full px-5 py-2.5 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Goal list */}
      <Card>
        <CardBody>
          {goals.length === 0 ? (
            <EmptyState
              title="No goals yet"
              description="Add a savings goal, emergency fund target, or a debt you're paying down to track your progress."
              action={
                <button onClick={openAdd} className="bg-black text-white text-sm font-bold rounded-full px-5 py-2.5 hover:bg-slate-800 transition-colors">
                  + Add your first goal
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const meta = kindMeta(g.kind);
                return (
                  <div key={g.id} className="rounded-2xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                          {kindIcon(g.kind)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{g.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {g.kind === "debt" ? "Debt payoff" : meta.label}
                            {g.monthlyContribution > 0 && <> · {formatCurrency(g.monthlyContribution)}/mo</>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(g.id)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => removeGoal(g.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(g.current)}
                          <span className="text-xs font-semibold text-slate-400"> / {formatCurrency(g.target)}</span>
                        </span>
                        <span className="text-xs font-bold" style={{ color: g.complete ? "#10B981" : meta.color }}>
                          {g.complete ? "Complete 🎉" : `${Math.round(g.pct)}%`}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${g.pct}%`, backgroundColor: g.complete ? "#10B981" : meta.color }} />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
                        <span>{g.kind === "debt" ? `${formatCurrency(g.remaining)} left to pay` : `${formatCurrency(g.remaining)} to go`}</span>
                        <span>
                          {g.complete
                            ? "Reached"
                            : g.monthsToGoal === null
                            ? "Set a monthly amount for an ETA"
                            : `~${formatMonths(g.monthsToGoal)} at this pace`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function StatBox({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "emerald" | "blue" | "amber" | "violet" }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={clsx("rounded-2xl p-4", tones[tone])}>
      <p className="text-[11px] font-semibold opacity-70">{label}</p>
      <p className="text-xl font-extrabold mt-1 tabular-nums">{value}</p>
      <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
        <input
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-2xl pl-7 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold tabular-nums"
        />
      </div>
    </div>
  );
}
