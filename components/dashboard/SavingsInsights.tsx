"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { SavingsInsight } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface SavingsInsightsProps {
  insights: SavingsInsight[];
}

export function SavingsInsights({ insights }: SavingsInsightsProps) {
  const totalAnnual = insights.reduce((sum, i) => sum + i.annual, 0);
  const top = insights.slice(0, 4);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Insights</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">Potential Savings</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6"/><path d="M10 22h4"/>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
            </svg>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-3.5 my-4">
          <p className="text-xs text-amber-700 font-medium">If you cancelled every subscription</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-0.5">
            {formatCurrency(totalAnnual)}<span className="text-sm font-semibold">/yr saved</span>
          </p>
        </div>

        <p className="text-xs text-slate-400 font-semibold mb-2">Biggest annual drains</p>
        <div className="space-y-2.5">
          {top.map((ins, idx) => (
            <div key={ins.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 w-4">{idx + 1}</span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: ins.color + "18" }}
              >
                <BrandIcon name={ins.icon} color={ins.color} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{ins.name}</p>
                <p className="text-xs text-slate-400">{formatCurrency(ins.monthly)}/mo</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{formatCurrency(ins.annual)}</p>
                <p className="text-[10px] text-slate-400">per year</p>
              </div>
            </div>
          ))}
          {top.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No subscriptions to analyze.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
