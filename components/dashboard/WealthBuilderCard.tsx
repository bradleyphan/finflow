"use client";

import React from "react";
import { formatCurrency } from "@/lib/calculations";
import { FinancialSummary } from "@/lib/types";

interface WealthBuilderCardProps {
  summary: FinancialSummary;
}

export function WealthBuilderCard({ summary }: WealthBuilderCardProps) {
  const monthlyContrib = summary.wealthFirewallTotal;
  const annualContrib = monthlyContrib * 12;
  const projected3Y = annualContrib * 3 * 1.07; // simple 7% growth

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 w-20 h-20 rounded-full bg-white/10" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
            Wealth Firewall™
          </span>
        </div>
        <h2 className="text-2xl font-extrabold mt-2">Wealth Builder</h2>
        <p className="text-emerald-100 text-sm mt-0.5">
          Both users&apos; OTE auto-routed here
        </p>
      </div>

      {/* Main amount */}
      <div className="mt-6 relative z-10">
        <p className="text-5xl font-black tracking-tight">{formatCurrency(monthlyContrib)}</p>
        <p className="text-emerald-200 text-sm mt-1">per month · auto-invested</p>
      </div>

      {/* Stats row */}
      <div className="mt-6 flex gap-3 relative z-10">
        <div className="flex-1 bg-white/15 rounded-2xl p-3.5">
          <p className="text-emerald-100 text-xs font-medium mb-1">Annual Contribution</p>
          <p className="text-xl font-bold">{formatCurrency(annualContrib)}</p>
        </div>
        <div className="flex-1 bg-white/15 rounded-2xl p-3.5">
          <p className="text-emerald-100 text-xs font-medium mb-1">3-Yr Projection</p>
          <p className="text-xl font-bold">{formatCurrency(projected3Y)}</p>
          <p className="text-[10px] text-emerald-200 mt-0.5">@ 7% avg return</p>
        </div>
      </div>

      {/* Firewall badge */}
      <div className="mt-4 relative z-10 flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-200 shrink-0">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
        <p className="text-xs text-emerald-100 leading-tight">
          <span className="font-bold text-white">OTE is firewalled</span> — excluded from spendable cash flow. Every bonus dollar builds long-term wealth.
        </p>
      </div>
    </div>
  );
}
