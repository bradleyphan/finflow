"use client";

import React, { useState } from "react";
import { UpcomingBill } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface UpcomingBillsAlertProps {
  bills: UpcomingBill[];
}

export function UpcomingBillsAlert({ bills }: UpcomingBillsAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (bills.length === 0 || dismissed) return null;

  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-4 lg:p-5 mb-6">
      <div className="flex items-center gap-4">
        {/* Alert icon */}
        <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">
            {bills.length} {bills.length === 1 ? "bill" : "bills"} due this week · {formatCurrency(total)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Make sure your account is funded to avoid missed payments.
          </p>
        </div>

        {/* Bill avatars */}
        <div className="hidden sm:flex items-center -space-x-2 mr-2">
          {bills.slice(0, 4).map((bill) => (
            <div
              key={bill.id}
              title={`${bill.name} · ${bill.days === 0 ? "today" : `${bill.days}d`}`}
              className="w-9 h-9 rounded-full bg-white border-2 border-orange-50 flex items-center justify-center shadow-sm"
              style={{ backgroundColor: bill.color + "18" }}
            >
              <BrandIcon name={bill.icon} color={bill.color} size={16} />
            </div>
          ))}
          {bills.length > 4 && (
            <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-600 shadow-sm">
              +{bills.length - 4}
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors text-orange-400 shrink-0"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
