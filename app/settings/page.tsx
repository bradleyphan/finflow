"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/calculations";
import { ShareHousehold } from "@/components/ShareHousehold";
import clsx from "clsx";

export default function IncomePage() {
  const { data, updateIncome, updateNames, resetData } = useStore();

  const [base, setBase] = useState(String(data.income.baseSalary));
  const [ote, setOte] = useState(String(data.income.ote));
  const [base2, setBase2] = useState(String(data.income.user2BaseSalary));
  const [ote2, setOte2] = useState(String(data.income.user2Ote));
  const [name1, setName1] = useState(data.user1Name);
  const [name2, setName2] = useState(data.user2Name);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateIncome({
      baseSalary: parseFloat(base) || 0,
      ote: parseFloat(ote) || 0,
      user2BaseSalary: parseFloat(base2) || 0,
      user2Ote: parseFloat(ote2) || 0,
    });
    updateNames(name1.trim() || "User 1", name2.trim() || "User 2");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const displayName1 = name1.trim() || "User 1";
  const displayName2 = name2.trim() || "User 2";

  const previewBase = parseFloat(base) || 0;
  const previewOte = parseFloat(ote) || 0;
  const previewBase2 = parseFloat(base2) || 0;
  const previewOte2 = parseFloat(ote2) || 0;

  const householdBase = previewBase + previewBase2;
  const householdOte = previewOte + previewOte2;
  const householdTotal = householdBase + householdOte;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Configure</p>
          <h1 className="text-3xl font-bold text-slate-900">Income Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Set each user&apos;s monthly base salary and OTE/bonus</p>
        </div>
        <button
          onClick={resetData}
          className="text-sm font-semibold text-slate-500 border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition-colors"
        >
          Reset to demo data
        </button>
      </div>

      {/* Share with partner */}
      <div className="mb-6">
        <ShareHousehold />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income form */}
        <Card>
          <CardBody>
            <form onSubmit={handleSave} className="space-y-6">
              {/* User 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-[10px] font-black">
                      {(displayName1.charAt(0) || "1").toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">{displayName1}&apos;s Income</h2>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bradley"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    maxLength={20}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <IncomeInput label="Base Salary" value={base} onChange={setBase} accent="slate" />
                  <IncomeInput label="OTE / Bonus" value={ote} onChange={setOte} accent="violet" firewall />
                </div>
              </div>

              {/* User 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                    <span className="text-violet-600 text-[10px] font-black">
                      {(displayName2.charAt(0) || "2").toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">{displayName2}&apos;s Income</h2>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    maxLength={20}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <IncomeInput label="Base Salary" value={base2} onChange={setBase2} accent="slate" />
                  <IncomeInput label="OTE / Bonus" value={ote2} onChange={setOte2} accent="violet" firewall />
                </div>
              </div>

              {/* Firewall explainer */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Wealth Firewall™ Active</p>
                    <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                      Both users&apos; OTE buckets are completely separated from daily cash flow and auto-invested. This prevents lifestyle creep and ensures bonuses build wealth.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={clsx(
                  "w-full py-3 rounded-full text-sm font-bold transition-all",
                  saved ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-slate-800"
                )}
              >
                {saved ? "✓ Saved!" : "Save Income Settings"}
              </button>
            </form>
          </CardBody>
        </Card>

        {/* Live preview */}
        <div className="space-y-4">
          <Card>
            <CardBody>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Household Preview</p>

              <div className="space-y-3">
                <PreviewRow label="Combined Base (spendable)" value={householdBase} color="bg-emerald-400" />
                <PreviewRow label="Combined OTE (firewalled)" value={householdOte} color="bg-violet-400" badge />
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Total Household Income</span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">{formatCurrency(householdTotal)}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
                  <div className="rounded-l-full bg-emerald-400 transition-all duration-500" style={{ width: householdTotal > 0 ? `${(householdBase / householdTotal) * 100}%` : "50%" }} />
                  <div className="rounded-r-full bg-violet-400 transition-all duration-500" style={{ width: householdTotal > 0 ? `${(householdOte / householdTotal) * 100}%` : "50%" }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                  <span>Spendable ({householdTotal > 0 ? Math.round((householdBase / householdTotal) * 100) : 0}%)</span>
                  <span>Firewalled ({householdTotal > 0 ? Math.round((householdOte / householdTotal) * 100) : 0}%)</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">Wealth Firewall Impact</p>
              <div className="grid grid-cols-2 gap-3">
                <ImpactBox label="Monthly Invested" value={householdOte} accent />
                <ImpactBox label="Annual Invested" value={householdOte * 12} accent />
                <ImpactBox label="3-Year (7% avg)" value={householdOte * 12 * 3 * 1.07} />
                <ImpactBox label="5-Year (7% avg)" value={householdOte * 12 * 5 * 1.07} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IncomeInput({
  label,
  value,
  onChange,
  accent,
  firewall,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: "slate" | "violet";
  firewall?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
        {label}
        {firewall && <span className="text-[9px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-bold">FW</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
        <input
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "w-full border border-slate-200 rounded-2xl pl-7 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 font-semibold tabular-nums",
            accent === "violet" ? "focus:ring-violet-300" : "focus:ring-slate-300"
          )}
        />
      </div>
    </div>
  );
}

function PreviewRow({ label, value, color, badge }: { label: string; value: number; color: string; badge?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={clsx("w-2.5 h-2.5 rounded-full", color)} />
        <span className="text-sm text-slate-600">{label}</span>
        {badge && <span className="text-[10px] bg-violet-100 text-violet-500 px-1.5 py-0.5 rounded-full font-bold">Firewall</span>}
      </div>
      <span className="text-base font-extrabold text-slate-900 tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

function ImpactBox({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={clsx("rounded-2xl p-3.5", accent ? "bg-emerald-50" : "bg-slate-50")}>
      <p className={clsx("text-xs font-medium", accent ? "text-emerald-600" : "text-slate-500")}>{label}</p>
      <p className={clsx("text-xl font-extrabold mt-1", accent ? "text-emerald-700" : "text-slate-700")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
