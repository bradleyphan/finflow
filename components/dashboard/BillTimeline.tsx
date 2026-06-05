"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Subscription } from "@/lib/types";
import { getDaysUntilDue, formatCurrency, getMonthlyAmount } from "@/lib/calculations";
import clsx from "clsx";

interface BillTimelineProps {
  subscriptions: Subscription[];
  user1Name: string;
  user2Name: string;
}

function getDueUrgency(days: number): { color: string; bg: string; label: string } {
  if (days === 0) return { color: "text-red-600", bg: "bg-red-50", label: "Today" };
  if (days <= 3) return { color: "text-orange-600", bg: "bg-orange-50", label: `${days}d` };
  if (days <= 7) return { color: "text-amber-600", bg: "bg-amber-50", label: `${days}d` };
  return { color: "text-slate-500", bg: "bg-slate-50", label: `${days}d` };
}

function getCategoryBadge(cat: string, n1: string, n2: string) {
  if (cat === "Shared") return { label: "Shared", cls: "bg-blue-50 text-blue-600" };
  if (cat === "Individual_2") return { label: n2, cls: "bg-violet-50 text-violet-600" };
  return { label: n1, cls: "bg-emerald-50 text-emerald-600" };
}

export function BillTimeline({ subscriptions, user1Name, user2Name }: BillTimelineProps) {
  const sorted = [...subscriptions].sort((a, b) => {
    const dA = getDaysUntilDue(a.dueDay);
    const dB = getDaysUntilDue(b.dueDay);
    return dA - dB;
  });

  const totalMonthly = subscriptions.reduce((sum, s) => sum + getMonthlyAmount(s), 0);

  return (
    <Card>
      <CardBody className="!pb-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Subscriptions</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">Bill Timeline</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Monthly total</p>
            <p className="text-base font-bold text-slate-800">{formatCurrency(totalMonthly)}</p>
          </div>
        </div>

        {sorted.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-400">No subscriptions yet.</div>
        )}

        <div className="space-y-1">
          {sorted.map((sub) => {
            const days = getDaysUntilDue(sub.dueDay);
            const urgency = getDueUrgency(days);
            const badge = getCategoryBadge(sub.category, user1Name, user2Name);
            const monthly = getMonthlyAmount(sub);

            return (
              <div
                key={sub.id}
                className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 group"
              >
                {/* Icon bubble */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: sub.color + "18" }}
                >
                  <BrandIcon name={sub.icon} color={sub.color} size={20} />
                </div>

                {/* Name + badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 truncate">{sub.name}</span>
                    <span className={clsx("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", badge.cls)}>
                      {badge.label}
                    </span>
                    {sub.frequency === "Annual" && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Annual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Due {new Date(new Date().getFullYear(), new Date().getMonth(), sub.dueDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(sub.frequency === "Annual" ? sub.amount / 12 : sub.amount)}
                    <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </p>
                  {sub.frequency === "Annual" && (
                    <p className="text-[10px] text-slate-400">{formatCurrency(sub.amount)}/yr</p>
                  )}
                </div>

                {/* Days badge */}
                <div className={clsx("text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 min-w-[44px] text-center", urgency.bg, urgency.color)}>
                  {urgency.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
