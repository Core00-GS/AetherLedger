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

export interface PlacedFurniture {
  id: string; // unique ID for placed instance
  itemId: string; // ID of the furniture metadata
  x: number; // grid x coordinate
  y: number; // grid y coordinate
  rotation: number; // 0, 90, 180, 270
}

export interface AppState {
  expenses: Expense[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: UserSettings;
  userXP?: number;
  userLevel?: number;
  aetherCreds?: number;
  purchasedFurniture?: string[];
  purchasedHouses?: string[];
  currentHouseId?: string;
  placedFurniture?: PlacedFurniture[];
}

export interface EncryptionResult {
  data: string;
  iv: string;
  salt: string;
}
