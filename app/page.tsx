"use client";

import React from "react";
import { useStore } from "@/lib/store";
import {
  calculateFinancials,
  calculateBudgetStatuses,
  calculateSavingsInsights,
  getUpcomingBills,
} from "@/lib/calculations";
import { IncomeHeader } from "@/components/dashboard/IncomeHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SafeToSpendRing } from "@/components/dashboard/SafeToSpendRing";
import { WealthBuilderCard } from "@/components/dashboard/WealthBuilderCard";
import { BillTimeline } from "@/components/dashboard/BillTimeline";
import { SharedSplitVisualizer } from "@/components/dashboard/SharedSplitVisualizer";
import { BurdenBreakdown } from "@/components/dashboard/BurdenBreakdown";
import { NetCashFlowHero } from "@/components/dashboard/NetCashFlowHero";
import { UpcomingBillsAlert } from "@/components/dashboard/UpcomingBillsAlert";
import { BudgetCaps } from "@/components/dashboard/BudgetCaps";
import { SavingsInsights } from "@/components/dashboard/SavingsInsights";

export default function DashboardPage() {
  const { data } = useStore();
  const summary = calculateFinancials(data);
  const budgetStatuses = calculateBudgetStatuses(data);
  const insights = calculateSavingsInsights(data);
  const upcomingBills = getUpcomingBills(data, 7);

  return (
    <div>
      <IncomeHeader summary={summary} />

      {/* Alert banner */}
      <UpcomingBillsAlert bills={upcomingBills} />

      {/* Top summary cards */}
      <SummaryCards summary={summary} />

      {/* Net cash flow hero */}
      <div className="mt-6">
        <NetCashFlowHero summary={summary} />
      </div>

      {/* Dual Safe-to-Spend rings */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SafeToSpendRing summary={summary} user={1} />
        <SafeToSpendRing summary={summary} user={2} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <WealthBuilderCard summary={summary} />
          <BudgetCaps statuses={budgetStatuses} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <BurdenBreakdown summary={summary} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <BillTimeline subscriptions={data.subscriptions} user1Name={summary.user1Name} user2Name={summary.user2Name} />
          <SavingsInsights insights={insights} />
        </div>
      </div>

      {/* Full-width shared split visualizer */}
      <div className="mt-6">
        <SharedSplitVisualizer
          fixedExpenses={data.fixedExpenses}
          subscriptions={data.subscriptions}
          totalShared={summary.totalShared}
          user1Share={summary.user1ShareOfShared}
          user2Share={summary.user2ShareOfShared}
          pctUser1={summary.splitPctUser1}
          pctUser2={summary.splitPctUser2}
          user1Name={summary.user1Name}
          user2Name={summary.user2Name}
          user1Initial={summary.user1Initial}
          user2Initial={summary.user2Initial}
        />
      </div>
    </div>
  );
}
