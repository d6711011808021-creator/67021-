import React from 'react';
import { User } from 'firebase/auth';
import { formatThaiMonth, getAdjacentMonth, getCurrentMonth } from '../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LogIn,
  LogOut,
  Calendar,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onSignIn,
  onSignOut,
}) => {
  const currentMonthStr = getCurrentMonth();
  const isCurrentMonth = selectedMonth === currentMonthStr;

  const handlePrevMonth = () => {
    onMonthChange(getAdjacentMonth(selectedMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(getAdjacentMonth(selectedMonth, 1));
  };

  const handleGoCurrentMonth = () => {
    onMonthChange(currentMonthStr);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg tracking-tight">67021 Jam</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ระบบจัดการและวิเคราะห์รายรับรายจ่าย</p>
            </div>
          </div>

          {/* Month Selector Carousel in Center */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 hidden sm:block" />
              <span className="font-bold text-xs sm:text-sm text-slate-800 min-w-[90px] sm:min-w-[120px] text-center">
                {formatThaiMonth(selectedMonth)}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonth && (
              <button
                onClick={handleGoCurrentMonth}
                className="hidden md:inline-flex text-[11px] font-bold text-indigo-600 hover:bg-white px-2 py-1 rounded-lg transition ml-1"
              >
                เดือนนี้
              </button>
            )}
          </div>

          {/* Right Actions: Add button & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAddModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              บันทึกรายการ
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{user.email}</p>
                </div>
                <button
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
