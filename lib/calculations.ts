import {
  DashboardData,
  FinancialSummary,
  Subscription,
  FixedExpense,
  BudgetStatus,
  SavingsInsight,
  UpcomingBill,
  HourlyConfig,
  Goal,
  GoalStatus,
} from "./types";

export function getMonthlyAmount(item: Subscription | FixedExpense): number {
  if ("frequency" in item) {
    return item.frequency === "Annual" ? item.amount / 12 : item.amount;
  }
  return item.amount;
}

// Average monthly take-home estimate from an hourly + tips schedule.
// (weekly wages + weekly tips) * 52 weeks / 12 months
export function hourlyToMonthly(cfg: HourlyConfig): number {
  if (!cfg) return 0;
  const weeklyWages = (cfg.hourlyRate || 0) * (cfg.hoursPerWeek || 0);
  const weeklyTips = (cfg.tipsPerShift || 0) * (cfg.shiftsPerWeek || 0);
  return ((weeklyWages + weeklyTips) * 52) / 12;
}

export function calculateFinancials(data: DashboardData): FinancialSummary {
  const { income, subscriptions, fixedExpenses } = data;

  // Firewall — all OTE from both users is auto-routed to investments
  const user1Firewall = income.ote;
  const user2Firewall = income.user2Ote;
  const wealthFirewallTotal = user1Firewall + user2Firewall;

  // ---- Subscriptions ----
  let subUser1 = 0;
  let subUser2 = 0;
  let subShared = 0;

  for (const sub of subscriptions) {
    const monthly = getMonthlyAmount(sub);
    if (sub.category === "Individual_1") subUser1 += monthly;
    else if (sub.category === "Individual_2") subUser2 += monthly;
    else subShared += monthly;
  }

  // ---- Fixed Expenses ----
  let fixUser1 = 0;
  let fixUser2 = 0;
  let fixShared = 0;

  for (const exp of fixedExpenses) {
    if (exp.splitType === "Individual_1") fixUser1 += exp.amount;
    else if (exp.splitType === "Individual_2") fixUser2 += exp.amount;
    else fixShared += exp.amount;
  }

  const totalShared = fixShared + subShared;

  const user1Individual = fixUser1 + subUser1;
  const user2Individual = fixUser2 + subUser2;

  // Configurable split on shared (defaults to 60/40)
  const ratioUser1 = Math.min(1, Math.max(0, data.splitRatioUser1 ?? 0.6));
  const ratioUser2 = 1 - ratioUser1;
  const user1ShareOfShared = totalShared * ratioUser1;
  const user2ShareOfShared = totalShared * ratioUser2;

  const user1TotalBurden = user1Individual + user1ShareOfShared;
  const user2TotalBurden = user2Individual + user2ShareOfShared;

  // Safe to Spend = each user's base salary minus their burden
  const user1SafeToSpend = Math.max(0, income.baseSalary - user1TotalBurden);
  const user2SafeToSpend = Math.max(0, income.user2BaseSalary - user2TotalBurden);

  const user1UtilizationPct = income.baseSalary > 0
    ? Math.min(100, (user1TotalBurden / income.baseSalary) * 100)
    : 0;
  const user2UtilizationPct = income.user2BaseSalary > 0
    ? Math.min(100, (user2TotalBurden / income.user2BaseSalary) * 100)
    : 0;

  // Household
  const householdSpendableIncome = income.baseSalary + income.user2BaseSalary;
  const householdCommitted = user1TotalBurden + user2TotalBurden;
  const netCashFlow = householdSpendableIncome - householdCommitted;
  const totalIncome = householdSpendableIncome + wealthFirewallTotal;
  const householdSavingsRate = totalIncome > 0
    ? ((wealthFirewallTotal + Math.max(0, netCashFlow)) / totalIncome) * 100
    : 0;

  const user1Name = (data.user1Name || "User 1").trim() || "User 1";
  const user2Name = (data.user2Name || "User 2").trim() || "User 2";
  const user1Initial = user1Name.charAt(0).toUpperCase();
  const user2Initial = user2Name.charAt(0).toUpperCase();

  return {
    user1Name,
    user2Name,
    user1Initial,
    user2Initial,
    baseSalary: income.baseSalary,
    ote: income.ote,
    totalIncome,
    wealthFirewallTotal,
    user1Firewall,
    user2Firewall,
    user1Individual,
    user1ShareOfShared,
    user1TotalBurden,
    user1SafeToSpend,
    user1UtilizationPct,
    user1BaseSalary: income.baseSalary,
    user2Individual,
    user2ShareOfShared,
    user2TotalBurden,
    user2SafeToSpend,
    user2UtilizationPct,
    user2BaseSalary: income.user2BaseSalary,
    totalShared,
    splitPctUser1: Math.round(ratioUser1 * 100),
    splitPctUser2: Math.round(ratioUser2 * 100),
    householdSpendableIncome,
    householdCommitted,
    netCashFlow,
    householdSavingsRate,
  };
}

// Spend per fixed-expense category (fixed expenses only — these map to budget categories)
export function calculateBudgetStatuses(data: DashboardData): BudgetStatus[] {
  const { budgets, fixedExpenses } = data;
  const spentByCategory: Record<string, number> = {};

  for (const exp of fixedExpenses) {
    spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + exp.amount;
  }

  return budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    const pct = b.cap > 0 ? (spent / b.cap) * 100 : 0;
    return {
      id: b.id,
      category: b.category,
      cap: b.cap,
      spent,
      pct,
      overBudget: spent > b.cap,
    };
  });
}

// Subscriptions ranked by annual cost — "cancel these to save"
export function calculateSavingsInsights(data: DashboardData): SavingsInsight[] {
  return data.subscriptions
    .map((s) => {
      const monthly = getMonthlyAmount(s);
      return {
        id: s.id,
        name: s.name,
        monthly,
        annual: monthly * 12,
        icon: s.icon,
        color: s.color,
        category: s.category,
      };
    })
    .sort((a, b) => b.annual - a.annual);
}

// Bills due within `withinDays`
export function getUpcomingBills(data: DashboardData, withinDays = 7): UpcomingBill[] {
  return data.subscriptions
    .map((s) => ({
      id: s.id,
      name: s.name,
      amount: getMonthlyAmount(s),
      icon: s.icon,
      color: s.color,
      days: getDaysUntilDue(s.dueDay),
    }))
    .filter((b) => b.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

export function calculateGoalStatuses(data: DashboardData): GoalStatus[] {
  const goals = data.goals ?? [];
  return goals.map((g: Goal) => {
    const target = Math.max(0, g.target);
    const current = Math.max(0, g.current);
    const remaining = Math.max(0, target - current);
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const complete = remaining <= 0 && target > 0;
    const monthsToGoal =
      !complete && g.monthlyContribution > 0
        ? Math.ceil(remaining / g.monthlyContribution)
        : complete
        ? 0
        : null;
    return {
      id: g.id,
      name: g.name,
      kind: g.kind,
      target,
      current,
      remaining,
      pct,
      monthlyContribution: g.monthlyContribution,
      monthsToGoal,
      complete,
      icon: g.icon,
      color: g.color,
    };
  });
}

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= currentDay) {
    return dueDay - currentDay;
  } else {
    return daysInMonth - currentDay + dueDay;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonths(months: number | null): string {
  if (months === null) return "—";
  if (months <= 0) return "Done";
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years}y` : `${years}y ${rem}mo`;
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}
