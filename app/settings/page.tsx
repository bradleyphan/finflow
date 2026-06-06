"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency, hourlyToMonthly } from "@/lib/calculations";
import { ShareHousehold } from "@/components/ShareHousehold";
import { IncomeMode } from "@/lib/types";
import clsx from "clsx";

type Period = "Monthly" | "Annual";
type HourlyForm = {
  hourlyRate: string;
  hoursPerWeek: string;
  tipsPerShift: string;
  shiftsPerWeek: string;
};

function toHourlyForm(c: { hourlyRate: number; hoursPerWeek: number; tipsPerShift: number; shiftsPerWeek: number }): HourlyForm {
  return {
    hourlyRate: String(c.hourlyRate),
    hoursPerWeek: String(c.hoursPerWeek),
    tipsPerShift: String(c.tipsPerShift),
    shiftsPerWeek: String(c.shiftsPerWeek),
  };
}

function parseHourly(h: HourlyForm) {
  return {
    hourlyRate: parseFloat(h.hourlyRate) || 0,
    hoursPerWeek: parseFloat(h.hoursPerWeek) || 0,
    tipsPerShift: parseFloat(h.tipsPerShift) || 0,
    shiftsPerWeek: parseFloat(h.shiftsPerWeek) || 0,
  };
}

export default function IncomePage() {
  const { data, updateIncome, updateNames, resetData } = useStore();
  const inc = data.income;

  const [period, setPeriod] = useState<Period>("Monthly");
  const [mode1, setMode1] = useState<IncomeMode>(inc.user1Mode ?? "salary");
  const [mode2, setMode2] = useState<IncomeMode>(inc.user2Mode ?? "salary");
  const [base, setBase] = useState(String(inc.baseSalary));
  const [ote, setOte] = useState(String(inc.ote));
  const [base2, setBase2] = useState(String(inc.user2BaseSalary));
  const [ote2, setOte2] = useState(String(inc.user2Ote));
  const [h1, setH1] = useState<HourlyForm>(toHourlyForm(inc.user1Hourly));
  const [h2, setH2] = useState<HourlyForm>(toHourlyForm(inc.user2Hourly));
  const [name1, setName1] = useState(data.user1Name);
  const [name2, setName2] = useState(data.user2Name);
  const [saved, setSaved] = useState(false);

  // Inputs are shown in the selected period; we always store MONTHLY internally.
  const toMonthly = (v: string) => {
    const n = parseFloat(v) || 0;
    return period === "Annual" ? n / 12 : n;
  };

  function switchPeriod(next: Period) {
    if (next === period) return;
    const factor = next === "Annual" ? 12 : 1 / 12;
    const conv = (v: string) => {
      const n = parseFloat(v);
      return isNaN(n) ? v : String(Math.round(n * factor * 100) / 100);
    };
    setBase(conv(base));
    setOte(conv(ote));
    setBase2(conv(base2));
    setOte2(conv(ote2));
    setPeriod(next);
  }

  const estMonthly1 = hourlyToMonthly(parseHourly(h1));
  const estMonthly2 = hourlyToMonthly(parseHourly(h2));

  const monthlyBase1 = mode1 === "hourly" ? estMonthly1 : toMonthly(base);
  const monthlyOte1 = toMonthly(ote);
  const monthlyBase2 = mode2 === "hourly" ? estMonthly2 : toMonthly(base2);
  const monthlyOte2 = toMonthly(ote2);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateIncome({
      baseSalary: monthlyBase1,
      ote: monthlyOte1,
      user2BaseSalary: monthlyBase2,
      user2Ote: monthlyOte2,
      user1Mode: mode1,
      user2Mode: mode2,
      user1Hourly: parseHourly(h1),
      user2Hourly: parseHourly(h2),
    });
    updateNames(name1.trim() || "User 1", name2.trim() || "User 2");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const displayName1 = name1.trim() || "User 1";
  const displayName2 = name2.trim() || "User 2";

  const householdBase = monthlyBase1 + monthlyBase2;
  const householdOte = monthlyOte1 + monthlyOte2;
  const householdTotal = householdBase + householdOte;
  const suffix = period === "Annual" ? "/yr" : "/mo";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Configure</p>
          <h1 className="text-3xl font-bold text-slate-900">Income Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Set each person&apos;s income — salary or hourly + tips</p>
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
              {/* Period toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Enter salary amounts as</span>
                <div className="flex bg-slate-100 rounded-full p-0.5">
                  {(["Monthly", "Annual"] as Period[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => switchPeriod(p)}
                      className={clsx(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                        period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <UserIncomeBlock
                name={name1}
                setName={setName1}
                displayName={displayName1}
                namePlaceholder="e.g. Bradley"
                accent="blue"
                mode={mode1}
                setMode={setMode1}
                base={base}
                setBase={setBase}
                ote={ote}
                setOte={setOte}
                hourly={h1}
                setHourly={setH1}
                suffix={suffix}
                estMonthly={estMonthly1}
              />

              <UserIncomeBlock
                name={name2}
                setName={setName2}
                displayName={displayName2}
                namePlaceholder="e.g. Alex"
                accent="violet"
                mode={mode2}
                setMode={setMode2}
                base={base2}
                setBase={setBase2}
                ote={ote2}
                setOte={setOte2}
                hourly={h2}
                setHourly={setH2}
                suffix={suffix}
                estMonthly={estMonthly2}
              />

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

function UserIncomeBlock({
  name,
  setName,
  displayName,
  namePlaceholder,
  accent,
  mode,
  setMode,
  base,
  setBase,
  ote,
  setOte,
  hourly,
  setHourly,
  suffix,
  estMonthly,
}: {
  name: string;
  setName: (v: string) => void;
  displayName: string;
  namePlaceholder: string;
  accent: "blue" | "violet";
  mode: IncomeMode;
  setMode: (m: IncomeMode) => void;
  base: string;
  setBase: (v: string) => void;
  ote: string;
  setOte: (v: string) => void;
  hourly: HourlyForm;
  setHourly: (h: HourlyForm) => void;
  suffix: string;
  estMonthly: number;
}) {
  const ring = accent === "violet" ? "focus:ring-violet-300" : "focus:ring-blue-300";
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={clsx("w-6 h-6 rounded-lg flex items-center justify-center", accent === "violet" ? "bg-violet-100" : "bg-blue-100")}>
          <span className={clsx("text-[10px] font-black", accent === "violet" ? "text-violet-600" : "text-blue-600")}>
            {(displayName.charAt(0) || "?").toUpperCase()}
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-800">{displayName}&apos;s Income</h2>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Display Name</label>
        <input
          type="text"
          placeholder={namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className={clsx("w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 placeholder:text-slate-300", ring)}
        />
      </div>

      {/* Income type toggle */}
      <div className="flex bg-slate-100 rounded-full p-0.5 mb-3">
        {(["salary", "hourly"] as IncomeMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={clsx(
              "flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize",
              mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
            )}
          >
            {m === "salary" ? "Salary" : "Hourly + Tips"}
          </button>
        ))}
      </div>

      {mode === "salary" ? (
        <div className="grid grid-cols-2 gap-3">
          <IncomeInput label="Base Salary" suffix={suffix} value={base} onChange={setBase} accent={accent} />
          <IncomeInput label="OTE / Bonus" suffix={suffix} value={ote} onChange={setOte} accent="violet" firewall />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Hourly rate" prefix="$" value={hourly.hourlyRate} onChange={(v) => setHourly({ ...hourly, hourlyRate: v })} accent={accent} />
            <NumberField label="Hours / week" value={hourly.hoursPerWeek} onChange={(v) => setHourly({ ...hourly, hoursPerWeek: v })} accent={accent} />
            <NumberField label="Avg tips / shift" prefix="$" value={hourly.tipsPerShift} onChange={(v) => setHourly({ ...hourly, tipsPerShift: v })} accent={accent} />
            <NumberField label="Shifts / week" value={hourly.shiftsPerWeek} onChange={(v) => setHourly({ ...hourly, shiftsPerWeek: v })} accent={accent} />
          </div>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
            <span className="text-xs font-semibold text-blue-700">Estimated monthly income</span>
            <span className="text-base font-extrabold text-blue-800 tabular-nums">{formatCurrency(estMonthly)}/mo</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <IncomeInput label="OTE / Bonus (optional)" suffix={suffix} value={ote} onChange={setOte} accent="violet" firewall />
          </div>
        </div>
      )}
    </div>
  );
}

function IncomeInput({
  label,
  value,
  onChange,
  accent,
  firewall,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: "slate" | "violet" | "blue";
  firewall?: boolean;
  suffix?: string;
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
            "w-full border border-slate-200 rounded-2xl pl-7 pr-10 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 font-semibold tabular-nums",
            accent === "violet" ? "focus:ring-violet-300" : accent === "blue" ? "focus:ring-blue-300" : "focus:ring-slate-300"
          )}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-semibold">{suffix}</span>}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  accent,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: "blue" | "violet";
  prefix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">{prefix}</span>}
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "w-full border border-slate-200 rounded-2xl py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 font-semibold tabular-nums",
            prefix ? "pl-7 pr-3" : "px-3",
            accent === "violet" ? "focus:ring-violet-300" : "focus:ring-blue-300"
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
