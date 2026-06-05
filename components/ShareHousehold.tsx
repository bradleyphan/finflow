"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";

export function ShareHousehold() {
  const { mode, householdCode, leaveHousehold } = useStore();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  // Only relevant in shared (remote) mode
  if (mode !== "remote" || !householdCode) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Running in local mode</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Sharing isn&apos;t available — the database isn&apos;t connected. Data is saved only on this device.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?join=${householdCode}`
      : "";

  async function copy(text: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Shared Household</p>
                <p className="text-base font-bold text-slate-900">Invite your partner</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Send this code or link to your partner. When they join, you&apos;ll both see and edit the same live budget from any device.
            </p>
          </div>
          <button
            onClick={leaveHousehold}
            className="text-xs font-semibold text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            Leave / switch
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {/* Code */}
          <div className="bg-slate-50 rounded-2xl p-3.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Household code</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-bold text-slate-800 tracking-wide">{householdCode}</code>
              <button
                onClick={() => copy(householdCode, "code")}
                className="text-xs font-semibold bg-black text-white px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors shrink-0"
              >
                {copied === "code" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Link */}
          <div className="bg-slate-50 rounded-2xl p-3.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Invite link</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-slate-500 truncate">{shareLink}</code>
              <button
                onClick={() => copy(shareLink, "link")}
                className="text-xs font-semibold bg-black text-white px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors shrink-0"
              >
                {copied === "link" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
