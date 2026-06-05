"use client";

import React from "react";
import { FinancialSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import clsx from "clsx";

interface NetCashFlowHeroProps {
  summary: FinancialSummary;
}

export function NetCashFlowHero({ summary }: NetCashFlowHeroProps) {
  const isPositive = summary.netCashFlow >= 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:p-7">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Main number */}
        <div className="lg:flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
              Household Net Cash Flow
            </span>
            <span
              className={clsx(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                isPositive ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
              )}
            >
              {isPositive ? "Surplus" : "Deficit"}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className={clsx(
                "text-5xl font-black tracking-tight tabular-nums",
                isPositive ? "text-slate-900" : "text-orange-500"
              )}
            >
              {isPositive ? "" : "−"}{formatCurrency(Math.abs(summary.netCashFlow))}
            </span>
            <span className="text-sm text-slate-400 font-medium">/ month left over</span>
          </div>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            What remains after both base salaries cover all individual and shared commitments.
            OTE is firewalled separately into investments.
          </p>
        </div>

        {/* Flow breakdown */}
        <div className="lg:w-80 space-y-3">
          <FlowRow label="Spendable (both base salaries)" value={summary.householdSpendableIncome} color="#10B981" sign="+" />
          <FlowRow label="Total committed (all bills)" value={summary.householdCommitted} color="#F97316" sign="−" />
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Net Cash Flow</span>
              <span className={clsx("text-base font-extrabold tabular-nums", isPositive ? "text-emerald-600" : "text-orange-500")}>
                {isPositive ? "+" : "−"}{formatCurrency(Math.abs(summary.netCashFlow))}
              </span>
            </div>
          </div>
          {/* Savings rate chip */}
          <div className="bg-emerald-50 rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-medium">Household Savings Rate</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {Math.round(summary.householdSavingsRate)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowRow({ label, value, color, sign }: { label: string; value: number; color: string; sign: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums">
        {sign}{formatCurrency(value)}
      </span>
    </div>
  );
}
