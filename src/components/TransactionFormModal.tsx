import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, DollarSign } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default category when type changes or on open
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod || 'bank_transfer');
      setNote(initialData.note || '');
    } else {
      setAmount('');
      setDate(getTodayDateString());
      setNote('');
      const defaultCat = DEFAULT_CATEGORIES.find((c) => c.type === type);
      if (defaultCat) setCategory(defaultCat.name);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!initialData) {
      const defaultCat = DEFAULT_CATEGORIES.find((c) => c.type === type);
      if (defaultCat) setCategory(defaultCat.name);
    }
  }, [type]);

  if (!isOpen) return null;

  const currentCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!category.trim()) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    const month = date.substring(0, 7); // YYYY-MM

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        type,
        amount: numAmount,
        category: category.trim().slice(0, 50),
        date,
        month,
        paymentMethod,
        note: note.trim().slice(0, 200),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAmountPreset = (extra: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount(String(cur + extra));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h2>
            <p className="text-xs text-slate-500">โครงการ 67021 Jam</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector (รายจ่าย / รายรับ) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white opacity-80" />
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white opacity-80" />
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="text-2xl font-bold">฿</span>
              </div>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 text-2xl font-black rounded-2xl border transition focus:outline-none focus:ring-2 ${
                  type === 'expense'
                    ? 'border-slate-200 focus:ring-rose-500 focus:border-rose-500 text-rose-600'
                    : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-600'
                }`}
                autoFocus
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {[50, 100, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addAmountPreset(preset)}
                  className="flex-1 py-1 px-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">
              เลือกหมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} size={16} />
                    </div>
                    <span className="text-[11px] leading-tight line-clamp-2">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
                วันที่ทำรายการ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="เช่น ซื้อกาแฟเช้า, ค่าตั๋วรถไฟฟ้า, เงินเดือนงวดแรก"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2 transition disabled:opacity-50 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
