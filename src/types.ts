export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'promptpay' | 'other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  monthlyLimit: number;
  updatedAt: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  // Expenses
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', iconName: 'Utensils', color: '#F97316', bgColor: '#FFEDD5' },
  { id: 'transport', name: 'การเดินทางและน้ำมัน', type: 'expense', iconName: 'Car', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'housing', name: 'ที่อยู่อาศัยและบิล', type: 'expense', iconName: 'Home', color: '#6366F1', bgColor: '#EEF2FF' },
  { id: 'shopping', name: 'ช้อปปิ้งของใช้', type: 'expense', iconName: 'ShoppingBag', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'entertainment', name: 'บันเทิงและสังสรรค์', type: 'expense', iconName: 'Gamepad2', color: '#A855F7', bgColor: '#F3E8FF' },
  { id: 'health', name: 'สุขภาพและการรักษา', type: 'expense', iconName: 'HeartPulse', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'education', name: 'การศึกษาและหนังสือ', type: 'expense', iconName: 'GraduationCap', color: '#14B8A6', bgColor: '#CCFBF1' },
  { id: 'bills', name: 'ค่าน้ำค่าไฟ/อินเทอร์เน็ต', type: 'expense', iconName: 'Zap', color: '#EAB308', bgColor: '#FEF9C3' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', iconName: 'MoreHorizontal', color: '#64748B', bgColor: '#F1F5F9' },

  // Income
  { id: 'salary', name: 'เงินเดือนประจำ', type: 'income', iconName: 'Wallet', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'bonus', name: 'โบนัสและเงินรางวัล', type: 'income', iconName: 'Trophy', color: '#059669', bgColor: '#A7F3D0' },
  { id: 'freelance', name: 'งานเสริม/ฟรีแลนซ์', type: 'income', iconName: 'Briefcase', color: '#0D9488', bgColor: '#CCFBF1' },
  { id: 'investment', name: 'การลงทุนและปันผล', type: 'income', iconName: 'TrendingUp', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'business', name: 'กำไรจากการค้าขาย', type: 'income', iconName: 'Store', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'gift', name: 'ของขวัญ/เงินช่วย', type: 'income', iconName: 'Gift', color: '#DB2777', bgColor: '#FCE7F3' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', iconName: 'PlusCircle', color: '#0284C7', bgColor: '#E0F2FE' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
  { id: 'bank_transfer', label: 'โอนเงิน (Mobile Banking)', icon: 'CreditCard' },
  { id: 'promptpay', label: 'พร้อมเพย์ (PromptPay)', icon: 'QrCode' },
  { id: 'credit_card', label: 'บัตรเครดิต/เดบิต', icon: 'CreditCard' },
  { id: 'other', label: 'อื่นๆ', icon: 'HelpCircle' },
];

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage
  expenseCount: number;
  incomeCount: number;
  dailyAverageExpense: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
    iconName: string;
    type: TransactionType;
  }[];
  dailyTrends: {
    day: number;
    dateStr: string;
    income: number;
    expense: number;
  }[];
}
