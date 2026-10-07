import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onSeedSampleData?: () => void;
  selectedCategoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onSeedSampleData,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Specific category filter
        if (selectedCategoryFilter && tx.category !== selectedCategoryFilter) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchNote = tx.note?.toLowerCase().includes(term);
          const matchCat = tx.category.toLowerCase().includes(term);
          const matchAmt = tx.amount.toString().includes(term);
          if (!matchNote && !matchCat && !matchAmt) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, selectedCategoryFilter, searchTerm, sortBy]);

  const handleDeleteClick = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getCategoryDef = (catName: string) => {
    return DEFAULT_CATEGORIES.find((c) => c.name === catName);
  };

  const getPaymentLabel = (methodId?: string) => {
    return PAYMENT_METHODS.find((m) => m.id === methodId)?.label || methodId;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามหมวดหมู่, บันทึก หรือจำนวนเงิน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="date_desc">วันที่ล่าสุด</option>
            <option value="date_asc">วันที่เก่าสุด</option>
            <option value="amount_desc">จำนวนเงินมากสุด</option>
            <option value="amount_asc">จำนวนเงินน้อยสุด</option>
          </select>
        </div>
      </div>

      {/* Active Category Filter Tag if selected */}
      {selectedCategoryFilter && (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-medium">
          <span>กรองตามหมวดหมู่: <strong className="font-bold">{selectedCategoryFilter}</strong></span>
          <button
            onClick={onClearCategoryFilter}
            className="ml-auto underline hover:text-indigo-900 text-xs"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-700 text-base">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {transactions.length === 0
              ? 'ยังไม่มีรายการใดๆ ในเดือนนี้ คุณสามารถเพิ่มรายการใหม่ หรือโหลดตัวอย่างข้อมูลได้ทันที'
              : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองด้านบนเพื่อแสดงรายการที่ต้องการ'}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการใหม่
            </button>
            {transactions.length === 0 && onSeedSampleData && (
              <button
                onClick={onSeedSampleData}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                โหลดตัวอย่างข้อมูลจำลอง
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => {
            const catDef = getCategoryDef(tx.category);
            const isExpense = tx.type === 'expense';
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={tx.id}
                className={`py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/70 rounded-2xl px-2.5 transition ${
                  isDeleting ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                    style={{
                      backgroundColor: catDef?.bgColor || (isExpense ? '#FEE2E2' : '#D1FAE5'),
                      color: catDef?.color || (isExpense ? '#EF4444' : '#10B981'),
                    }}
                  >
                    <CategoryIcon name={catDef?.iconName || (isExpense ? 'ArrowDownRight' : 'ArrowUpRight')} size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm truncate">{tx.category}</span>
                      {tx.paymentMethod && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          {getPaymentLabel(tx.paymentMethod)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatThaiDate(tx.date)}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-base font-extrabold flex items-center justify-end gap-0.5 ${
                        isExpense ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isExpense ? 'รายจ่าย' : 'รายรับ'}
                    </p>
                  </div>

                  {/* Actions (visible on hover / mobile touch) */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit(tx)}
                      title="แก้ไข"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(tx.id)}
                      title="ลบ"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
