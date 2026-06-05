"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getDaysUntilDue, getMonthlyAmount } from "@/lib/calculations";
import { FrequencyType, ExpenseCategory } from "@/lib/types";
import clsx from "clsx";

const emptyForm = {
  name: "",
  amount: "",
  frequency: "Monthly" as FrequencyType,
  category: "Shared" as ExpenseCategory,
  icon: "netflix",
  color: "#E50914",
  dueDay: "15",
};

const ICON_OPTIONS = [
  { name: "netflix", color: "#E50914" },
  { name: "spotify", color: "#1DB954" },
  { name: "apple", color: "#555555" },
  { name: "hulu", color: "#1CE783" },
  { name: "youtube", color: "#FF0000" },
  { name: "amazon", color: "#FF9900" },
  { name: "gym", color: "#3B82F6" },
  { name: "icloud", color: "#3B82F6" },
];

function categoryOptions(n1: string, n2: string): { value: ExpenseCategory; label: string; cls: string }[] {
  return [
    { value: "Individual_1", label: n1, cls: "bg-blue-50 text-blue-600" },
    { value: "Individual_2", label: n2, cls: "bg-violet-50 text-violet-600" },
    { value: "Shared", label: "Shared", cls: "bg-emerald-50 text-emerald-600" },
  ];
}

export default function SubscriptionsPage() {
  const { data, addSubscription, removeSubscription, updateSubscription } = useStore();
  const CATEGORY_OPTIONS = categoryOptions(data.user1Name, data.user2Name);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
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
    const sub = data.subscriptions.find((s) => s.id === id);
    if (!sub) return;
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      frequency: sub.frequency,
      category: sub.category,
      icon: sub.icon,
      color: sub.color,
      dueDay: String(sub.dueDay),
    });
    setEditingId(id);
    setShowForm(true);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const payload = {
      name: form.name,
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      category: form.category,
      icon: form.icon,
      color: form.color,
      dueDay: parseInt(form.dueDay),
    };
    if (editingId) {
      updateSubscription(editingId, payload);
    } else {
      addSubscription({ id: `sub_${Date.now()}`, ...payload });
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  const totalMonthly = data.subscriptions.reduce((sum, s) => sum + getMonthlyAmount(s), 0);
  const sharedSubs = data.subscriptions.filter((s) => s.category === "Shared");
  const user1Subs = data.subscriptions.filter((s) => s.category === "Individual_1");
  const user2Subs = data.subscriptions.filter((s) => s.category === "Individual_2");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Manage</p>
          <h1 className="text-3xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">Track recurring subscriptions and upcoming due dates</p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : openAdd())}
          className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Monthly", value: formatCurrency(totalMonthly), color: "bg-slate-100 text-slate-700" },
          { label: "Shared Subs", value: `${sharedSubs.length}`, color: "bg-blue-50 text-blue-700" },
          { label: `${data.user1Name} Subs`, value: `${user1Subs.length}`, color: "bg-emerald-50 text-emerald-700" },
          { label: `${data.user2Name} Subs`, value: `${user2Subs.length}`, color: "bg-violet-50 text-violet-700" },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-3xl p-4 text-center", s.color)}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div ref={formRef} className="scroll-mt-24">
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-base font-bold text-slate-800 mb-4">{editingId ? "Edit Subscription" : "New Subscription"}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix, Spotify..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Amount ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Frequency</label>
                  <div className="flex gap-2">
                    {(["Monthly", "Annual"] as FrequencyType[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setForm({ ...form, frequency: f })}
                        className={clsx(
                          "flex-1 py-2 rounded-2xl text-sm font-semibold border transition-all",
                          form.frequency === f ? "bg-black text-white border-black" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dueDay}
                    onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Who pays?</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: opt.value })}
                      className={clsx(
                        "py-2.5 rounded-2xl text-sm font-semibold border transition-all",
                        form.category === opt.value ? "bg-black text-white border-black" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Brand Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: ic.name, color: ic.color })}
                      className={clsx(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all border",
                        form.icon === ic.name ? "border-black bg-slate-900" : "border-transparent bg-slate-100 hover:bg-slate-200"
                      )}
                    >
                      <BrandIcon name={ic.name} color={form.icon === ic.name ? "white" : ic.color} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-black text-white text-sm font-semibold py-2.5 rounded-full hover:bg-slate-800">
                  {editingId ? "Save Changes" : "Add Subscription"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
        </div>
      )}

      {/* Subscription cards */}
      {data.subscriptions.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              }
              title="No subscriptions yet"
              description="Add Netflix, Spotify, gym memberships and more to track due dates and potential savings."
              action={
                <button onClick={openAdd} className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
                  Add your first subscription
                </button>
              }
            />
          </CardBody>
        </Card>
      ) : (
      <div className="space-y-3">
        {data.subscriptions.map((sub) => {
          const days = getDaysUntilDue(sub.dueDay);
          const monthly = getMonthlyAmount(sub);
          const catOpt = CATEGORY_OPTIONS.find((c) => c.value === sub.category)!;
          const isDueSoon = days <= 3;

          return (
            <Card key={sub.id}>
              <CardBody className="!py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: sub.color + "18" }}>
                    <BrandIcon name={sub.icon} color={sub.color} size={22} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-800 truncate">{sub.name}</span>
                      <span className={clsx("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", catOpt.cls)}>{catOpt.label}</span>
                      {sub.frequency === "Annual" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Annual</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Due the {sub.dueDay}{sub.dueDay === 1 ? "st" : sub.dueDay === 2 ? "nd" : sub.dueDay === 3 ? "rd" : "th"} of each month
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-extrabold text-slate-800">
                      {formatCurrency(monthly)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </p>
                    {sub.frequency === "Annual" && (
                      <p className="text-xs text-slate-400">{formatCurrency(sub.amount)}/yr</p>
                    )}
                  </div>

                  <div className={clsx(
                    "px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 min-w-[56px] text-center",
                    isDueSoon ? "bg-orange-100 text-orange-600" : days <= 7 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {days === 0 ? "Today!" : `${days}d`}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(sub.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-300 hover:text-slate-600"
                      aria-label="Edit"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => removeSubscription(sub.id)}
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
              </CardBody>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
