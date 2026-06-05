"use client";

import React from "react";
import { formatCurrency } from "@/lib/calculations";
import { FinancialSummary } from "@/lib/types";

interface IncomeHeaderProps {
  summary: FinancialSummary;
}

export function IncomeHeader({ summary }: IncomeHeaderProps) {
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
            {monthName}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Your Dashboard</h1>
          <p className="text-slate-500 text-sm">Personalized financial overview</p>
        </div>
        <div className="flex sm:flex-col gap-2 sm:items-end">
          {/* Income breakdown pills */}
          <div className="flex flex-1 items-center justify-center gap-2 bg-white rounded-2xl px-3 sm:px-4 py-2 shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Base</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(summary.householdSpendableIncome)}</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-2 bg-white rounded-2xl px-3 sm:px-4 py-2 shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">OTE</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(summary.wealthFirewallTotal)}</span>
            <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-semibold hidden sm:inline">FIREWALL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
