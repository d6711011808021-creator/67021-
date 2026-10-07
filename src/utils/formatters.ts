import { Transaction, MonthlyStats, DEFAULT_CATEGORIES } from '../types';

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatThaiMonth(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const thaiYear = parseInt(yearStr, 10) + 543;
  const monthName = THAI_MONTH_NAMES[monthIdx] || monthNumStr;
  return `${monthName} ${thaiYear}`;
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [yearStr, monthNumStr, dayStr] = dateStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const thaiYear = parseInt(yearStr, 10) + 543;
  const day = parseInt(dayStr, 10);
  const monthShort = THAI_MONTH_SHORT[monthIdx] || monthNumStr;
  return `${day} ${monthShort} ${thaiYear}`;
}

export function getAdjacentMonth(currentMonth: string, offset: number): string {
  const [yearStr, monthStr] = currentMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + offset;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function calculateMonthlyStats(transactions: Transaction[], selectedMonth: string): MonthlyStats {
  const monthlyTx = transactions.filter(t => t.month === selectedMonth);
  
  let totalIncome = 0;
  let totalExpense = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  const categoryMap: Record<string, number> = {};

  // Parse days in month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Initialize daily trends
  const dailyMap: Record<number, { income: number; expense: number; dateStr: string }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
    dailyMap[d] = { income: 0, expense: 0, dateStr: dayStr };
  }

  for (const t of monthlyTx) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      totalIncome += amt;
      incomeCount += 1;
    } else {
      totalExpense += amt;
      expenseCount += 1;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    }

    // Daily breakdown
    const day = parseInt(t.date.split('-')[2], 10);
    if (dailyMap[day]) {
      if (t.type === 'income') {
        dailyMap[day].income += amt;
      } else {
        dailyMap[day].expense += amt;
      }
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
  const dailyAverageExpense = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;

  // Category breakdown list
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([catName, amount]) => {
      const match = DEFAULT_CATEGORIES.find(c => c.name === catName);
      return {
        category: catName,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: match?.color || '#94A3B8',
        iconName: match?.iconName || 'Tag',
        type: 'expense' as const,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const dailyTrends = Object.entries(dailyMap).map(([day, val]) => ({
    day: parseInt(day, 10),
    dateStr: val.dateStr,
    income: val.income,
    expense: val.expense,
  }));

  return {
    month: selectedMonth,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    expenseCount,
    incomeCount,
    dailyAverageExpense,
    categoryBreakdown,
    dailyTrends,
  };
}
