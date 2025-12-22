
import React, { useState, useEffect, useMemo } from 'react';
import { LucideChevronDown, LucideChevronUp, LucideLock, LucidePlus, LucideTrash2, LucideCheckCircle2, LucideHistory, LucideLogOut } from 'lucide-react';
import { Income, Expense, Distribution, AppData } from './types';
import { APP_CONFIG, INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('jumat_berkah_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Persist data
  useEffect(() => {
    localStorage.setItem('jumat_berkah_data', JSON.stringify(data));
  }, [data]);

  // Handle Secret Access Code
  useEffect(() => {
    if (accessCode === APP_CONFIG.SECRET_CODE) {
      setShowLoginModal(true);
      setAccessCode('');
    }
  }, [accessCode]);

  const latestDistribution = useMemo(() => {
    if (data.distributions.length === 0) return null;
    return [...data.distributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [data.distributions]);

  const totalIncome = useMemo(() => data.incomes.reduce((acc, curr) => acc + curr.amount, 0), [data.incomes]);
  const totalExpense = useMemo(() => data.expenses.reduce((acc, curr) => acc + (curr.unitPrice * curr.qty), 0), [data.expenses]);
  const balance = totalIncome - totalExpense;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === APP_CONFIG.ADMIN_USERNAME && password === APP_CONFIG.ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Username atau Password salah');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Admin Actions
  const addIncome = (income: Omit<Income, 'id'>) => {
    setData(prev => ({
      ...prev,
      incomes: [...prev.incomes, { ...income, id: crypto.randomUUID() }]
    }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: crypto.randomUUID() }]
    }));
  };

  const addDistribution = (dist: Omit<Distribution, 'id'>) => {
    setData(prev => ({
      ...prev,
      distributions: [...prev.distributions, { ...dist, id: crypto.randomUUID() }]
    }));
  };

  const deleteItem = (type: keyof AppData, id: string) => {
    setData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  if (isAdmin) {
    return (
      <AdminDashboard 
        data={data} 
        onAddIncome={addIncome}
        onAddExpense={addExpense}
        onAddDistribution={addDistribution}
        onDelete={deleteItem}
        onLogout={() => setIsAdmin(false)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <header className="bg-emerald-600 text-white pt-16 pb-12 px-6 shadow-lg rounded-b-[3rem]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <LucideCheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {latestDistribution ? (
              `Kami Telah Menyalurkan ${latestDistribution.count} ${latestDistribution.itemType} Jum'at ini.`
            ) : (
              "Kegiatan Jum'at Berkah Sedang Berlangsung"
            )}
          </h1>
          <p className="text-xl text-emerald-100 font-medium">
            {latestDistribution ? formatDate(latestDistribution.date) : "Mari Berbagi Kebahagiaan"}
          </p>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-10 inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-full font-bold shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            {isExpanded ? 'Tutup Rincian' : 'Lihat Rincian'}
            {isExpanded ? <LucideChevronUp className="w-5 h-5" /> : <LucideChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-[-2rem]">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-emerald-500">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-red-500">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-blue-500">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Dana Tersisa</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Detailed Section */}
        {isExpanded && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Incomes */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800 border-b pb-4">
                <LucideHistory className="w-5 h-5" /> Rincian Pemasukan
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm">
                      <th className="pb-4 font-semibold uppercase">Pemberi / Nama</th>
                      <th className="pb-4 font-semibold uppercase">Tanggal</th>
                      <th className="pb-4 font-semibold uppercase text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.incomes.map(income => (
                      <tr key={income.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 font-medium text-slate-700">{income.donorName}</td>
                        <td className="py-4 text-slate-500">{formatDate(income.date)}</td>
                        <td className="py-4 text-right font-bold text-emerald-600">{formatCurrency(income.amount)}</td>
                      </tr>
                    ))}
                    {data.incomes.length === 0 && (
                      <tr><td colSpan={3} className="py-8 text-center text-slate-400 italic">Belum ada data pemasukan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Expenses */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-800 border-b pb-4">
                <LucideHistory className="w-5 h-5" /> Rincian Pengeluaran
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm">
                      <th className="pb-4 font-semibold uppercase">Barang / Kegiatan</th>
                      <th className="pb-4 font-semibold uppercase text-center">Harga Satuan</th>
                      <th className="pb-4 font-semibold uppercase text-center">Qty</th>
                      <th className="pb-4 font-semibold uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.expenses.map(expense => (
                      <tr key={expense.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="font-medium text-slate-700">{expense.itemName}</div>
                          <div className="text-xs text-slate-400">{formatDate(expense.date)}</div>
                        </td>
                        <td className="py-4 text-center text-slate-600">{formatCurrency(expense.unitPrice)}</td>
                        <td className="py-4 text-center font-semibold text-slate-800">x{expense.qty}</td>
                        <td className="py-4 text-right font-bold text-red-600">{formatCurrency(expense.unitPrice * expense.qty)}</td>
                      </tr>
                    ))}
                    {data.expenses.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-slate-400 italic">Belum ada data pengeluaran</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Hidden Access Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-center pointer-events-none">
        <input 
          type="password" 
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="..."
          className="w-12 h-8 text-center bg-transparent border-none focus:outline-none text-[10px] text-slate-200 pointer-events-auto"
        />
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                <LucideLock className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Panel Admin</h2>
            <p className="text-slate-500 text-center mb-6">Masukkan kredensial anda untuk melanjutkan</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  autoFocus
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC<{
  data: AppData;
  onAddIncome: (i: Omit<Income, 'id'>) => void;
  onAddExpense: (e: Omit<Expense, 'id'>) => void;
  onAddDistribution: (d: Omit<Distribution, 'id'>) => void;
  onDelete: (type: keyof AppData, id: string) => void;
  onLogout: () => void;
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
}> = ({ data, onAddIncome, onAddExpense, onAddDistribution, onDelete, onLogout, formatCurrency, formatDate }) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'dist'>('income');

  // Form States
  const [incomeForm, setIncomeForm] = useState({ donorName: '', amount: 0, date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ itemName: '', unitPrice: 0, qty: 1, date: new Date().toISOString().split('T')[0] });
  const [distForm, setDistForm] = useState({ count: 10, itemType: 'Paket Nasi', date: new Date().toISOString().split('T')[0] });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <LucideLock className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800">Admin Panel</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'income', label: 'Pemasukan', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'expense', label: 'Pengeluaran', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'dist', label: 'Penyaluran', icon: <LucideCheckCircle2 className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-10 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LucideLogOut className="w-5 h-5" />
          Keluar Admin
        </button>
      </aside>

      {/* Admin Main Area */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Kelola Data</h1>
            <p className="text-slate-500 mt-1">Sistem Manajemen Transparansi Jum'at Berkah</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Form Side */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <LucidePlus className="w-5 h-5 text-emerald-600" /> Tambah {activeTab === 'income' ? 'Pemasukan' : activeTab === 'expense' ? 'Pengeluaran' : 'Data Penyaluran'}
            </h2>

            {activeTab === 'income' && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddIncome(incomeForm); setIncomeForm({ ...incomeForm, donorName: '', amount: 0 }); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama Pemberi</label>
                  <input type="text" value={incomeForm.donorName} onChange={(e) => setIncomeForm({ ...incomeForm, donorName: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nominal (IDR)</label>
                  <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal</label>
                  <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">Simpan Data</button>
              </form>
            )}

            {activeTab === 'expense' && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddExpense(expenseForm); setExpenseForm({ ...expenseForm, itemName: '', unitPrice: 0, qty: 1 }); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nama Barang/Kegiatan</label>
                  <input type="text" value={expenseForm.itemName} onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Harga Satuan</label>
                    <input type="number" value={expenseForm.unitPrice} onChange={(e) => setExpenseForm({ ...expenseForm, unitPrice: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Qty</label>
                    <input type="number" value={expenseForm.qty} onChange={(e) => setExpenseForm({ ...expenseForm, qty: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal</label>
                  <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all">Simpan Data</button>
              </form>
            )}

            {activeTab === 'dist' && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddDistribution(distForm); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Jumlah Paket</label>
                  <input type="number" value={distForm.count} onChange={(e) => setDistForm({ ...distForm, count: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Paket (e.g. Paket Nasi / Sembako)</label>
                  <input type="text" value={distForm.itemType} onChange={(e) => setDistForm({ ...distForm, itemType: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Kegiatan</label>
                  <input type="date" value={distForm.date} onChange={(e) => setDistForm({ ...distForm, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Update Headline Utama</button>
              </form>
            )}
          </div>

          {/* List Side */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LucideHistory className="w-5 h-5 text-slate-400" /> Riwayat Data
            </h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-h-[600px] overflow-y-auto">
              {activeTab === 'income' && (
                <ul className="divide-y divide-slate-100">
                  {data.incomes.map(item => (
                    <li key={item.id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-800">{item.donorName}</p>
                        <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-emerald-600">{formatCurrency(item.amount)}</span>
                        <button onClick={() => onDelete('incomes', item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LucideTrash2 className="w-5 h-5" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'expense' && (
                <ul className="divide-y divide-slate-100">
                  {data.expenses.map(item => (
                    <li key={item.id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-800">{item.itemName}</p>
                        <p className="text-xs text-slate-400">{item.qty} pcs @ {formatCurrency(item.unitPrice)} • {formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-600">{formatCurrency(item.unitPrice * item.qty)}</span>
                        <button onClick={() => onDelete('expenses', item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LucideTrash2 className="w-5 h-5" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'dist' && (
                <ul className="divide-y divide-slate-100">
                  {data.distributions.map(item => (
                    <li key={item.id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-800">{item.count} {item.itemType}</p>
                        <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                      </div>
                      <button onClick={() => onDelete('distributions', item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LucideTrash2 className="w-5 h-5" /></button>
                    </li>
                  ))}
                </ul>
              )}
              {(activeTab === 'income' ? data.incomes : activeTab === 'expense' ? data.expenses : data.distributions).length === 0 && (
                <p className="text-center py-10 text-slate-400 italic">Belum ada riwayat data.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
