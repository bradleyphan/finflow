"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { FixedExpense, Subscription } from "@/lib/types";
import { formatCurrency, getMonthlyAmount } from "@/lib/calculations";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useStore } from "@/lib/store";

interface SharedSplitVisualizerProps {
  fixedExpenses: FixedExpense[];
  subscriptions: Subscription[];
  totalShared: number;
  user1Share: number;
  user2Share: number;
  pctUser1: number;
  pctUser2: number;
  user1Name: string;
  user2Name: string;
  user1Initial: string;
  user2Initial: string;
}

export function SharedSplitVisualizer({
  fixedExpenses,
  subscriptions,
  totalShared,
  user1Share,
  user2Share,
  pctUser1,
  pctUser2,
  user1Name,
  user2Name,
  user1Initial,
  user2Initial,
}: SharedSplitVisualizerProps) {
  const { data, updateSplitRatio } = useStore();
  const ratio1 = data.splitRatioUser1;
  const ratio2 = 1 - ratio1;

  const sharedFixed = fixedExpenses.filter((e) => e.splitType === "Shared");
  const sharedSubs = subscriptions.filter((s) => s.category === "Shared");

  const allShared = [
    ...sharedFixed.map((e) => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      icon: e.icon,
      color: "#3B82F6",
      type: "fixed" as const,
    })),
    ...sharedSubs.map((s) => ({
      id: s.id,
      name: s.name,
      amount: getMonthlyAmount(s),
      icon: s.icon,
      color: s.color,
      type: "sub" as const,
    })),
  ];

  const isDefault = pctUser1 === 60;

  return (
    <Card>
      <CardBody>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
              {pctUser1} / {pctUser2} Split
            </p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">Shared Bill Visualizer</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total shared</p>
            <p className="text-base font-bold text-slate-800">{formatCurrency(totalShared)}</p>
          </div>
        </div>

        {/* Ratio slider */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Adjust split ratio</span>
            <div className="flex items-center gap-2">
              {!isDefault && (
                <button
                  onClick={() => updateSplitRatio(0.6)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2"
                >
                  Reset to 60/40
                </button>
              )}
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {pctUser1}% / {pctUser2}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={pctUser1}
            onChange={(e) => updateSplitRatio(parseInt(e.target.value) / 100)}
            className="w-full accent-blue-500 cursor-pointer"
            aria-label="User 1 share of shared expenses"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-blue-500 font-medium">{user1Name} pays more ←</span>
            <span className="text-[10px] text-violet-400 font-medium">→ {user2Name} pays more</span>
          </div>
        </div>

        {/* Master split bar */}
        <div className="mb-6">
          <div className="flex rounded-full overflow-hidden h-4 gap-0.5">
            <div
              className="transition-all duration-500 rounded-l-full"
              style={{ width: `${pctUser1}%`, background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }}
            />
            <div
              className="transition-all duration-500 rounded-r-full"
              style={{ width: `${pctUser2}%`, background: "linear-gradient(90deg, #A78BFA, #C4B5FD)" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-slate-700">{user1Name} · {pctUser1}%</span>
              <span className="text-xs text-slate-400 ml-1">{formatCurrency(user1Share)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">{formatCurrency(user2Share)}</span>
              <span className="text-xs font-semibold text-slate-700">{pctUser2}% · {user2Name}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            </div>
          </div>
        </div>

        {/* Per-item breakdown */}
        {allShared.length === 0 && (
          <div className="py-6 text-center text-sm text-slate-400">No shared expenses yet.</div>
        )}
        <div className="space-y-3">
          {allShared.map((item) => {
            const u1 = item.amount * ratio1;
            const u2 = item.amount * ratio2;

            return (
              <div key={item.id} className="bg-slate-50 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: item.color + "18" }}
                    >
                      <BrandIcon name={item.icon} color={item.color} size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatCurrency(item.amount)}/mo</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-right">
                    <div>
                      <p className="text-xs text-blue-500 font-medium">{user1Initial}</p>
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(u1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-violet-400 font-medium">{user2Initial}</p>
                      <p className="text-sm font-bold text-slate-700">{formatCurrency(u2)}</p>
                    </div>
                  </div>
                </div>

                {/* Per-item mini split bar */}
                <div className="flex rounded-full overflow-hidden h-1.5 gap-px">
                  <div className="rounded-l-full bg-blue-400 transition-all duration-500" style={{ width: `${pctUser1}%` }} />
                  <div className="rounded-r-full bg-violet-300 transition-all duration-500" style={{ width: `${pctUser2}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
