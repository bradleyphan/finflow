"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { BudgetStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import clsx from "clsx";

interface BudgetCapsProps {
  statuses: BudgetStatus[];
}

function barColor(pct: number, over: boolean) {
  if (over) return "#F97316"; // orange
  if (pct >= 85) return "#F59E0B"; // amber warning
  return "#10B981"; // emerald healthy
}

export function BudgetCaps({ statuses }: BudgetCapsProps) {
  const overCount = statuses.filter((s) => s.overBudget).length;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Budgets</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">Category Caps</p>
          </div>
          {overCount > 0 ? (
            <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
              {overCount} over budget
            </span>
          ) : (
            <span className="text-xs bg-emerald-100 text-emerald-600 font-semibold px-2.5 py-1 rounded-full">
              All on track
            </span>
          )}
        </div>

        {statuses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No budgets set yet.</p>
            <p className="text-xs text-slate-300 mt-1">Add caps from the Expenses page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {statuses.map((s) => {
              const pct = Math.min(100, s.pct);
              const color = barColor(s.pct, s.overBudget);
              const remaining = s.cap - s.spent;

              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{s.category}</span>
                    <span className="text-xs tabular-nums">
                      <span className={clsx("font-bold", s.overBudget ? "text-orange-500" : "text-slate-700")}>
                        {formatCurrency(s.spent)}
                      </span>
                      <span className="text-slate-400"> / {formatCurrency(s.cap)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">{Math.round(s.pct)}% used</span>
                    <span
                      className={clsx(
                        "text-[10px] font-medium",
                        s.overBudget ? "text-orange-500" : "text-slate-400"
                      )}
                    >
                      {s.overBudget
                        ? `${formatCurrency(Math.abs(remaining))} over`
                        : `${formatCurrency(remaining)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
