import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("px-6 pt-6 pb-0", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("px-6 py-6", className)}>
      {children}
    </div>
  );
}
