"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { calculateFinancials, calculateBudgetStatuses, formatCurrency } from "@/lib/calculations";
import { Card, CardBody } from "@/components/ui/Card";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { SplitType } from "@/lib/types";
import clsx from "clsx";

const ICON_OPTIONS = ["home", "zap", "wifi", "car", "phone", "shopping-cart", "utensils", "wallet"];
const CATEGORY_OPTIONS = ["Housing", "Utilities", "Food", "Transport", "Health", "Other"];

function splitOptions(n1: string, n2: string): { value: SplitType; label: string; desc: string }[] {
  return [
    { value: "Individual_1", label: `${n1} Only`, desc: `100% on ${n1}` },
    { value: "Individual_2", label: `${n2} Only`, desc: `100% on ${n2}` },
    { value: "Shared", label: "Shared", desc: "Split by ratio" },
  ];
}

const emptyForm = {
  name: "",
  amount: "",
  splitType: "Shared" as SplitType,
  icon: "home",
  category: "Housing",
};

function splitBadge(splitType: SplitType, n1: string, n2: string) {
  if (splitType === "Shared") return { label: "Shared", cls: "bg-blue-50 text-blue-600" };
  if (splitType === "Individual_2") return { label: n2, cls: "bg-violet-50 text-violet-600" };
  return { label: n1, cls: "bg-emerald-50 text-emerald-600" };
}

export default function ExpensesPage() {
  const { data, addFixedExpense, removeFixedExpense, updateFixedExpense, addBudget, updateBudget, removeBudget } = useStore();
  const summary = calculateFinancials(data);
  const budgetStatuses = calculateBudgetStatuses(data);

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SplitType>("all");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm, editingId]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(id: string) {
    const exp = data.fixedExpenses.find((e) => e.id === id);
    if (!exp) return;
    setForm({
      name: exp.name,
      amount: String(exp.amount),
      splitType: exp.splitType,
      icon: exp.icon,
      category: exp.category,
    });
    setEditingId(id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const payload = {
      name: form.name,
      amount: parseFloat(form.amount),
      splitType: form.splitType,
      icon: form.icon,
      category: form.category,
    };
    if (editingId) {
      updateFixedExpense(editingId, payload);
    } else {
      addFixedExpense({ id: `exp_${Date.now()}`, ...payload });
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const filtered = filter === "all" ? data.fixedExpenses : data.fixedExpenses.filter((e) => e.splitType === filter);

  // Budget manager: categories present in expenses without a budget can have one added
  const categoriesInUse = Array.from(new Set(data.fixedExpenses.map((e) => e.category)));
  const budgetedCategories = new Set(data.budgets.map((b) => b.category));
  const unbudgeted = categoriesInUse.filter((c) => !budgetedCategories.has(c));

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Manage</p>
          <h1 className="text-3xl font-bold text-slate-900">Fixed Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your recurring monthly costs</p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : openAdd())}
          className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Expense
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div ref={formRef} className="scroll-mt-24">
        <Card className="mb-6 border-slate-200">
          <CardBody>
            <h2 className="text-base font-bold text-slate-800 mb-4">
              {editingId ? "Edit Expense" : "New Fixed Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Expense Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rent, Groceries..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Monthly Amount ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={clsx(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        form.category === cat ? "bg-black text-white border-black" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split type */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Split Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {splitOptions(summary.user1Name, summary.user2Name).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, splitType: opt.value })}
                      className={clsx(
                        "border rounded-2xl p-3 text-left transition-all",
                        form.splitType === opt.value
                          ? "border-black bg-black text-white"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      )}
                    >
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className={clsx("text-[10px] mt-0.5", form.splitType === opt.value ? "text-slate-300" : "text-slate-400")}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={clsx(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                        form.icon === icon ? "bg-black" : "bg-slate-100 hover:bg-slate-200"
                      )}
                    >
                      <BrandIcon name={icon} color={form.icon === icon ? "white" : "#64748B"} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-black text-white text-sm font-semibold py-2.5 rounded-full hover:bg-slate-800 transition-colors">
                  {editingId ? "Save Changes" : "Add Expense"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: `${summary.user1Name} Individual`, value: summary.user1Individual, color: "bg-blue-50", text: "text-blue-700" },
          { label: `${summary.user2Name} Individual`, value: summary.user2Individual, color: "bg-violet-50", text: "text-violet-700" },
          { label: "Total Shared", value: summary.totalShared, color: "bg-emerald-50", text: "text-emerald-700" },
        ].map((item) => (
          <div key={item.label} className={clsx("rounded-3xl p-4 text-center", item.color)}>
            <p className={clsx("text-xl font-extrabold tabular-nums", item.text)}>{formatCurrency(item.value)}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Budget manager */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Budgets</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">Category Spending Caps</p>
            </div>
          </div>

          {budgetStatuses.length === 0 && unbudgeted.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Add expenses to start setting budgets.</p>
          ) : (
            <div className="space-y-3">
              {budgetStatuses.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 w-24 shrink-0">{b.category}</span>
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, b.pct)}%`,
                          backgroundColor: b.overBudget ? "#F97316" : b.pct >= 85 ? "#F59E0B" : "#10B981",
                        }}
                      />
                    </div>
                    <p className={clsx("text-[10px] mt-0.5", b.overBudget ? "text-orange-500 font-medium" : "text-slate-400")}>
                      {formatCurrency(b.spent)} spent · {b.overBudget ? `${formatCurrency(b.spent - b.cap)} over` : `${formatCurrency(b.cap - b.spent)} left`}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={b.cap}
                      onChange={(e) => updateBudget(b.id, { cap: parseFloat(e.target.value) || 0 })}
                      className="w-24 border border-slate-200 rounded-xl pl-5 pr-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 tabular-nums"
                    />
                  </div>
                  <button
                    onClick={() => removeBudget(b.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 shrink-0"
                  >
                    <BrandIcon name="trash" color="currentColor" size={13} />
                  </button>
                </div>
              ))}

              {/* Add budget for unbudgeted categories */}
              {unbudgeted.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-400">Set a cap for:</span>
                  {unbudgeted.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => addBudget({ id: `bud_${Date.now()}_${cat}`, category: cat, cap: 500 })}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "All" },
          { key: "Shared", label: "Shared" },
          { key: "Individual_1", label: summary.user1Name },
          { key: "Individual_2", label: summary.user2Name },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
              filter === tab.key ? "bg-black text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expense list */}
      <Card>
        <CardBody className="!py-2">
          {data.fixedExpenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Add your rent, utilities, groceries and other recurring costs to see your 60/40 split."
              action={
                <button onClick={openAdd} className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
                  Add your first expense
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No expenses in this category.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((exp) => {
                const badge = splitBadge(exp.splitType, summary.user1Name, summary.user2Name);
                const burden60 = exp.splitType === "Shared" ? exp.amount * data.splitRatioUser1 : exp.amount;
                const burden40 = exp.splitType === "Shared" ? exp.amount * (1 - data.splitRatioUser1) : null;

                return (
                  <div key={exp.id} className="flex items-center gap-4 py-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      <BrandIcon name={exp.icon} color="#64748B" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 truncate">{exp.name}</span>
                        <span className={clsx("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", badge.cls)}>{badge.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{exp.category}</p>
                    </div>

                    {exp.splitType === "Shared" ? (
                      <div className="flex gap-3 text-right">
                        <div className="hidden sm:block">
                          <p className="text-[10px] text-blue-400 font-medium">{summary.user1Initial} ({summary.splitPctUser1}%)</p>
                          <p className="text-sm font-bold text-slate-700">{formatCurrency(burden60)}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[10px] text-violet-400 font-medium">{summary.user2Initial} ({summary.splitPctUser2}%)</p>
                          <p className="text-sm font-bold text-slate-700">{formatCurrency(burden40!)}</p>
                        </div>
                        <div className="sm:border-l border-slate-100 sm:pl-3">
                          <p className="text-[10px] text-slate-400 font-medium">Total</p>
                          <p className="text-sm font-bold text-slate-800">{formatCurrency(exp.amount)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(exp.amount)}</p>
                        <p className="text-xs text-slate-400">per month</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(exp.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-300 hover:text-slate-600"
                        aria-label="Edit"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFixedExpense(exp.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-slate-300 hover:text-red-400"
                        aria-label="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
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
