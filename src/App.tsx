import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { Transaction, MonthlyBudget, TransactionType } from './types';
import {
  getCurrentMonth,
  calculateMonthlyStats,
  formatCurrency,
  formatThaiMonth,
} from './utils/formatters';
import { SAMPLE_TRANSACTIONS } from './utils/sampleData';

import { Header } from './components/Header';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetModal } from './components/BudgetModal';
import { BudgetBanner } from './components/BudgetBanner';

import {
  BarChart3,
  ListOrdered,
  Plus,
  Download,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Database,
  LogIn,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Target,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Realtime Firestore sync for transactions and budgets
  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      // Authenticated User: Read from Firestore
      const txPath = `users/${user.uid}/transactions`;
      const txColRef = collection(db, 'users', user.uid, 'transactions');

      const unsubscribeTx = onSnapshot(
        txColRef,
        (snapshot) => {
          const list: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId || user.uid,
              type: data.type,
              amount: Number(data.amount) || 0,
              category: data.category || 'อื่นๆ',
              note: data.note || '',
              date: data.date,
              month: data.month,
              paymentMethod: data.paymentMethod || 'bank_transfer',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            });
          });
          setTransactions(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, txPath);
        }
      );

      const budgetPath = `users/${user.uid}/budgets`;
      const budgetColRef = collection(db, 'users', user.uid, 'budgets');
      const unsubscribeBudget = onSnapshot(
        budgetColRef,
        (snapshot) => {
          const bMap: Record<string, number> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.month && typeof data.monthlyLimit === 'number') {
              bMap[data.month] = data.monthlyLimit;
            }
          });
          setBudgets(bMap);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, budgetPath);
        }
      );

      return () => {
        unsubscribeTx();
        unsubscribeBudget();
      };
    } else {
      // Guest local storage fallback
      const localData = localStorage.getItem('jam_guest_transactions');
      if (localData) {
        try {
          setTransactions(JSON.parse(localData));
        } catch {
          setTransactions([]);
        }
      } else {
        // Default initial demo items for new guests
        seedSampleDataLocally();
      }

      const localBudgets = localStorage.getItem('jam_guest_budgets');
      if (localBudgets) {
        try {
          setBudgets(JSON.parse(localBudgets));
        } catch {
          setBudgets({});
        }
      }
    }
  }, [user, isAuthReady]);

  // Save guest transactions locally if not logged in
  const saveGuestTransactions = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    localStorage.setItem('jam_guest_transactions', JSON.stringify(newTxList));
  };

  const seedSampleDataLocally = () => {
    const month = getCurrentMonth();
    const demoItems: Transaction[] = SAMPLE_TRANSACTIONS.map((item, idx) => ({
      id: `sample_${Date.now()}_${idx}`,
      userId: 'guest',
      type: item.type,
      amount: item.amount,
      category: item.category,
      note: item.note,
      date: `${month}-${String(item.dayOffset).padStart(2, '0')}`,
      month,
      paymentMethod: item.paymentMethod,
      createdAt: new Date().toISOString(),
    }));
    setTransactions(demoItems);
    localStorage.setItem('jam_guest_transactions', JSON.stringify(demoItems));
  };

  // Monthly stats calculation
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const currentMonthlyBudget = budgets[selectedMonth] || 0;

  // Handle Sign In with Google
  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      showToast(`เข้าสู่ระบบสำเร็จ: ยินดีต้อนรับคุณ ${signedInUser.displayName || signedInUser.email}`, 'success');

      // Check if user has offline transactions to sync to Firebase
      const localTx = localStorage.getItem('jam_guest_transactions');
      if (localTx) {
        try {
          const parsed = JSON.parse(localTx) as Transaction[];
          if (parsed.length > 0) {
            const batch = writeBatch(db);
            parsed.forEach((tx) => {
              const docRef = doc(collection(db, 'users', signedInUser.uid, 'transactions'));
              batch.set(docRef, {
                userId: signedInUser.uid,
                type: tx.type,
                amount: tx.amount,
                category: tx.category,
                note: tx.note || '',
                date: tx.date,
                month: tx.month,
                paymentMethod: tx.paymentMethod || 'bank_transfer',
                createdAt: serverTimestamp(),
              });
            });
            await batch.commit();
            localStorage.removeItem('jam_guest_transactions');
            showToast(`ซิงค์ข้อมูล ${parsed.length} รายการเข้า Firebase เรียบร้อยแล้ว`, 'success');
          }
        } catch (e) {
          console.error('Failed to migrate guest data', e);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Add or Edit Transaction
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    if (editingTransaction) {
      // Update
      if (user) {
        const txPath = `users/${user.uid}/transactions/${editingTransaction.id}`;
        try {
          await updateDoc(doc(db, 'users', user.uid, 'transactions', editingTransaction.id), {
            type: data.type,
            amount: data.amount,
            category: data.category,
            note: data.note || '',
            date: data.date,
            month: data.month,
            paymentMethod: data.paymentMethod || 'bank_transfer',
            updatedAt: serverTimestamp(),
          });
          showToast('แก้ไขรายการสำเร็จและบันทึกไปยัง Firebase แล้ว');
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, txPath);
        }
      } else {
        const updated = transactions.map((t) =>
          t.id === editingTransaction.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        );
        saveGuestTransactions(updated);
        showToast('แก้ไขรายการสำเร็จ');
      }
      setEditingTransaction(null);
    } else {
      // Create
      if (user) {
        const txPath = `users/${user.uid}/transactions`;
        try {
          const newDocRef = doc(collection(db, 'users', user.uid, 'transactions'));
          await setDoc(newDocRef, {
            userId: user.uid,
            type: data.type,
            amount: data.amount,
            category: data.category,
            note: data.note || '',
            date: data.date,
            month: data.month,
            paymentMethod: data.paymentMethod || 'bank_transfer',
            createdAt: serverTimestamp(),
          });
          showToast('บันทึกรายการลง Firebase สำเร็จ!');
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, txPath);
        }
      } else {
        const newTx: Transaction = {
          ...data,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: 'guest',
          createdAt: new Date().toISOString(),
        };
        saveGuestTransactions([newTx, ...transactions]);
        showToast('บันทึกรายการสำเร็จ (โหมดทดลอง)');
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      const txPath = `users/${user.uid}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
        showToast('ลบรายการสำเร็จ');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, txPath);
      }
    } else {
      const remaining = transactions.filter((t) => t.id !== id);
      saveGuestTransactions(remaining);
      showToast('ลบรายการสำเร็จ');
    }
  };

  // Save Budget
  const handleSaveBudget = async (month: string, amount: number) => {
    if (user) {
      const budgetPath = `users/${user.uid}/budgets/${month}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'budgets', month), {
          userId: user.uid,
          month,
          monthlyLimit: amount,
          updatedAt: serverTimestamp(),
        });
        showToast(`บันทึกงบประมาณประจำเดือน ${formatThaiMonth(month)} เรียบร้อย`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, budgetPath);
      }
    } else {
      const updated = { ...budgets, [month]: amount };
      setBudgets(updated);
      localStorage.setItem('jam_guest_budgets', JSON.stringify(updated));
      showToast(`บันทึกงบประมาณเรียบร้อย (โหมดทดลอง)`);
    }
  };

  // Seed sample transactions into user account
  const handleSeedSampleData = async () => {
    if (user) {
      try {
        setIsSyncing(true);
        const batch = writeBatch(db);
        SAMPLE_TRANSACTIONS.forEach((item, idx) => {
          const docRef = doc(collection(db, 'users', user.uid, 'transactions'));
          batch.set(docRef, {
            userId: user.uid,
            type: item.type,
            amount: item.amount,
            category: item.category,
            note: item.note,
            date: `${selectedMonth}-${String(item.dayOffset).padStart(2, '0')}`,
            month: selectedMonth,
            paymentMethod: item.paymentMethod,
            createdAt: serverTimestamp(),
          });
        });
        await batch.commit();
        showToast(`โหลดข้อมูลจำลองเข้า Firebase สำเร็จ (${SAMPLE_TRANSACTIONS.length} รายการ)`, 'success');
      } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง', 'error');
      } finally {
        setIsSyncing(false);
      }
    } else {
      seedSampleDataLocally();
      showToast('โหลดข้อมูลตัวอย่างสำหรับโหมดทดลองสำเร็จ');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const monthlyList = transactions.filter((t) => t.month === selectedMonth);
    if (monthlyList.length === 0) {
      showToast('ไม่มีข้อมูลสำหรับส่งออกในเดือนนี้', 'info');
      return;
    }

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = monthlyList.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod || ''}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    // BOM for UTF-8 in Thai Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `67021Jam_Transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans pb-24 sm:pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all animate-in slide-in-from-bottom duration-300 ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : notification.type === 'info'
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Header
        user={user}
        selectedMonth={selectedMonth}
        onMonthChange={(m) => {
          setSelectedMonth(m);
          setSelectedCategoryFilter(null);
        }}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Firebase Guest Banner if not signed in */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20">
                <Cloud className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg">เชื่อมต่อกับ Firebase โปรเจกต์ 67021 Jam</h3>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2 py-0.5 rounded-full uppercase">
                    Guest Mode
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl">
                  ขณะนี้คุณอยู่ในโหมดทดลองใช้งาน ข้อมูลจะถูกเก็บในเครื่องนี้ เข้าสู่ระบบด้วย Google เพื่อซิงค์ข้อมูลไปยังฐานข้อมูล Firebase Cloud ปลอดภัยและเข้าถึงได้จากทุกอุปกรณ์
                </p>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-white text-indigo-900 font-bold text-sm rounded-2xl hover:bg-indigo-50 shadow-md transition flex items-center gap-2 flex-shrink-0"
            >
              <LogIn className="w-4 h-4 text-indigo-600" />
              {isSyncing ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}
            </button>
          </div>
        )}

        {/* Monthly Budget Progress Banner */}
        <BudgetBanner
          monthlyLimit={currentMonthlyBudget}
          totalExpense={monthlyStats.totalExpense}
          selectedMonth={selectedMonth}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Navigation Tabs and Tool Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              ภาพรวมและกราฟวิเคราะห์
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              รายการทั้งหมด ({transactions.filter((t) => t.month === selectedMonth).length})
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Seed Sample Data Button */}
            <button
              onClick={handleSeedSampleData}
              title="เติมข้อมูลตัวอย่างเพื่อทดสอบกราฟ"
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">เพิ่มข้อมูลจำลอง</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>

            {/* Budget Setting Button */}
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>งบประมาณ</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Visual Analytics Charts */}
            <AnalyticsCharts
              stats={monthlyStats}
              onSelectCategory={(cat) => {
                setSelectedCategoryFilter(cat);
                setActiveTab('transactions');
                showToast(`กรองรายการหมวดหมู่: ${cat}`, 'info');
              }}
            />

            {/* Recent Transactions in Selected Month */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-slate-800 text-base">รายการล่าสุดในเดือนนี้</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  ดูทั้งหมด →
                </button>
              </div>

              <TransactionList
                transactions={transactions.filter((t) => t.month === selectedMonth).slice(0, 5)}
                onEdit={(tx) => {
                  setEditingTransaction(tx);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onAddNew={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                onSeedSampleData={handleSeedSampleData}
                selectedCategoryFilter={selectedCategoryFilter}
                onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
              />
            </div>
          </div>
        ) : (
          <div>
            <TransactionList
              transactions={transactions.filter((t) => t.month === selectedMonth)}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              onSeedSampleData={handleSeedSampleData}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-6 right-6 sm:hidden z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition active:scale-95"
        title="เพิ่มรายการใหม่"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Monthly Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        selectedMonth={selectedMonth}
        currentBudget={currentMonthlyBudget}
        onSaveBudget={handleSaveBudget}
      />
    </div>
  );
}
