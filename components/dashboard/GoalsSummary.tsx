"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GoalStatus } from "@/lib/types";
import { formatCurrency, formatMonths } from "@/lib/calculations";

export function GoalsSummary({ goals }: { goals: GoalStatus[] }) {
  const top = [...goals].sort((a, b) => b.monthlyContribution - a.monthlyContribution).slice(0, 4);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Goals &amp; Debt</p>
            <p className="text-sm text-slate-500 mt-0.5">Progress toward what matters</p>
          </div>
          <Link href="/goals" className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-full px-3 py-1.5 transition-colors">
            Manage
          </Link>
        </div>

        {goals.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            }
            title="No goals yet"
            description="Set a savings target, emergency fund, or debt to pay down."
            action={
              <Link href="/goals" className="bg-black text-white text-sm font-bold rounded-full px-5 py-2.5 hover:bg-slate-800 transition-colors">
                + Add a goal
              </Link>
            }
          />
        ) : (
          <div className="space-y-3.5">
            {top.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700 truncate pr-2">{g.name}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: g.complete ? "#10B981" : g.color }}>
                    {g.complete ? "Done" : `${Math.round(g.pct)}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${g.pct}%`, backgroundColor: g.complete ? "#10B981" : g.color }} />
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-slate-400 tabular-nums">
                  <span>{formatCurrency(g.current)} / {formatCurrency(g.target)}</span>
                  <span>{g.complete ? "Reached" : g.monthsToGoal === null ? "—" : `~${formatMonths(g.monthsToGoal)}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
