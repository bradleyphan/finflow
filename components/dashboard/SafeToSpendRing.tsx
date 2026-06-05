"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/calculations";
import { FinancialSummary } from "@/lib/types";

interface SafeToSpendRingProps {
  summary: FinancialSummary;
  user?: 1 | 2;
}

export function SafeToSpendRing({ summary, user = 1 }: SafeToSpendRingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isUser1 = user === 1;
  const spent = isUser1 ? summary.user1TotalBurden : summary.user2TotalBurden;
  const safe = isUser1 ? summary.user1SafeToSpend : summary.user2SafeToSpend;
  const total = isUser1 ? summary.user1BaseSalary : summary.user2BaseSalary;
  const util = isUser1 ? summary.user1UtilizationPct : summary.user2UtilizationPct;
  const sharePct = isUser1 ? `${summary.splitPctUser1}%` : `${summary.splitPctUser2}%`;
  const name = isUser1 ? summary.user1Name : summary.user2Name;
  const initial = isUser1 ? summary.user1Initial : summary.user2Initial;

  const pctSafe = total > 0 ? Math.round((safe / total) * 100) : 0;
  const isOverBudget = spent > total;

  // User 1 = blue committed, User 2 = violet committed
  const committedColor = isUser1 ? "#3B82F6" : "#A78BFA";

  const data = isOverBudget
    ? [{ value: 100, color: "#F97316" }]
    : [
        { value: spent, color: committedColor },
        { value: safe, color: "#10B981" },
      ];

  return (
    <Card className="flex flex-col items-center">
      <CardBody className="w-full flex flex-col items-center pb-6">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: isUser1 ? "#EFF6FF" : "#F5F3FF" }}
            >
              <span
                className="text-[10px] font-black"
                style={{ color: committedColor }}
              >
                {initial}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Safe to Spend</p>
              <p className="text-sm text-slate-500 mt-0.5">{name} · {sharePct} of shared</p>
            </div>
          </div>
          {isOverBudget && (
            <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
              Over Budget
            </span>
          )}
        </div>

        <div className="relative w-52 h-52">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={96}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={isOverBudget ? 0 : 2}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-3xl font-extrabold"
              style={{ color: isOverBudget ? "#F97316" : "#10B981" }}
            >
              {pctSafe}%
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">remaining</span>
          </div>
        </div>

        <div className="flex gap-6 mt-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">Safe to Spend</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(safe)}</span>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: committedColor }} />
              <span className="text-xs text-slate-500">Committed</span>
            </div>
            <span className={`text-sm font-bold ${isOverBudget ? "text-orange-500" : "text-slate-800"}`}>
              {formatCurrency(spent)}
            </span>
          </div>
        </div>

        <div className="w-full mt-4 bg-slate-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, util)}%`,
              backgroundColor: isOverBudget ? "#F97316" : committedColor,
            }}
          />
        </div>
        <div className="flex justify-between w-full mt-1">
          <span className="text-[10px] text-slate-400">{formatCurrency(0)}</span>
          <span className="text-[10px] text-slate-400">{formatCurrency(total)} base</span>
        </div>
      </CardBody>
    </Card>
  );
}
