"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { FinancialSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface SummaryCardsProps {
  summary: FinancialSummary;
}

interface MiniCardProps {
  label: string;
  sublabel: string;
  value: string;
  trend?: string;
  accentColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

function MiniCard({ label, sublabel, value, trend, accentColor, bgColor, icon }: MiniCardProps) {
  return (
    <Card>
      <CardBody className="!py-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bgColor }}>
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: bgColor, color: accentColor }}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </CardBody>
    </Card>
  );
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const isOverBudget = summary.user1TotalBurden > summary.baseSalary;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MiniCard
        label="Total Income"
        sublabel="Base + OTE combined"
        value={formatCurrency(summary.totalIncome)}
        trend="+Monthly"
        accentColor="#10B981"
        bgColor="#D1FAE5"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        }
      />
      <MiniCard
        label={`${summary.user1Name} Burden`}
        sublabel={`Individual + ${summary.splitPctUser1}% shared`}
        value={formatCurrency(summary.user1TotalBurden)}
        trend={isOverBudget ? "OVER" : `${Math.round(summary.user1UtilizationPct)}%`}
        accentColor={isOverBudget ? "#F97316" : "#3B82F6"}
        bgColor={isOverBudget ? "#FFF7ED" : "#EFF6FF"}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOverBudget ? "#F97316" : "#3B82F6"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
          </svg>
        }
      />
      <MiniCard
        label={`${summary.user2Name} Burden`}
        sublabel={`Individual + ${summary.splitPctUser2}% shared`}
        value={formatCurrency(summary.user2TotalBurden)}
        trend={`${summary.splitPctUser2}% share`}
        accentColor="#A78BFA"
        bgColor="#F5F3FF"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
          </svg>
        }
      />
      <MiniCard
        label="Wealth Firewall"
        sublabel="OTE auto-invested"
        value={formatCurrency(summary.wealthFirewallTotal)}
        trend="Protected"
        accentColor="#10B981"
        bgColor="#D1FAE5"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        }
      />
    </div>
  );
}
