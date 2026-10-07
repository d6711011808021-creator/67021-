import React, { useState, useEffect } from 'react';
import { formatCurrency, formatThaiMonth } from '../utils/formatters';
import { Target, X, Check } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  currentBudget: number;
  onSaveBudget: (month: string, amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  currentBudget,
  onSaveBudget,
}) => {
  const [budgetLimit, setBudgetLimit] = useState<string>(String(currentBudget || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBudgetLimit(currentBudget > 0 ? String(currentBudget) : '');
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetLimit);
    if (isNaN(amount) || amount < 0) {
      setError('กรุณาระบุจำนวนงบประมาณที่ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSaveBudget(selectedMonth, amount);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">ตั้งงบประมาณรายจ่าย</h3>
              <p className="text-xs text-slate-500">ประจำเดือน {formatThaiMonth(selectedMonth)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">
              วงเงินงบประมาณรายจ่าย (บาท)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-xl">
                ฿
              </div>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="เช่น 15000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xl font-bold rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              ระบบจะช่วยเตือนเมื่อค่าใช้จ่ายในเดือนนี้ใกล้ถึงหรือเกินงบประมาณที่กำหนดไว้
            </p>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[10000, 15000, 20000, 30000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBudgetLimit(String(amt))}
                className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                {amt.toLocaleString()} ฿
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
