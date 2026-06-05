"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { FinancialSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface BurdenBreakdownProps {
  summary: FinancialSummary;
}

interface BurdenRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  sublabel?: string;
}

function BurdenRow({ label, value, total, color, sublabel }: BurdenRowProps) {
  const pct = Math.min(100, (value / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          {sublabel && <span className="text-xs text-slate-400 ml-2">{sublabel}</span>}
        </div>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function BurdenBreakdown({ summary }: BurdenBreakdownProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Monthly Breakdown</p>
        <p className="text-lg font-bold text-slate-900 mb-5">Expense Distribution</p>

        {/* User 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-[10px] font-black">{summary.user1Initial}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{summary.user1Name}</span>
            <span className="ml-auto text-sm font-extrabold text-slate-900">{formatCurrency(summary.user1TotalBurden)}</span>
          </div>
          <BurdenRow
            label="Individual Expenses"
            value={summary.user1Individual}
            total={summary.baseSalary}
            color="#3B82F6"
          />
          <BurdenRow
            label={`${summary.splitPctUser1}% of Shared Bills`}
            value={summary.user1ShareOfShared}
            total={summary.baseSalary}
            color="#60A5FA"
            sublabel="split rule"
          />
          <div className="flex justify-between items-center text-xs bg-blue-50 rounded-xl px-3 py-2">
            <span className="text-blue-600 font-medium">Remaining (Safe to Spend)</span>
            <span className="font-extrabold text-blue-700">{formatCurrency(summary.user1SafeToSpend)}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* User 2 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
              <span className="text-violet-600 text-[10px] font-black">{summary.user2Initial}</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{summary.user2Name}</span>
            <span className="ml-auto text-sm font-extrabold text-slate-900">{formatCurrency(summary.user2TotalBurden)}</span>
          </div>
          <BurdenRow
            label="Individual Expenses"
            value={summary.user2Individual}
            total={summary.user2BaseSalary}
            color="#A78BFA"
          />
          <BurdenRow
            label={`${summary.splitPctUser2}% of Shared Bills`}
            value={summary.user2ShareOfShared}
            total={summary.user2BaseSalary}
            color="#C4B5FD"
            sublabel="split rule"
          />
          <div className="flex justify-between items-center text-xs bg-violet-50 rounded-xl px-3 py-2">
            <span className="text-violet-600 font-medium">Remaining (Safe to Spend)</span>
            <span className="font-extrabold text-violet-700">{formatCurrency(summary.user2SafeToSpend)}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">OTE (Firewalled to Investments)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(summary.wealthFirewallTotal)}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-600 font-semibold px-1.5 py-0.5 rounded-full">Protected</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
