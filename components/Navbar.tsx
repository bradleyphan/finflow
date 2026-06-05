"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useStore } from "@/lib/store";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
      </svg>
    ),
  },
  {
    href: "/subscriptions",
    label: "Subscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Income",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { mode, syncing, status } = useStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <span className="text-base font-black text-slate-900 tracking-tight">FinFlow</span>
          {status === "ready" && mode === "remote" && (
            <span
              className={clsx(
                "hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ml-1",
                syncing ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}
            >
              <span className={clsx("w-1.5 h-1.5 rounded-full", syncing ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
              {syncing ? "Saving…" : "Synced"}
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  active
                    ? "bg-black text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                <span className={active ? "text-white" : ""}>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
