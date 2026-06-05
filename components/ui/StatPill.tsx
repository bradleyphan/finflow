import React from "react";
import clsx from "clsx";

interface StatPillProps {
  label: string;
  value: string;
  variant?: "emerald" | "blue" | "violet" | "orange" | "slate";
  size?: "sm" | "md";
}

const variantStyles = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  orange: "bg-orange-50 text-orange-700",
  slate: "bg-slate-100 text-slate-600",
};

export function StatPill({ label, value, variant = "slate", size = "md" }: StatPillProps) {
  return (
    <div className={clsx("inline-flex flex-col items-center px-4 py-2 rounded-2xl", variantStyles[variant])}>
      <span className={clsx("font-bold tabular-nums", size === "md" ? "text-lg" : "text-sm")}>{value}</span>
      <span className={clsx("text-xs opacity-70 whitespace-nowrap", size === "sm" && "text-[10px]")}>{label}</span>
    </div>
  );
}
