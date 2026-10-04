export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316', bg: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'groceries', name: 'Groceries & Mart', icon: 'ShoppingCart', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'transport', name: 'Transport & Fuel', icon: 'Fuel', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Zap', color: '#eab308', bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: 'ShoppingBag', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { id: 'sadaqah', name: 'Islamic & Sadaqah', icon: 'HeartHandshake', color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'health', name: 'Health & Pharmacy', icon: 'HeartPulse', color: '#ef4444', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { id: 'home', name: 'Home & Rent', icon: 'Home', color: '#6366f1', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'education', name: 'Education & Books', icon: 'GraduationCap', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'entertainment', name: 'Leisure & Outing', icon: 'Coffee', color: '#a855f7', bg: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20' },
  { id: 'personal', name: 'Personal Care', icon: 'Sparkles', color: '#14b8a6', bg: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
  { id: 'other_exp', name: 'Other Expense', icon: 'MoreHorizontal', color: '#64748b', bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary / Wages', icon: 'Briefcase', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'business', name: 'Business & Sales', icon: 'Store', color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'freelance', name: 'Freelance & Contract', icon: 'Laptop', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'investments', name: 'Investment / Profits', icon: 'TrendingUp', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'gift', name: 'Gift / Allowance', icon: 'Gift', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { id: 'other_inc', name: 'Other Income', icon: 'PlusCircle', color: '#64748b', bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
];

export const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000];

export const DEFAULT_ACCOUNTS = [
  { name: 'Cash', account_type: 'cash', color: '#10b981', icon: 'Wallet', bank_name: 'Cash in Hand' },
  { name: 'UPI (Kotak)', account_type: 'upi', color: '#ef4444', icon: 'Smartphone', bank_name: 'Kotak Mahindra Bank' },
  { name: 'UPI (Canara)', account_type: 'upi', color: '#0284c7', icon: 'Smartphone', bank_name: 'Canara Bank' },
];

export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }
  const num = Number(amount);
  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (isNegative) {
    return showSymbol ? `-₹${absFormatted}` : `-${absFormatted}`;
  }
  return showSymbol ? `₹${absFormatted}` : absFormatted;
};
