
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LucideChevronDown, 
  LucideChevronUp, 
  LucideLock, 
  LucidePlus, 
  LucideTrash2, 
  LucideCheckCircle2, 
  LucideHistory, 
  LucideLogOut, 
  LucidePalette, 
  LucideImage, 
  LucideSettings, 
  LucideSave,
  LucideQrCode,
  LucideHeartHandshake,
  LucideX,
  LucideUpload,
  LucideCheck,
  LucideExternalLink
} from 'lucide-react';
import { Income, Expense, Distribution, AppData, LayoutConfig } from './types';
import { APP_CONFIG, INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('jumat_berkah_data_v2');
    if (!saved) return INITIAL_DATA;
    const parsed = JSON.parse(saved);
    if (!parsed.layout) parsed.layout = INITIAL_DATA.layout;
    if (parsed.layout.showDonationSection === undefined) {
      parsed.layout = { ...parsed.layout, ...INITIAL_DATA.layout };
    }
    return parsed;
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  // Confirmation Form State
  const [confName, setConfName] = useState('');
  const [confAmount, setConfAmount] = useState('');
  const [confImage, setConfImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    localStorage.setItem('jumat_berkah_data_v2', JSON.stringify(data));
  }, [data]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newIncome: Omit<Income, 'id'> = {
      donorName: confName.trim() || 'Hamba Allah',
      amount: parseInt(confAmount) || 0,
      date: new Date().toISOString().split('T')[0],
      proofImage: confImage || undefined
    };

    setTimeout(() => {
      addIncome(newIncome);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form
      setConfName('');
      setConfAmount('');
      setConfImage(null);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowQrisModal(false);
      }, 2000);
    }, 1000);
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

  const addIncome = (income: Omit<Income, 'id'>) => {
    setData(prev => ({ ...prev, incomes: [...prev.incomes, { ...income, id: crypto.randomUUID() }] }));
  };
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setData(prev => ({ ...prev, expenses: [...prev.expenses, { ...expense, id: crypto.randomUUID() }] }));
  };
  const addDistribution = (dist: Omit<Distribution, 'id'>) => {
    setData(prev => ({ ...prev, distributions: [...prev.distributions, { ...dist, id: crypto.randomUUID() }] }));
  };
  const updateLayout = (newLayout: LayoutConfig) => {
    setData(prev => ({ ...prev, layout: newLayout }));
  };
  const deleteItem = (type: keyof Omit<AppData, 'layout'>, id: string) => {
    setData(prev => ({ ...prev, [type]: (prev[type] as any[]).filter((item: any) => item.id !== id) }));
  };

  const { layout } = data;

  const getPrimaryBg = () => {
    if (layout.headerStyle === 'gradient') return `bg-gradient-to-br from-${layout.primaryColor}-600 to-${layout.primaryColor}-800`;
    return `bg-${layout.primaryColor}-600`;
  };

  if (isAdmin) {
    return (
      <AdminDashboard 
        data={data} 
        onAddIncome={addIncome}
        onAddExpense={addExpense}
        onAddDistribution={addDistribution}
        onUpdateLayout={updateLayout}
        onDelete={deleteItem}
        onLogout={() => setIsAdmin(false)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    );
  }

  return (
    <div className={`min-h-screen ${layout.themeMode === 'soft' ? 'bg-slate-100' : 'bg-slate-50'} text-slate-900 pb-20 transition-all duration-300`} style={{ fontFamily: layout.fontFamily }}>
      {/* Hero Section */}
      <header className={`${getPrimaryBg()} text-white pt-16 pb-24 px-6 shadow-lg ${layout.borderRadius} relative overflow-hidden transition-all duration-700`}>
        {layout.heroImageUrl && (
          <img src={layout.heroImageUrl} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" alt="Banner" />
        )}
        <div className={`max-w-4xl mx-auto text-center relative z-10 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-top-10 duration-1000' : ''}`}>
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <LucideCheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm px-4">
            {latestDistribution ? (
              `Kami Telah Menyalurkan ${latestDistribution.count} ${latestDistribution.itemType} Jum'at ini.`
            ) : (
              "Kegiatan Jum'at Berkah Sedang Berlangsung"
            )}
          </h1>
          <p className={`text-xl font-medium text-white/90`}>
            {latestDistribution ? formatDate(latestDistribution.date) : "Mari Berbagi Kebahagiaan"}
          </p>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-8 inline-flex items-center gap-2 bg-white text-${layout.primaryColor}-700 px-8 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95`}
          >
            {isExpanded ? 'Tutup Rincian' : 'Lihat Rincian Transparansi'}
            {isExpanded ? <LucideChevronUp className="w-5 h-5" /> : <LucideChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-[-4rem] relative z-20">
        {/* Quick Summary Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200' : ''}`}>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-b-4 border-emerald-500">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-b-4 border-red-500">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-b-4 border-blue-500">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Dana Tersisa</p>
            <p className={`text-2xl font-bold text-${layout.primaryColor === 'blue' ? 'blue-600' : 'indigo-600'}`}>{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Donation Section */}
        {layout.showDonationSection && (
          <div className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-8 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300' : ''}`}>
            <div className={`p-6 bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 rounded-2xl`}>
              <LucideHeartHandshake className="w-16 h-16" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{layout.donationTitle}</h2>
              <p className="text-slate-600 mb-6 leading-relaxed max-w-xl">{layout.donationDescription}</p>
              <button 
                onClick={() => setShowQrisModal(true)}
                className={`inline-flex items-center gap-3 px-8 py-4 bg-${layout.primaryColor}-600 text-white rounded-2xl font-bold shadow-lg shadow-${layout.primaryColor}-200 transition-all hover:scale-[1.02] active:scale-95`}
              >
                <LucideQrCode className="w-5 h-5" /> Scan QRIS Donasi
              </button>
            </div>
          </div>
        )}

        {/* Detailed Section */}
        {isExpanded && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Incomes */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4 text-${layout.primaryColor}-800`}>
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

      {/* QRIS & Confirmation Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative my-8">
            <button 
              onClick={() => setShowQrisModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
            >
              <LucideX className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex p-4 bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 rounded-full mb-4`}>
                  <LucideQrCode className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Donasi QRIS</h3>
                <p className="text-sm text-slate-500">Scan kode QR di bawah untuk mentransfer</p>
                
                <div className="mt-6 bg-white p-4 rounded-3xl border-4 border-slate-50 shadow-inner flex justify-center inline-block mx-auto max-w-[260px]">
                  <img src={layout.qrisImageUrl} alt="QRIS Donasi" className="w-full h-auto rounded-xl" />
                </div>
              </div>

              {/* Manual Confirmation Form */}
              <div className="border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 mb-6 text-slate-800">
                  <div className={`w-8 h-8 rounded-full bg-${layout.primaryColor}-100 flex items-center justify-center text-${layout.primaryColor}-600 font-bold text-sm`}>2</div>
                  <h4 className="font-bold text-lg">Konfirmasi Pembayaran</h4>
                </div>

                {submitSuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LucideCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h5 className="text-xl font-bold mb-2">Berhasil Dikirim!</h5>
                    <p className="text-sm leading-relaxed">Terima kasih banyak atas kedermawanan Anda. Data akan segera diperbarui dalam transparansi kami.</p>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDonation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Donatur</label>
                      <input 
                        type="text" 
                        placeholder="Hamba Allah"
                        value={confName}
                        onChange={(e) => setConfName(e.target.value)}
                        className={`w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-${layout.primaryColor}-500 outline-none transition-all`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nominal (IDR)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="Contoh: 50000"
                        value={confAmount}
                        onChange={(e) => setConfAmount(e.target.value)}
                        className={`w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-${layout.primaryColor}-500 outline-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bukti Transfer (Screenshot)</label>
                      <div className="relative group">
                        <input 
                          required
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full px-5 py-6 rounded-2xl border-2 border-dashed ${confImage ? `border-${layout.primaryColor}-300 bg-${layout.primaryColor}-50` : 'border-slate-200 bg-slate-50'} flex flex-col items-center justify-center gap-2 group-hover:border-${layout.primaryColor}-400 transition-colors`}>
                          {confImage ? (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <LucideCheck className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-bold text-emerald-700">Gambar Terpilih</span>
                            </>
                          ) : (
                            <>
                              <LucideUpload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              <span className="text-xs font-medium text-slate-500">Klik atau seret gambar ke sini</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className={`w-full py-4 mt-4 bg-${layout.primaryColor}-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-${layout.primaryColor}-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Kirim Konfirmasi Donasi</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className={`p-4 bg-${layout.primaryColor}-100 text-${layout.primaryColor}-600 rounded-full`}>
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
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-${layout.primaryColor}-500 outline-none transition-all`}
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-${layout.primaryColor}-500 outline-none transition-all`}
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
                  className={`flex-1 py-3 rounded-xl bg-${layout.primaryColor}-600 text-white font-semibold hover:bg-${layout.primaryColor}-700 shadow-lg shadow-${layout.primaryColor}-200 transition-colors`}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC<{
  data: AppData;
  onAddIncome: (i: Omit<Income, 'id'>) => void;
  onAddExpense: (e: Omit<Expense, 'id'>) => void;
  onAddDistribution: (d: Omit<Distribution, 'id'>) => void;
  onUpdateLayout: (l: LayoutConfig) => void;
  onDelete: (type: keyof Omit<AppData, 'layout'>, id: string) => void;
  onLogout: () => void;
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
}> = ({ data, onAddIncome, onAddExpense, onAddDistribution, onUpdateLayout, onDelete, onLogout, formatCurrency, formatDate }) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'dist' | 'layout'>('income');
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const [incomeForm, setIncomeForm] = useState({ donorName: '', amount: 0, date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ itemName: '', unitPrice: 0, qty: 1, date: new Date().toISOString().split('T')[0] });
  const [distForm, setDistForm] = useState({ count: 10, itemType: 'Paket Nasi', date: new Date().toISOString().split('T')[0] });
  const [layoutForm, setLayoutForm] = useState<LayoutConfig>(data.layout);

  const { layout } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row" style={{ fontFamily: 'Plus Jakarta Sans' }}>
      {/* Admin Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className={`p-2 bg-${layout.primaryColor}-600 text-white rounded-lg transition-colors`}>
            <LucideLock className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800">Admin Panel</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'income', label: 'Pemasukan', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'expense', label: 'Pengeluaran', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'dist', label: 'Penyaluran', icon: <LucideCheckCircle2 className="w-5 h-5" /> },
            { id: 'layout', label: 'Edit Layout', icon: <LucidePalette className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id ? `bg-${layout.primaryColor}-50 text-${layout.primaryColor}-700` : 'text-slate-500 hover:bg-slate-50'
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
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'layout' ? 'Kustomisasi Tampilan' : 'Kelola Data'}
            </h1>
            <p className="text-slate-500 mt-1">Sistem Manajemen Transparansi Jum'at Berkah</p>
          </div>
        </header>

        {activeTab === 'layout' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
            {/* Layout Editor */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><LucideSettings className="w-5 h-5" /> Pengaturan Dasar</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Warna Utama</label>
                      <div className="flex flex-wrap gap-2">
                        {['emerald', 'blue', 'indigo', 'rose', 'amber', 'slate'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setLayoutForm({...layoutForm, primaryColor: color as any})}
                            className={`w-8 h-8 rounded-full bg-${color}-600 ring-offset-2 transition-all ${layoutForm.primaryColor === color ? 'ring-2 ring-slate-800' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Tema Warna</label>
                      <select 
                        value={layoutForm.themeMode}
                        onChange={(e) => setLayoutForm({...layoutForm, themeMode: e.target.value as any})}
                        className="w-full px-4 py-2 border rounded-xl"
                      >
                        <option value="light">Terang (Default)</option>
                        <option value="soft">Soft Slate</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><LucideHeartHandshake className="w-5 h-5" /> Pengaturan Donasi</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input 
                        type="checkbox" 
                        checked={layoutForm.showDonationSection}
                        onChange={(e) => setLayoutForm({...layoutForm, showDonationSection: e.target.checked})}
                        className={`w-5 h-5 rounded accent-${layout.primaryColor}-600`}
                      />
                      <span className="text-sm font-bold text-slate-700">Tampilkan Section Donasi</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Judul Donasi</label>
                      <input 
                        type="text" 
                        value={layoutForm.donationTitle}
                        onChange={(e) => setLayoutForm({...layoutForm, donationTitle: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Deskripsi Ajakan</label>
                      <textarea 
                        rows={3}
                        value={layoutForm.donationDescription}
                        onChange={(e) => setLayoutForm({...layoutForm, donationDescription: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">URL Gambar QRIS</label>
                      <input 
                        type="url" 
                        placeholder="Link gambar QRIS Anda"
                        value={layoutForm.qrisImageUrl}
                        onChange={(e) => setLayoutForm({...layoutForm, qrisImageUrl: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                   <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><LucideImage className="w-5 h-5" /> Header & Banner</h3>
                   <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">URL Gambar Banner Hero</label>
                      <input 
                        type="url" 
                        placeholder="https://images.unsplash.com/..."
                        value={layoutForm.heroImageUrl}
                        onChange={(e) => setLayoutForm({...layoutForm, heroImageUrl: e.target.value})}
                        className="w-full px-4 py-2 border rounded-xl text-sm"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Gaya Header</label>
                        <div className="flex gap-2">
                          <button onClick={() => setLayoutForm({...layoutForm, headerStyle: 'solid'})} className={`flex-1 py-2 px-3 border rounded-xl text-xs ${layoutForm.headerStyle === 'solid' ? 'bg-slate-800 text-white' : ''}`}>Solid</button>
                          <button onClick={() => setLayoutForm({...layoutForm, headerStyle: 'gradient'})} className={`flex-1 py-2 px-3 border rounded-xl text-xs ${layoutForm.headerStyle === 'gradient' ? 'bg-slate-800 text-white' : ''}`}>Gradient</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Kelengkungan Card</label>
                        <select 
                          value={layoutForm.borderRadius}
                          onChange={(e) => setLayoutForm({...layoutForm, borderRadius: e.target.value as any})}
                          className="w-full px-4 py-2 border rounded-xl text-sm"
                        >
                          <option value="rounded-none">Siku (None)</option>
                          <option value="rounded-xl">Kecil (XL)</option>
                          <option value="rounded-3xl">Besar (3XL)</option>
                          <option value="rounded-[3rem]">Sangat Besar (Full)</option>
                        </select>
                      </div>
                   </div>
                </section>

                <div className="pt-4 flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={layoutForm.animationEnabled}
                      onChange={(e) => setLayoutForm({...layoutForm, animationEnabled: e.target.checked})}
                      className={`w-5 h-5 rounded accent-${layout.primaryColor}-600`}
                    />
                    <span className="text-sm font-medium text-slate-700">Aktifkan Animasi Masuk</span>
                  </label>
                </div>

                <button 
                  onClick={() => onUpdateLayout(layoutForm)}
                  className={`w-full py-4 bg-${layout.primaryColor}-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-${layout.primaryColor}-200`}
                >
                  <LucideSave className="w-5 h-5" /> Simpan Perubahan Tampilan
                </button>
              </div>
            </div>

            {/* Admin Info Section */}
            <div className="hidden lg:block space-y-6">
               <h3 className="text-lg font-bold flex items-center gap-2"><LucidePalette className="w-5 h-5 text-slate-400" /> Tips Kelola</h3>
               <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <ul className="space-y-4 text-sm text-slate-600">
                    <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> Tambahkan bukti transfer di setiap rincian pemasukan manual.</li>
                    <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> Gunakan gambar banner dengan resolusi tinggi.</li>
                    <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> Ubah headline penyaluran setiap kali kegiatan selesai.</li>
                  </ul>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Form Side */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in slide-in-from-left-4 duration-500">
              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2`}>
                <LucidePlus className={`w-5 h-5 text-${layout.primaryColor}-600`} /> Tambah {activeTab === 'income' ? 'Pemasukan' : activeTab === 'expense' ? 'Pengeluaran' : 'Data Penyaluran'}
              </h2>

              {activeTab === 'income' && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddIncome(incomeForm); setIncomeForm({ ...incomeForm, donorName: '', amount: 0 }); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nama Pemberi</label>
                    <input type="text" value={incomeForm.donorName} onChange={(e) => setIncomeForm({ ...incomeForm, donorName: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nominal (IDR)</label>
                    <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseInt(e.target.value) })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal</label>
                    <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <button type="submit" className={`w-full py-3 bg-${layout.primaryColor}-600 text-white rounded-xl font-bold hover:brightness-110 shadow-lg transition-all`}>Simpan Data</button>
                </form>
              )}

              {activeTab === 'expense' && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddExpense(expenseForm); setExpenseForm({ ...expenseForm, itemName: '', unitPrice: 0, qty: 1 }); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nama Barang/Kegiatan</label>
                    <input type="text" value={expenseForm.itemName} onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Harga Satuan</label>
                      <input type="number" value={expenseForm.unitPrice} onChange={(e) => setExpenseForm({ ...expenseForm, unitPrice: parseInt(e.target.value) })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Qty</label>
                      <input type="number" value={expenseForm.qty} onChange={(e) => setExpenseForm({ ...expenseForm, qty: parseInt(e.target.value) })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal</label>
                    <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all">Simpan Data</button>
                </form>
              )}

              {activeTab === 'dist' && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAddDistribution(distForm); }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Jumlah Paket</label>
                    <input type="number" value={distForm.count} onChange={(e) => setDistForm({ ...distForm, count: parseInt(e.target.value) })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Paket (e.g. Paket Nasi / Sembako)</label>
                    <input type="text" value={distForm.itemType} onChange={(e) => setDistForm({ ...distForm, itemType: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Kegiatan</label>
                    <input type="date" value={distForm.date} onChange={(e) => setDistForm({ ...distForm, date: e.target.value })} className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-${layout.primaryColor}-500`} required />
                  </div>
                  <button type="submit" className={`w-full py-3 bg-${layout.primaryColor}-600 text-white rounded-xl font-bold hover:brightness-110 shadow-lg transition-all`}>Update Headline Utama</button>
                </form>
              )}
            </div>

            {/* List Side */}
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LucideHistory className="w-5 h-5 text-slate-400" /> Riwayat Data
              </h2>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 max-h-[600px] overflow-y-auto">
                {activeTab === 'income' && (
                  <ul className="divide-y divide-slate-100">
                    {data.incomes.map(item => (
                      <li key={item.id} className="py-4 flex justify-between items-center group">
                        <div className="flex gap-3 items-center">
                           {item.proofImage && (
                             <button 
                               onClick={() => setViewingProof(item.proofImage!)}
                               className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border hover:border-emerald-500 transition-colors"
                             >
                               <img src={item.proofImage} alt="Bukti" className="w-full h-full object-cover" />
                             </button>
                           )}
                           <div>
                             <p className="font-bold text-slate-800 flex items-center gap-2">
                               {item.donorName}
                               {item.proofImage && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Verified</span>}
                             </p>
                             <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-${layout.primaryColor}-600`}>{formatCurrency(item.amount)}</span>
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
        )}
      </main>

      {/* Proof Viewer Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-slate-900/90 z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <button onClick={() => setViewingProof(null)} className="absolute top-8 right-8 text-white hover:text-red-500 transition-colors">
            <LucideX className="w-10 h-10" />
          </button>
          <img src={viewingProof} className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in duration-300" alt="Bukti Transfer" />
        </div>
      )}
    </div>
  );
};

export default App;
