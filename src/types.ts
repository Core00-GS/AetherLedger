export enum Category {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  SALARY = 'SALARY',
  OTHER = 'OTHER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO format
  type: TransactionType;
  createdAt: number;
}

export interface Budget {
  id: string;
  category: Category | 'OVERALL';
  amount: number;
  period: 'MONTHLY';
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
}

export interface UserSettings {
  categoryColors: Record<string, string>;
  categoryIcons: Record<string, string>;
}

export interface AppState {
  expenses: Expense[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: UserSettings;
}

export interface EncryptionResult {
  data: string;
  iv: string;
  salt: string;
}
