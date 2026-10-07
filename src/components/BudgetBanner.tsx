import React from 'react';
import { formatCurrency, formatThaiMonth } from '../utils/formatters';
import { Target, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';

interface BudgetBannerProps {
  monthlyLimit: number;
  totalExpense: number;
  selectedMonth: string;
  onOpenBudgetModal: () => void;
}

export const BudgetBanner: React.FC<BudgetBannerProps> = ({
  monthlyLimit,
  totalExpense,
  selectedMonth,
  onOpenBudgetModal,
}) => {
  if (monthlyLimit <= 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">ยังไม่ได้ตั้งเป้าหมายงบประมาณสำหรับเดือน {formatThaiMonth(selectedMonth)}</h4>
            <p className="text-xs text-slate-500">กำหนดวงเงินค่าใช้จ่ายเพื่อควบคุมการเงินและแจ้งเตือนเมื่อใช้จ่ายใกล้เต็มวงเงิน</p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <Target className="w-4 h-4" />
          ตั้งงบประมาณ
        </button>
      </div>
    );
  }

  const percentUsed = Math.min(100, Math.round((totalExpense / monthlyLimit) * 100));
  const remaining = monthlyLimit - totalExpense;
  const isOverBudget = remaining < 0;
  const isWarning = !isOverBudget && percentUsed >= 80;

  return (
    <div className={`rounded-2xl p-5 border shadow-xs transition-all ${
      isOverBudget
        ? 'bg-rose-50/70 border-rose-200'
        : isWarning
        ? 'bg-amber-50/70 border-amber-200'
        : 'bg-white border-slate-100'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            isOverBudget
              ? 'bg-rose-500 text-white'
              : isWarning
              ? 'bg-amber-500 text-white'
              : 'bg-indigo-50 text-indigo-600'
          }`}>
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Target className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700">
              งบประมาณประจำเดือน {formatThaiMonth(selectedMonth)}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">
                ใช้ไปแล้ว <strong className="text-slate-800">{formatCurrency(totalExpense)}</strong> / {formatCurrency(monthlyLimit)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className={`text-xs font-bold ${
              isOverBudget ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-700'
            }`}>
              {isOverBudget ? `เกินงบ ${formatCurrency(Math.abs(remaining))}` : `คงเหลืองบ ${formatCurrency(remaining)}`}
            </span>
            <p className="text-[10px] text-slate-400 font-medium">({percentUsed}%)</p>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
            title="ปรับแก้งบประมาณ"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-indigo-600'
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </div>
  );
};
