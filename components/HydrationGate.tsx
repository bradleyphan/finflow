"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { HouseholdGate } from "./HouseholdGate";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const { status } = useStore();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "needsHousehold") {
    return <HouseholdGate />;
  }

  return <>{children}</>;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-56 bg-slate-200 rounded-xl" />
          <div className="h-3 w-40 bg-slate-100 rounded-full" />
        </div>
        <div className="hidden sm:flex flex-col gap-2">
          <div className="h-9 w-44 bg-slate-100 rounded-2xl" />
          <div className="h-9 w-44 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 shadow-sm" />
        ))}
      </div>

      {/* Hero */}
      <div className="mt-6 h-40 bg-white rounded-3xl border border-slate-100 shadow-sm" />

      {/* Rings */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-white rounded-3xl border border-slate-100 shadow-sm" />
        <div className="h-80 bg-white rounded-3xl border border-slate-100 shadow-sm" />
      </div>

      {/* Columns */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-96 bg-white rounded-3xl border border-slate-100 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
