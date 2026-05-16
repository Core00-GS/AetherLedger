/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * --------------------------------------------------------------------------------
 * PROJECT: AETHER LEDGER (エーテル帳簿)
 * ENGINEER: Aether-Core Systems / Professional Artistic Engineer
 * STATUS: SECURED | AES-256 | LOCAL-ONLY
 * LOG: Initializing technomancy encryption matrix... 
 * --------------------------------------------------------------------------------
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Search, 
  PieChart, 
  List, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  TrendingDown,
  TrendingUp,
  CreditCard,
  History,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Palette,
  X,
  Target,
  Download,
  Upload,
  RefreshCw,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  Book,
  Gift,
  Gamepad,
  Zap,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
import { format, isAfter, parseISO, startOfMonth, endOfMonth, addDays, addMonths, addYears, addWeeks, isBefore, isSameDay } from 'date-fns';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend,
  Cell as ReCell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { Category, Expense, TransactionType, RecurringFrequency, RecurringTransaction, Budget, UserSettings, AppState } from './types';
import { encryptData, decryptData, hashPassword } from './lib/crypto';
import { cn, formatCurrency } from './lib/utils';

const DEFAULT_CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#FF6B6B',
  [Category.TRANSPORT]: '#4DABF7',
  [Category.SHOPPING]: '#FCC419',
  [Category.ENTERTAINMENT]: '#9775FA',
  [Category.UTILITIES]: '#51CF66',
  [Category.HEALTH]: '#FF8787',
  [Category.EDUCATION]: '#F06595',
  [Category.SALARY]: '#37B24D',
  [Category.OTHER]: '#ADB5BD',
};

const DEFAULT_CATEGORY_ICONS: Record<Category, string> = {
  [Category.FOOD]: 'Coffee',
  [Category.TRANSPORT]: 'Car',
  [Category.SHOPPING]: 'ShoppingBag',
  [Category.ENTERTAINMENT]: 'Gamepad',
  [Category.UTILITIES]: 'Zap',
  [Category.HEALTH]: 'Heart',
  [Category.EDUCATION]: 'Book',
  [Category.SALARY]: 'DollarSign',
  [Category.OTHER]: 'MoreHorizontal',
};

const AVAILABLE_ICONS = [
  'Coffee', 'Car', 'ShoppingBag', 'Gamepad', 'Zap', 'Heart', 
  'Book', 'DollarSign', 'MoreHorizontal', 'Home', 'Gift', 
  'CreditCard', 'History', 'Target', 'Layers', 'Search'
];

const ICON_MAP: Record<string, React.ElementType> = {
  Coffee, Car, ShoppingBag, Gamepad, Zap, Heart, 
  Book, DollarSign, MoreHorizontal, Home, Gift, 
  CreditCard, History, Target, Layers, Search,
  ArrowUpRight, ArrowDownRight, Info
};

const STORAGE_KEYS = {
  CIPHER_DATA: 'aether_ledger_data',
  SALT: 'aether_ledger_salt',
  PWD_HASH: 'aether_ledger_hash',
};

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSetPassword, setHasSetPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ 
    categoryColors: DEFAULT_CATEGORY_COLORS,
    categoryIcons: DEFAULT_CATEGORY_ICONS
  });
  
  const [view, setView] = useState<'dashboard' | 'transactions' | 'stats' | 'settings'>('dashboard');
  const [error, setError] = useState('');

  // Re-auth logic
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const [reauthCallback, setReauthCallback] = useState<{ fn: () => void, title: string } | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'import' | 'export' | 'none'>('none');
  const [wizardStep, setWizardStep] = useState(1);

  // New Transaction Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(Category.FOOD);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newRecEndDate, setNewRecEndDate] = useState('');

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<Category | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const hash = localStorage.getItem(STORAGE_KEYS.PWD_HASH);
    if (hash) {
      setHasSetPassword(true);
    }
  }, []);

  const saveToStorage = (
    data: { 
      expenses?: Expense[], 
      budgets?: Budget[], 
      recurring?: RecurringTransaction[], 
      settings?: UserSettings 
    }, 
    pwd?: string
  ) => {
    const activePwd = pwd || password;
    if (!activePwd) return;

    const fullState: AppState = {
      expenses: data.expenses ?? expenses,
      budgets: data.budgets ?? budgets,
      recurring: data.recurring ?? recurring,
      settings: data.settings ?? settings,
    };

    localStorage.setItem(STORAGE_KEYS.CIPHER_DATA, JSON.stringify(encryptData(fullState, activePwd)));
  };

  const processRecurring = (recurringList: RecurringTransaction[], currentExpenses: Expense[]) => {
    const now = new Date();
    const newEntries: Expense[] = [];
    const updatedRecurring = recurringList.map(r => {
      let last = r.lastProcessed ? parseISO(r.lastProcessed) : parseISO(r.startDate);
      let next = last;
      
      const rr = { ...r };
      
      while (true) {
        if (rr.frequency === RecurringFrequency.DAILY) next = addDays(next, 1);
        else if (rr.frequency === RecurringFrequency.WEEKLY) next = addWeeks(next, 1);
        else if (rr.frequency === RecurringFrequency.MONTHLY) next = addMonths(next, 1);
        else if (rr.frequency === RecurringFrequency.YEARLY) next = addYears(next, 1);

        if (isAfter(next, now) || (rr.endDate && isAfter(next, parseISO(rr.endDate)))) break;

        newEntries.push({
          id: crypto.randomUUID(),
          amount: rr.amount,
          category: rr.category,
          description: `[Recurring] ${rr.description}`,
          date: format(next, 'yyyy-MM-dd'),
          type: rr.type,
          createdAt: Date.now(),
        });
        
        rr.lastProcessed = format(next, 'yyyy-MM-dd');
      }
      return rr;
    });

    return { newEntries, updatedRecurring };
  };

  const loadFromStorage = (pwd: string) => {
    const salt = localStorage.getItem(STORAGE_KEYS.SALT);
    const cipherJson = localStorage.getItem(STORAGE_KEYS.CIPHER_DATA);
    
    if (!salt || !cipherJson) {
      setExpenses([]);
      setBudgets([]);
      setRecurring([]);
      return true;
    }

    try {
      const { cipherText, salt: dataSalt } = JSON.parse(cipherJson);
      const decoded: AppState = decryptData(cipherText, pwd, dataSalt);
      
      if (decoded) {
        // Process recurring transactions
        const { newEntries, updatedRecurring } = processRecurring(decoded.recurring || [], decoded.expenses || []);
        
        const finalExpenses = [...newEntries, ...(decoded.expenses || [])];
        setExpenses(finalExpenses);
        setBudgets(decoded.budgets || []);
        setRecurring(updatedRecurring);
        setSettings(decoded.settings || { categoryColors: DEFAULT_CATEGORY_COLORS });

        if (newEntries.length > 0) {
          saveToStorage({ expenses: finalExpenses, recurring: updatedRecurring }, pwd);
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('密碼至少需要 6 位數');
      return;
    }
    const salt = Math.random().toString(36).substring(2);
    const hash = hashPassword(password, salt);
    localStorage.setItem(STORAGE_KEYS.SALT, salt);
    localStorage.setItem(STORAGE_KEYS.PWD_HASH, hash);
    saveToStorage({ expenses: [], budgets: [], recurring: [], settings: { categoryColors: DEFAULT_CATEGORY_COLORS } }, password);
    setIsUnlocked(true);
    setError('');
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(STORAGE_KEYS.SALT) || '';
    const storedHash = localStorage.getItem(STORAGE_KEYS.PWD_HASH);
    const currentHash = hashPassword(password, salt);

    if (currentHash === storedHash) {
      if (loadFromStorage(password)) {
        setIsUnlocked(true);
        setError('');
      } else {
        setError('數據解密失敗，請檢查系統環境');
      }
    } else {
      setError('解鎖密碼錯誤');
    }
  };

  const verifyAction = (title: string, callback: () => void) => {
    setReauthCallback({ fn: callback, title });
    setIsReauthOpen(true);
  };

  const handleReauth = (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(STORAGE_KEYS.SALT) || '';
    const storedHash = localStorage.getItem(STORAGE_KEYS.PWD_HASH);
    const currentHash = hashPassword(reauthPassword, salt);

    if (currentHash === storedHash) {
      reauthCallback?.fn();
      setIsReauthOpen(false);
      setReauthPassword('');
      setReauthCallback(null);
    } else {
      setError('密碼驗證失敗');
    }
  };
  const handleExport = () => {
    verifyAction('導出備份數據', () => {
      const salt = localStorage.getItem(STORAGE_KEYS.SALT);
      const cipherData = localStorage.getItem(STORAGE_KEYS.CIPHER_DATA);
      const pwdHash = localStorage.getItem(STORAGE_KEYS.PWD_HASH);

      if (!salt || !cipherData || !pwdHash) return;

      const backup = {
        salt,
        cipherData,
        pwdHash,
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aether_ledger_backup_${format(new Date(), 'yyyyMMdd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.salt && backup.cipherData && backup.pwdHash) {
          localStorage.setItem(STORAGE_KEYS.SALT, backup.salt);
          localStorage.setItem(STORAGE_KEYS.CIPHER_DATA, backup.cipherData);
          localStorage.setItem(STORAGE_KEYS.PWD_HASH, backup.pwdHash);
          alert('數據導入成功！即將重啟。');
          window.location.reload();
        } else {
          setError('無效的備份文件格式');
        }
      } catch (err) {
        setError('解析備份文件失敗');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setPassword('');
    setExpenses([]);
  };

  const renderCategoryIcon = (category: Category, size = 5) => {
    const iconName = settings.categoryIcons?.[category] || DEFAULT_CATEGORY_ICONS[category];
    const IconComponent = ICON_MAP[iconName] || MoreHorizontal;
    return <IconComponent className={`w-${size} h-${size}`} />;
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: amountNum,
      category: newCategory,
      description: newDesc || (newType === TransactionType.INCOME ? '未分類收入' : '未分類支出'),
      date: newDate,
      type: newType,
      createdAt: Date.now(),
    };

    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveToStorage({ expenses: updated });
    setIsFormOpen(false);
    setNewAmount('');
    setNewDesc('');
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveToStorage({ expenses: updated });
  };

  // Memoized filtered transactions
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = searchCategory === 'ALL' || e.category === searchCategory;
      const matchesStart = !startDate || isAfter(parseISO(e.date), parseISO(startDate)) || isSameDay(parseISO(e.date), parseISO(startDate));
      const matchesEnd = !endDate || isBefore(parseISO(e.date), parseISO(endDate)) || isSameDay(parseISO(e.date), parseISO(endDate));
      
      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    });
  }, [expenses, searchTerm, searchCategory, startDate, endDate]);

  // Memoized stats
  const stats = useMemo(() => {
    const income = expenses.filter(e => e.type === TransactionType.INCOME).reduce((sum, e) => sum + e.amount, 0);
    const expense = expenses.filter(e => e.type === TransactionType.EXPENSE).reduce((sum, e) => sum + e.amount, 0);
    const balance = income - expense;

    const byCategory = Object.values(Category).map(cat => ({
      name: cat,
      value: expenses
        .filter(e => e.category === cat && e.type === TransactionType.EXPENSE)
        .reduce((sum, e) => sum + e.amount, 0),
      color: settings.categoryColors[cat] || DEFAULT_CATEGORY_COLORS[cat as Category],
    })).filter(c => c.value > 0);

    const today = format(new Date(), 'yyyy-MM-dd');
    const spentToday = expenses
      .filter(e => e.date === today && e.type === TransactionType.EXPENSE)
      .reduce((sum, e) => sum + e.amount, 0);

    // Budget progress
    const thisMonth = format(new Date(), 'yyyy-MM');
    const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth) && e.type === TransactionType.EXPENSE);
    
    const budgetStatus = budgets.map(b => {
      const spent = b.category === 'OVERALL' 
        ? monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        : monthExpenses.filter(e => e.category === b.category).reduce((sum, e) => sum + e.amount, 0);
      return { ...b, spent, percent: (spent / b.amount) * 100 };
    });

    // Monthly Trend (Last 12 months)
    const monthlyTrend = Array.from({ length: 12 }).map((_, i) => {
      const monthDate = addMonths(new Date(), - (11 - i));
      const monthStr = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMM');
      const monthlyExp = expenses
        .filter(e => e.date.startsWith(monthStr) && e.type === TransactionType.EXPENSE)
        .reduce((sum, e) => sum + e.amount, 0);
      const monthlyInc = expenses
        .filter(e => e.date.startsWith(monthStr) && e.type === TransactionType.INCOME)
        .reduce((sum, e) => sum + e.amount, 0);
      
      return { month: label, expense: monthlyExp, income: monthlyInc, fullMonth: monthStr };
    });

    return { income, expense, balance, byCategory, spentToday, budgetStatus, monthlyTrend };
  }, [expenses, budgets, settings]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cyber-bg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl glass cyber-border"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-cyber-blue/10 mb-4 ring-1 ring-cyber-blue/30 glow-blue">
              {hasSetPassword ? <Lock className="w-8 h-8 text-cyber-blue" /> : <ShieldCheck className="w-8 h-8 text-cyber-blue" />}
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">KAKEIBO <span className="text-cyber-blue">AETHER</span></h1>
            <p className="text-gray-400 mt-2 text-sm">數據儲存在本地，絕不外泄</p>
          </div>

          <form onSubmit={hasSetPassword ? handleUnlock : handleSetup} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-cyber-blue mb-2 font-mono">
                {hasSetPassword ? '請輸入解鎖口令' : '初始化安全密鑰'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyber-blue transition-colors font-mono tracking-widest"
                autoFocus
              />
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-cyber-pink text-xs font-mono"
              >
                Error: {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-cyber-blue text-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(0,242,255,0.4)]"
            >
              {hasSetPassword ? '同步數據庫' : '生成加密賬本'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>VESION 1.0.4-BETA</span>
            <span>AES-256 ENCRYPTED</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-cyber-blue flex items-center justify-center glow-blue">
              <CreditCard className="text-black w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-none">AETHER</h2>
              <span className="text-[10px] text-cyber-blue font-mono tracking-widest">PROJECT LEDGER</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: List, label: '概覽' },
              { id: 'transactions', icon: History, label: '流水' },
              { id: 'stats', icon: PieChart, label: '分析' },
              { id: 'settings', icon: SettingsIcon, label: '設置' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  view === item.id 
                    ? "bg-cyber-blue/10 text-cyber-blue ring-1 ring-cyber-blue/30" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-cyber-pink hover:bg-cyber-pink/5 transition-all w-full text-sm group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          鎖定數據
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-mono mb-1">Authenticated Session</h3>
            <h1 className="text-3xl font-display font-bold">歡迎回來</h1>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyber-blue text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)]"
          >
            <Plus className="w-5 h-5" />
            新記錄
          </button>
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl glass border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-cyber-blue/10 transition-all" />
                  <span className="text-xs text-gray-500 font-mono mb-1 block">WALLET BALANCE</span>
                  <div className={cn("text-2xl font-display font-bold", stats.balance >= 0 ? "text-cyber-blue" : "text-cyber-pink")}>
                    {formatCurrency(stats.balance)}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                    <CreditCard className="w-3 h-3 text-cyber-blue" /> 當前結餘
                  </div>
                </div>
                <div className="p-6 rounded-2xl glass border border-white/5">
                  <span className="text-xs text-gray-500 font-mono mb-1 block">TOTAL INCOME</span>
                  <div className="text-2xl font-display font-bold text-cyber-blue">
                    {formatCurrency(stats.income)}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                    <TrendingUp className="w-3 h-3 text-cyber-blue" /> 總累計收入
                  </div>
                </div>
                <div className="p-6 rounded-2xl glass border border-white/5">
                  <span className="text-xs text-gray-500 font-mono mb-1 block">TOTAL EXPENSES</span>
                  <div className="text-2xl font-display font-bold text-cyber-pink">
                    {formatCurrency(stats.expense)}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                    <TrendingDown className="w-3 h-3 text-cyber-pink" /> 總累計支出
                  </div>
                </div>
                <div className="p-6 rounded-2xl glass border border-white/5">
                  <span className="text-xs text-gray-500 font-mono mb-1 block">MONTHLY GOAL</span>
                  <div className="text-2xl font-display font-bold text-white">
                    {stats.budgetStatus.length > 0 ? `${Math.round(stats.budgetStatus[0].percent)}%` : '---'}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                    <Target className="w-3 h-3 text-white" /> 預算執行度
                  </div>
                </div>
              </div>

              {/* Budget Progress Bars */}
              {stats.budgetStatus.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.budgetStatus.slice(0, 3).map(b => (
                    <div key={b.id} className="p-4 rounded-xl glass border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-300">{b.category === 'OVERALL' ? '總預算' : b.category}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(b.percent, 100)}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            b.percent > 90 ? "bg-cyber-pink" : "bg-cyber-blue"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Transactions Preview */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h4 className="font-display font-bold text-lg">近期流水</h4>
                  <button onClick={() => setView('transactions')} className="text-xs text-cyber-blue hover:underline">查看全部</button>
                </div>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map(expense => (
                    <div key={expense.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                          style={{ 
                            backgroundColor: `${settings.categoryColors[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category as Category]}20`, 
                            color: settings.categoryColors[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category as Category] 
                          }}
                        >
                          {renderCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">{expense.category} • {expense.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={cn("font-mono font-bold", expense.type === TransactionType.INCOME ? "text-cyber-blue" : "text-cyber-pink")}>
                          {expense.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(expense.amount)}
                        </span>
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-cyber-pink transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                      <div className="text-gray-600 mb-2 font-mono">NO RECORDS FOUND</div>
                      <button onClick={() => setIsFormOpen(true)} className="text-cyber-blue text-sm hover:underline">添加您的第一筆支出</button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'transactions' && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-6 space-y-4">
                 <h2 className="text-xl font-bold font-display">所有交易流水</h2>
                 <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="搜索描述..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyber-blue"
                        />
                    </div>
                    <select 
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value as any)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyber-blue"
                    >
                      <option value="ALL" className="bg-cyber-card">所有類別</option>
                      {Object.values(Category).map(cat => (
                        <option key={cat} value={cat} className="bg-cyber-card">{cat}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                       <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyber-blue"
                       />
                       <span className="text-gray-500">-</span>
                       <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyber-blue"
                       />
                    </div>
                    <button 
                      onClick={() => { setSearchTerm(''); setSearchCategory('ALL'); setStartDate(''); setEndDate(''); }}
                      className="p-2 text-gray-500 hover:text-white"
                      title="重置篩選"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              <div className="space-y-2">
                {filteredExpenses.map(expense => (
                  <div key={expense.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: `${settings.categoryColors[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category as Category]}20`, 
                          color: settings.categoryColors[expense.category] || DEFAULT_CATEGORY_COLORS[expense.category as Category] 
                        }}
                      >
                         {renderCategoryIcon(expense.category, 4)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{expense.category} • {expense.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={cn("font-mono font-bold", expense.type === TransactionType.INCOME ? "text-cyber-blue" : "text-cyber-pink")}>
                        {expense.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(expense.amount)}
                      </span>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-cyber-pink transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl border border-white/10 min-h-[400px]">
                  <h3 className="text-lg font-bold mb-8 font-display">支出類別佔比</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={stats.byCategory}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.byCategory.map((entry, index) => (
                            <ReCell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#16161e', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                     {stats.byCategory.map(c => (
                       <div key={c.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-gray-400">{c.name}:</span>
                          <span className="font-mono">{formatCurrency(c.value)}</span>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10 min-h-[400px]">
                  <h3 className="text-lg font-bold mb-8 font-display">收支平衡對比</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: '當前週期', 收入: stats.income, 支出: stats.expense }
                      ]}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#16161e', border: '1px solid #333', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="收入" fill="#00f2ff" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="支出" fill="#ff00c8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">當前儲蓄率</span>
                        <span className="text-sm font-bold text-cyber-blue">
                          {stats.income > 0 ? `${Math.max(0, Math.round((stats.balance / stats.income) * 100))}%` : '0%'}
                        </span>
                     </div>
                     <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyber-blue transition-all" 
                          style={{ width: `${stats.income > 0 ? Math.max(0, Math.min(100, (stats.balance / stats.income) * 100)) : 0}%` }} 
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/10">
                <h3 className="text-lg font-bold mb-8 font-display">年度數據趨勢 (月度收支)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyTrend}>
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff00c8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff00c8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#16161e', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area name="月收入" type="monotone" dataKey="income" stroke="#00f2ff" fillOpacity={1} fill="url(#colorInc)" />
                      <Area name="月支出" type="monotone" dataKey="expense" stroke="#ff00c8" fillOpacity={1} fill="url(#colorExp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/10">
                <h3 className="text-lg font-bold mb-8 font-display">歷史流水趨勢 (近10筆)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenses.slice(0, 10).reverse()}>
                      <XAxis dataKey="date" hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#16161e', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar 
                        dataKey="amount" 
                        radius={[4, 4, 0, 0]}
                      >
                        {expenses.slice(0, 10).reverse().map((entry, index) => (
                          <ReCell 
                            key={`cell-${index}`} 
                            fill={entry.type === TransactionType.INCOME ? '#00f2ff' : '#ff00c8'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 font-mono text-[10px] text-gray-500">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyber-blue" /> INCOME
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyber-pink" /> EXPENSE
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl space-y-8 pb-20"
            >
              {/* Category Customization */}
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-6">
                <h4 className="flex items-center gap-2 font-bold text-cyber-blue"><Palette className="w-5 h-5" /> 類別樣式自定義</h4>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Personalize your ledger aesthetics</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(Category).map(cat => (
                    <div key={cat} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4 hover:border-cyber-blue/30 transition-all group">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-300">{cat}</span>
                         <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ 
                            backgroundColor: `${settings.categoryColors[cat] || DEFAULT_CATEGORY_COLORS[cat as Category]}20`, 
                            color: settings.categoryColors[cat] || DEFAULT_CATEGORY_COLORS[cat as Category] 
                          }}
                        >
                          {renderCategoryIcon(cat as Category)}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono mb-2 uppercase">Color</label>
                          <input 
                            type="color" 
                            value={settings.categoryColors[cat] || DEFAULT_CATEGORY_COLORS[cat as Category]}
                            onChange={(e) => {
                              const newSettings = {
                                ...settings,
                                categoryColors: { ...settings.categoryColors, [cat]: e.target.value }
                              };
                              setSettings(newSettings);
                              saveToStorage({ settings: newSettings });
                            }}
                            className="bg-transparent border-none w-full h-8 cursor-pointer rounded-lg overflow-hidden"
                          />
                        </div>
                        <div>
                           <label className="block text-[10px] text-gray-500 font-mono mb-2 uppercase">Icon</label>
                           <div className="grid grid-cols-5 gap-2">
                             {AVAILABLE_ICONS.slice(0, 10).map(iconName => (
                               <button 
                                 key={iconName}
                                 onClick={() => {
                                   const newSettings = {
                                     ...settings,
                                     categoryIcons: { ...settings.categoryIcons, [cat]: iconName }
                                   };
                                   setSettings(newSettings);
                                   saveToStorage({ settings: newSettings });
                                 }}
                                 className={cn(
                                   "p-2 rounded-md transition-all hover:bg-white/10",
                                   (settings.categoryIcons?.[cat] || DEFAULT_CATEGORY_ICONS[cat as Category]) === iconName 
                                     ? "bg-cyber-blue text-black" 
                                     : "text-gray-400"
                                 )}
                               >
                                 {React.createElement(ICON_MAP[iconName], { className: "w-3 h-3" })}
                               </button>
                             ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Budgets */}
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-6">
                <h4 className="flex items-center gap-2 font-bold"><Target className="w-5 h-5 text-cyber-blue" /> 每月預算目標</h4>
                <div className="space-y-4">
                  {budgets.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="font-bold text-sm">{b.category}</div>
                        <div className="text-xs text-gray-500 font-mono">MONTHLY GOAL: {formatCurrency(b.amount)}</div>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = budgets.filter(item => item.id !== b.id);
                          setBudgets(updated);
                          saveToStorage({ budgets: updated });
                        }}
                        className="p-2 text-gray-500 hover:text-cyber-pink"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-4 items-end pt-4 border-t border-white/5">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">CATEGORY</label>
                      <select id="budget_cat" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs">
                        <option value="OVERALL">總支出預算</option>
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">AMOUNT (CNY)</label>
                      <input id="budget_amount" type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                    </div>
                    <button 
                      onClick={() => {
                        const cat = (document.getElementById('budget_cat') as HTMLSelectElement).value;
                        const amt = parseFloat((document.getElementById('budget_amount') as HTMLInputElement).value);
                        if (isNaN(amt) || amt <= 0) return;
                        const newBudget: Budget = { id: crypto.randomUUID(), category: cat as any, amount: amt, period: 'MONTHLY' };
                        const updated = [newBudget, ...budgets];
                        setBudgets(updated);
                        saveToStorage({ budgets: updated });
                        (document.getElementById('budget_amount') as HTMLInputElement).value = '';
                      }}
                      className="px-4 py-2 bg-cyber-blue text-black font-bold rounded-lg text-xs hover:bg-white transition-all"
                    >
                      添加預算
                    </button>
                  </div>
                </div>
              </div>

              {/* Recurring Transactions */}
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-6">
                <h4 className="flex items-center gap-2 font-bold"><History className="w-5 h-5 text-cyber-blue" /> 自動循環記錄</h4>
                <div className="space-y-4">
                  {recurring.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="font-bold text-sm">{r.description}</div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase">
                          {r.type} • {r.category} • 每{r.frequency === RecurringFrequency.MONTHLY ? '月' : '天'} • {formatCurrency(r.amount)}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = recurring.filter(item => item.id !== r.id);
                          setRecurring(updated);
                          saveToStorage({ recurring: updated });
                        }}
                        className="p-2 text-gray-500 hover:text-cyber-pink"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                    <div className="col-span-2">
                       <label className="block text-[10px] text-gray-500 font-mono mb-2">DESCRIPTION</label>
                       <input id="rec_desc" type="text" placeholder="例:房租" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">AMOUNT</label>
                      <input id="rec_amount" type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">FREQUENCY</label>
                      <select id="rec_freq" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs">
                        <option value={RecurringFrequency.DAILY}>每日</option>
                        <option value={RecurringFrequency.WEEKLY}>每週</option>
                        <option value={RecurringFrequency.MONTHLY}>每月</option>
                        <option value={RecurringFrequency.YEARLY}>每年</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">CATEGORY</label>
                      <select id="rec_cat" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs">
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-2">TYPE</label>
                      <select id="rec_type" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs">
                        <option value={TransactionType.EXPENSE}>支出</option>
                        <option value={TransactionType.INCOME}>收入</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-[10px] text-gray-500 font-mono mb-2">START DATE</label>
                       <input id="rec_start" type="date" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                    <div>
                       <label className="block text-[10px] text-gray-500 font-mono mb-2">END DATE (OPTIONAL)</label>
                       <input id="rec_end" type="date" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs" />
                    </div>
                    <button 
                      onClick={() => {
                        const desc = (document.getElementById('rec_desc') as HTMLInputElement).value;
                        const amt = parseFloat((document.getElementById('rec_amount') as HTMLInputElement).value);
                        const freq = (document.getElementById('rec_freq') as HTMLSelectElement).value;
                        const cat = (document.getElementById('rec_cat') as HTMLSelectElement).value;
                        const type = (document.getElementById('rec_type') as HTMLSelectElement).value;
                        const start = (document.getElementById('rec_start') as HTMLInputElement).value;
                        const end = (document.getElementById('rec_end') as HTMLInputElement).value;

                        if (!desc || isNaN(amt) || amt <= 0) return;
                        
                        const newRec: RecurringTransaction = {
                          id: crypto.randomUUID(),
                          description: desc,
                          amount: amt,
                          category: cat as Category,
                          type: type as TransactionType,
                          frequency: freq as RecurringFrequency,
                          startDate: start,
                          endDate: end || undefined
                        };
                        
                        const updated = [newRec, ...recurring];
                        setRecurring(updated);
                        saveToStorage({ recurring: updated });
                        
                        (document.getElementById('rec_desc') as HTMLInputElement).value = '';
                        (document.getElementById('rec_amount') as HTMLInputElement).value = '';
                      }}
                      className="px-4 py-2 bg-cyber-blue text-black font-bold rounded-lg text-xs hover:bg-white transition-all self-end"
                    >
                      添加循環
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Security Actions */}
              <div className="p-6 rounded-2xl glass border border-white/5 space-y-4">
                <h4 className="flex items-center gap-2 font-bold"><ShieldCheck className="w-5 h-5 text-cyber-blue" /> 數據安全管理</h4>
                <p className="text-sm text-gray-400">所有數據均使用 AES-256 加密儲存在您的瀏覽器中。使用嚮導可以引導您安全地進行數據導出或備份恢復。</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        setWizardType('export');
                        setWizardStep(1);
                        setIsWizardOpen(true);
                    }}
                    className="flex-1 py-3 bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 rounded-xl text-sm font-bold hover:bg-cyber-blue hover:text-black transition-all"
                  >
                    開啟導出嚮導
                  </button>
                  <button 
                    onClick={() => {
                        setWizardType('import');
                        setWizardStep(1);
                        setIsWizardOpen(true);
                    }}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white hover:text-black transition-all"
                  >
                    開啟導入嚮導
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass border border-white/10 space-y-4 border-cyber-pink/20">
                <h4 className="flex items-center gap-2 font-bold text-cyber-pink"><Trash2 className="w-5 h-5" /> 危險區域</h4>
                <p className="text-sm text-gray-400">清除本地所有數據並重置密鑰。此操作不可撤銷且需要身份驗證。</p>
                <button 
                  onClick={() => {
                    verifyAction('清除所有本地數據', () => {
                      localStorage.clear();
                      window.location.reload();
                    });
                  }}
                  className="px-6 py-3 bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30 rounded-xl text-sm font-bold hover:bg-cyber-pink hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,200,0.1)]"
                >
                  重置賬本
                </button>
              </div>
            </motion.div>
          )}

          {/* Re-auth Modal */}
          <AnimatePresence>
            {isReauthOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-sm p-8 rounded-3xl glass border border-cyber-blue/30"
                >
                  <div className="text-center mb-6">
                    <Lock className="w-10 h-10 text-cyber-blue mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-1">身份驗證</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Confirming: {reauthCallback?.title}</p>
                  </div>
                  <form onSubmit={handleReauth} className="space-y-4">
                    <input 
                      type="password"
                      autoFocus
                      placeholder="請輸入主密碼驗證"
                      value={reauthPassword}
                      onChange={(e) => setReauthPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyber-blue focus:outline-none font-mono tracking-widest"
                    />
                    <div className="flex gap-3">
                      <button 
                        type="button" onClick={() => setIsReauthOpen(false)}
                        className="flex-1 py-3 text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        取消
                      </button>
                      <button 
                        type="submit"
                        className="flex-3 py-3 bg-cyber-blue text-black font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                      >
                        確認執行
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
           <AnimatePresence>
            {isWizardOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                  onClick={() => setIsWizardOpen(false)}
                />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="relative w-full max-w-lg p-10 rounded-[2.5rem] glass border border-cyber-blue/20 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg bg-cyber-blue/20", wizardType === 'export' ? "text-cyber-blue" : "text-cyber-pink")}>
                            {wizardType === 'export' ? <Download className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                          </div>
                          <div>
                            <h2 className="text-xl font-display font-bold">{wizardType === 'export' ? '導出嚮導' : '導入嚮導'}</h2>
                            <p className="text-[10px] text-gray-500 font-mono uppercase">Step {wizardStep} of 3</p>
                          </div>
                       </div>
                       <button onClick={() => setIsWizardOpen(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>

                    {wizardStep === 1 && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <h3 className="text-lg font-bold">歡迎使用數據遷移嚮導</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          本工具將協助您安全地遷移您的 Aether Ledger 數據。
                          {wizardType === 'export' 
                            ? '導出文件將包含加密的交易實體、您的個性化設置以及密鑰鹽值。' 
                            : '導入備份文件將覆蓋當前瀏覽器中的所有數據（包括主密鑰）。'}
                        </p>
                        <div className="p-4 rounded-xl bg-cyber-pink/5 border border-cyber-pink/20 flex gap-3 items-start">
                           <AlertCircle className="w-5 h-5 text-cyber-pink shrink-0 mt-0.5" />
                           <p className="text-xs text-cyber-pink/80 leading-relaxed font-medium">
                             數據遷移涉及核心隱私，請確保您在安全的私密網絡環境下操作，且導出的文件應由您妥善保管。
                           </p>
                        </div>
                        <button 
                          onClick={() => setWizardStep(2)}
                          className="w-full py-4 bg-cyber-blue text-black font-bold rounded-xl shadow-lg hover:shadow-cyber-blue/20 transition-all"
                        >
                          我明白，開始下一步
                        </button>
                      </motion.div>
                    )}

                    {wizardStep === 2 && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <h3 className="text-lg font-bold">{wizardType === 'export' ? '準備就緒' : '請上傳備份文件'}</h3>
                        <p className="text-sm text-gray-400">
                          {wizardType === 'export' 
                            ? '點擊下方按鈕將生成並下載您的加密 .json 備份。' 
                            : '請選擇您之前導出的 .json 格式備份文件。'}
                        </p>
                        {wizardType === 'export' ? (
                          <button 
                            onClick={() => {
                                handleExport();
                                setWizardStep(3);
                            }}
                            className="w-full py-8 border-2 border-dashed border-cyber-blue/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-cyber-blue/5 transition-all text-cyber-blue group"
                          >
                             <Download className="w-10 h-10 group-hover:scale-110 transition-transform" />
                             <span className="font-bold">立即生成備份文件</span>
                          </button>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept=".json" 
                              onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                      try {
                                          const backup = JSON.parse(event.target?.result as string);
                                          if (backup.salt && backup.cipherData && backup.pwdHash) {
                                              localStorage.setItem(STORAGE_KEYS.SALT, backup.salt);
                                              localStorage.setItem(STORAGE_KEYS.CIPHER_DATA, backup.cipherData);
                                              localStorage.setItem(STORAGE_KEYS.PWD_HASH, backup.pwdHash);
                                              setWizardStep(3);
                                          } else { alert('無效的格式'); }
                                      } catch (err) { alert('解析失敗'); }
                                  };
                                  reader.readAsText(file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                            <div className="w-full py-8 border-2 border-dashed border-cyber-pink/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-cyber-pink/5 transition-all text-cyber-pink group">
                               <Upload className="w-10 h-10 group-hover:scale-110 transition-transform" />
                               <span className="font-bold">點擊或拖拽上傳 JSON</span>
                            </div>
                          </div>
                        )}
                        <button onClick={() => setWizardStep(1)} className="w-full text-xs text-gray-500 hover:text-white transition-colors">上一步</button>
                      </motion.div>
                    )}

                    {wizardStep === 3 && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                           <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold font-display">{wizardType === 'export' ? '備份成功' : '恢復完成'}</h3>
                        <p className="text-sm text-gray-400">
                          {wizardType === 'export' 
                            ? '您的數據已安全導出。請記住，備份文件與您的主密鑰必須配套使用。' 
                            : '數據已成功從備份中恢復。頁面即將重啟以加載最新數據。'}
                        </p>
                        <button 
                          onClick={() => {
                              if (wizardType === 'import') window.location.reload();
                              else setIsWizardOpen(false);
                          }}
                          className="w-full py-4 bg-white text-black font-bold rounded-xl transition-all"
                        >
                          {wizardType === 'import' ? '立即刷新頁面' : '關閉嚮導'}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </main>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg p-8 rounded-3xl glass cyber-border overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-cyber-pink to-cyber-blue animate-pulse" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold">新記錄</h2>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                  <button 
                    onClick={() => setNewType(TransactionType.EXPENSE)}
                    className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", newType === TransactionType.EXPENSE ? "bg-cyber-pink text-white" : "text-gray-400")}
                  >
                    支出
                  </button>
                  <button 
                    onClick={() => setNewType(TransactionType.INCOME)}
                    className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", newType === TransactionType.INCOME ? "bg-cyber-blue text-black" : "text-gray-400")}
                  >
                    收入
                  </button>
                </div>
              </div>
              
              <form onSubmit={addExpense} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono">
                    {newType === TransactionType.INCOME ? '收入金額' : '支出金額'} (CNY)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-3xl font-mono focus:outline-none focus:border-cyber-blue",
                      newType === TransactionType.INCOME ? "text-cyber-blue" : "text-cyber-pink"
                    )}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono">類別</label>
                     <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as Category)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyber-blue appearance-none"
                     >
                       {Object.values(Category).map(cat => (
                         <option key={cat} value={cat} className="bg-cyber-card">{cat}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono">日期</label>
                     <input 
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyber-blue"
                     />
                   </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono">描述</label>
                  <input 
                    type="text"
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={newType === TransactionType.INCOME ? "工資、投資回報..." : "午餐、地鐵票、電影..."}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyber-blue"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className={cn(
                      "flex-1 py-4 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]",
                      newType === TransactionType.INCOME ? "bg-cyber-blue text-black" : "bg-cyber-pink text-white"
                    )}
                  >
                    確認入賬
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
