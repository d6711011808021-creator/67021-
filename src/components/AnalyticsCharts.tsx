import React, { useState } from 'react';
import { MonthlyStats } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { TrendingDown, TrendingUp, PieChart as PieIcon, BarChart2, Calendar } from 'lucide-react';

interface AnalyticsChartsProps {
  stats: MonthlyStats;
  onSelectCategory?: (category: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, onSelectCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: number; dateStr: string; income: number; expense: number } | null>(null);

  const { categoryBreakdown, dailyTrends, totalExpense, totalIncome, netSavings } = stats;

  // Calculate SVG donut paths
  const radius = 80;
  const strokeWidth = 28;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSlices = categoryBreakdown.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Daily Trends max for scaling
  const maxDailyValue = Math.max(
    ...dailyTrends.map(d => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Top 3 Summary Mini-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">รายรับทั้งหมด</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.incomeCount} รายการ</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">รายจ่ายทั้งหมด</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.expenseCount} รายการ</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">คงเหลือสุทธิ</p>
            <p className={`text-2xl font-bold mt-1 ${netSavings >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
              {formatCurrency(netSavings)}
            </p>
            <p className="text-xs text-slate-400 mt-1">อัตราการออม {stats.savingsRate}%</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netSavings >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut & Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">สัดส่วนค่าใช้จ่ายตามหมวดหมู่</h3>
              </div>
              <span className="text-xs text-slate-400">{categoryBreakdown.length} หมวดหมู่</span>
            </div>

            {totalExpense === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <PieIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>ยังไม่มีรายการรายจ่ายในเดือนนี้</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* SVG Donut Chart */}
                <div className="relative w-52 h-52 my-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth={strokeWidth}
                    />
                    {donutSlices.map((slice) => {
                      const isHovered = hoveredCategory === slice.category;
                      return (
                        <circle
                          key={slice.category}
                          cx={center}
                          cy={center}
                          r={radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => setHoveredCategory(slice.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => onSelectCategory && onSelectCategory(slice.category)}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    <span className="text-xs text-slate-400 font-medium">รวมรายจ่าย</span>
                    <span className="text-base font-extrabold text-slate-800 truncate max-w-[140px]">
                      {formatCurrency(totalExpense)}
                    </span>
                    {hoveredCategory && (
                      <span className="text-xs font-semibold text-rose-500 mt-1 truncate max-w-[120px]">
                        {hoveredCategory}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category List */}
                <div className="w-full space-y-2.5 mt-4 max-h-56 overflow-y-auto pr-1">
                  {categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      onClick={() => onSelectCategory && onSelectCategory(item.category)}
                      onMouseEnter={() => setHoveredCategory(item.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-sm ${
                        hoveredCategory === item.category ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700 truncate">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-slate-500 font-medium text-xs">{item.percentage}%</span>
                        <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Spending Trend Timeline Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">แนวโน้มรายรับ-รายจ่ายรายวัน</h3>
                  <p className="text-xs text-slate-400">เฉลี่ยรายจ่ายวันละ {formatCurrency(stats.dailyAverageExpense)}</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600">รายรับ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span className="text-slate-600">รายจ่าย</span>
                </div>
              </div>
            </div>

            {/* Daily Bar Chart */}
            <div className="relative pt-6">
              {hoveredDay && (
                <div className="absolute top-0 left-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-3 z-10 animate-in fade-in">
                  <span className="font-semibold">{formatThaiDate(hoveredDay.dateStr)}</span>
                  {hoveredDay.income > 0 && (
                    <span className="text-emerald-400 font-medium">รับ: +{formatCurrency(hoveredDay.income)}</span>
                  )}
                  {hoveredDay.expense > 0 && (
                    <span className="text-rose-400 font-medium">จ่าย: -{formatCurrency(hoveredDay.expense)}</span>
                  )}
                  {hoveredDay.income === 0 && hoveredDay.expense === 0 && (
                    <span className="text-slate-400">ไม่มีรายการ</span>
                  )}
                </div>
              )}

              <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
                {dailyTrends.map((d) => {
                  const expenseHeightPercent = Math.min(100, Math.round((d.expense / maxDailyValue) * 100));
                  const incomeHeightPercent = Math.min(100, Math.round((d.income / maxDailyValue) * 100));
                  const hasActivity = d.expense > 0 || d.income > 0;

                  return (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="flex-1 min-w-[12px] h-full flex flex-col justify-end items-center group cursor-pointer relative"
                    >
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Income Bar */}
                        <div
                          style={{ height: `${incomeHeightPercent}%` }}
                          className={`w-1.5 bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500 ${
                            incomeHeightPercent === 0 ? 'hidden' : ''
                          }`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expenseHeightPercent}%` }}
                          className={`w-1.5 bg-rose-400 rounded-t-sm transition-all group-hover:bg-rose-500 ${
                            expenseHeightPercent === 0 ? 'hidden' : ''
                          }`}
                        />
                        {!hasActivity && (
                          <div className="w-1 h-1 rounded-full bg-slate-200 mb-1" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono group-hover:text-indigo-600 group-hover:font-bold">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                <span>ต้นเดือน (วันที่ 1)</span>
                <span>กลางเดือน (วันที่ 15)</span>
                <span>สิ้นเดือน ({dailyTrends.length})</span>
              </div>
            </div>
          </div>

          {/* Highest Spending Categories Ranking Progress */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">
              อันดับหมวดหมู่ใช้จ่ายสูงสุด 4 อันดับแรก
            </h4>
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 4).map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">#{idx + 1}</span>
                      <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" style={{ color: cat.color } as any} />
                      <span className="font-medium text-slate-700">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-400">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 0 && (
                <p className="text-xs text-slate-400">ไม่มีข้อมูลหมวดหมู่</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
