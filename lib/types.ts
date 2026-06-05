export type FrequencyType = "Monthly" | "Annual";
export type SplitType = "Individual_1" | "Individual_2" | "Shared";
export type ExpenseCategory = "Individual_1" | "Individual_2" | "Shared";

export interface Income {
  baseSalary: number; // User 1 base
  ote: number;        // User 1 OTE/bonus (firewalled)
  user2BaseSalary: number; // User 2 base
  user2Ote: number;        // User 2 OTE/bonus (firewalled)
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: FrequencyType;
  category: ExpenseCategory;
  icon: string;
  dueDay: number; // day of month the bill is due
  color: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  splitType: SplitType;
  icon: string;
  category: string;
}

export interface Budget {
  id: string;
  category: string; // matches FixedExpense.category
  cap: number;      // monthly spending cap
}

export interface DashboardData {
  income: Income;
  subscriptions: Subscription[];
  fixedExpenses: FixedExpense[];
  budgets: Budget[];
  splitRatioUser1: number; // User 1's share of shared expenses (0–1), e.g. 0.6
  user1Name: string;
  user2Name: string;
}

// ---- Computed values ----

export interface BudgetStatus {
  id: string;
  category: string;
  cap: number;
  spent: number;
  pct: number;
  overBudget: boolean;
}

export interface SavingsInsight {
  id: string;
  name: string;
  monthly: number;
  annual: number;
  icon: string;
  color: string;
  category: ExpenseCategory;
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  days: number;
}

export interface FinancialSummary {
  // Names
  user1Name: string;
  user2Name: string;
  user1Initial: string;
  user2Initial: string;

  // Income
  baseSalary: number;
  ote: number;
  totalIncome: number; // household total (both users, base + ote)

  // Wealth Firewall (both users' OTE)
  wealthFirewallTotal: number;
  user1Firewall: number;
  user2Firewall: number;

  // User 1 burden
  user1Individual: number;
  user1ShareOfShared: number; // shared * 0.6
  user1TotalBurden: number;
  user1SafeToSpend: number;
  user1UtilizationPct: number;
  user1BaseSalary: number;

  // User 2 burden
  user2Individual: number;
  user2ShareOfShared: number; // shared * 0.4
  user2TotalBurden: number;
  user2SafeToSpend: number;
  user2UtilizationPct: number;
  user2BaseSalary: number;

  // Shared
  totalShared: number;
  splitPctUser1: number; // e.g. 60
  splitPctUser2: number; // e.g. 40

  // Household net cash flow (combined base salaries - all burdens)
  householdSpendableIncome: number; // base salaries combined
  householdCommitted: number;       // all burdens combined
  netCashFlow: number;              // spendable - committed
  householdSavingsRate: number;     // (firewall + netCashFlow) / total income
}
