
import React, { useState, useEffect, useMemo } from 'react';
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
  LucideCheck
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
      setConfName('');
      setConfAmount('');
      setConfImage(null);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowQrisModal(false);
      }, 2000);
    }, 1200);
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
    <div className={`min-h-screen ${layout.themeMode === 'soft' ? 'bg-slate-100' : 'bg-slate-50'} text-slate-900 pb-20 transition-colors duration-500`} style={{ fontFamily: layout.fontFamily }}>
      {/* Hero Section */}
      <header className={`${getPrimaryBg()} text-white pt-12 pb-24 px-6 shadow-xl ${layout.borderRadius} relative overflow-hidden transition-all duration-700`}>
        {layout.heroImageUrl && (
          <img src={layout.heroImageUrl} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 animate-pulse duration-[10s]" alt="Banner" />
        )}
        <div className={`max-w-4xl mx-auto text-center relative z-10 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-top-8 duration-1000' : ''}`}>
          <div className="inline-flex items-center justify-center p-2.5 bg-white/20 rounded-full mb-5 backdrop-blur-md animate-bounce-subtle">
            <LucideCheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-lg px-4">
            {latestDistribution ? (
              `Menyalurkan ${latestDistribution.count} ${latestDistribution.itemType}`
            ) : (
              "Kegiatan Jum'at Berkah"
            )}
          </h1>
          <p className={`text-lg md:text-xl font-medium text-white/90`}>
            {latestDistribution ? formatDate(latestDistribution.date) : "Mari Berbagi Kebahagiaan"}
          </p>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-8 inline-flex items-center gap-3 bg-white text-${layout.primaryColor}-700 px-8 py-3.5 rounded-full font-black shadow-2xl transition-all hover:scale-105 active:scale-95 group text-sm md:text-base`}
          >
            {isExpanded ? 'Tutup Rincian' : 'Rincian Transparansi'}
            {isExpanded ? (
              <LucideChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            ) : (
              <LucideChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-[-4rem] relative z-20 space-y-6">
        {/* Quick Summary Cards - Minimalist Mobile Layout */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both' : ''}`}>
          {/* Pemasukan */}
          <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-xl border-b-4 border-emerald-500 transform transition-transform hover:-translate-y-1 group">
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Pemasukan</p>
            <p className="text-lg md:text-2xl font-black text-slate-800">{formatCurrency(totalIncome)}</p>
          </div>
          {/* Pengeluaran */}
          <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-xl border-b-4 border-red-500 transform transition-transform hover:-translate-y-1 group">
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 group-hover:text-red-500 transition-colors">Pengeluaran</p>
            <p className="text-lg md:text-2xl font-black text-slate-800">{formatCurrency(totalExpense)}</p>
          </div>
          {/* Sisa Dana - Spans full width on mobile */}
          <div className="col-span-2 md:col-span-1 bg-white p-5 md:p-6 rounded-[2.2rem] shadow-2xl border-b-4 border-blue-500 transform transition-transform hover:-translate-y-1 group text-center md:text-left">
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Sisa Dana Tersedia</p>
            <p className={`text-xl md:text-2xl font-black text-${layout.primaryColor === 'blue' ? 'blue-600' : 'indigo-600'}`}>{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Detailed Section - Transparency */}
        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-both">
            {/* Incomes */}
            <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-50 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-${layout.primaryColor}-500/20`}></div>
              <h3 className={`text-xl font-black mb-6 flex items-center gap-2 text-${layout.primaryColor}-800 uppercase tracking-tight`}>
                <LucideHistory className="w-5 h-5" /> Riwayat Masuk
              </h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b">
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px]">Donatur</th>
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px]">Tgl</th>
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px] text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.incomes.map((income, idx) => (
                      <tr key={income.id} className="group hover:bg-slate-50/80 transition-colors animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
                        <td className="px-2 py-4 font-bold text-slate-700">{income.donorName}</td>
                        <td className="px-2 py-4 text-slate-400 text-xs">{new Date(income.date).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit'})}</td>
                        <td className="px-2 py-4 text-right font-black text-emerald-600">{formatCurrency(income.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Expenses */}
            <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500/20"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-red-800 uppercase tracking-tight">
                <LucideHistory className="w-5 h-5" /> Riwayat Keluar
              </h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b">
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px]">Barang</th>
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px] text-center">Qty</th>
                      <th className="px-2 pb-3 font-black uppercase tracking-tighter text-[10px] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.expenses.map((expense, idx) => (
                      <tr key={expense.id} className="group hover:bg-slate-50/80 transition-colors animate-in fade-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
                        <td className="px-2 py-4">
                          <div className="font-bold text-slate-700 leading-tight">{expense.itemName}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{formatDate(expense.date)}</div>
                        </td>
                        <td className="px-2 py-4 text-center font-black text-slate-800">x{expense.qty}</td>
                        <td className="px-2 py-4 text-right font-black text-red-600">{formatCurrency(expense.unitPrice * expense.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Donation Section */}
        {layout.showDonationSection && (
          <div className={`bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-50 flex flex-col md:flex-row items-center gap-8 ${layout.animationEnabled ? 'animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both' : ''}`}>
            <div className={`p-6 bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 rounded-[2rem] shadow-inner animate-pulse duration-[5s]`}>
              <LucideHeartHandshake className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">{layout.donationTitle}</h2>
              <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm md:text-base">{layout.donationDescription}</p>
              <button 
                onClick={() => setShowQrisModal(true)}
                className={`w-full md:w-auto inline-flex items-center justify-center gap-4 px-10 py-4 bg-${layout.primaryColor}-600 text-white rounded-2xl md:rounded-[1.8rem] text-lg font-black shadow-2xl shadow-${layout.primaryColor}-100 transition-all hover:scale-[1.03] active:scale-95`}
              >
                <LucideQrCode className="w-6 h-6" /> Scan QRIS Donasi
              </button>
            </div>
          </div>
        )}
      </main>

      {/* QRIS & Confirmation Modal - Dynamic & Mobile Friendly */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className={`bg-white w-full max-w-[380px] md:max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500 relative flex flex-col max-h-[92vh]`}>
            <button 
              onClick={() => setShowQrisModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all z-20 shadow-sm"
            >
              <LucideX className="w-5 h-5" />
            </button>
            
            <div className="overflow-y-auto p-6 md:p-8 pt-10 flex-grow scrollbar-hide">
              <div className="text-center mb-8">
                <div className={`inline-flex p-4 bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 rounded-2xl mb-5 shadow-inner`}>
                  <LucideQrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">QRIS Donasi</h3>
                <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">Scan via E-Wallet / Mobile Banking</p>
                
                <div className="mt-8 bg-white p-5 rounded-[2.5rem] border-4 border-slate-50 shadow-xl inline-block mx-auto transform hover:scale-105 transition-transform duration-500">
                  <img src={layout.qrisImageUrl} alt="QRIS" className="w-full h-auto rounded-xl max-w-[200px]" />
                </div>
              </div>

              {/* Confirmation Form */}
              <div className="border-t border-slate-50 pt-8 pb-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-xl bg-${layout.primaryColor}-500 text-white flex items-center justify-center font-black text-sm`}>2</div>
                  <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight">Konfirmasi Donasi</h4>
                </div>

                {submitSuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-8 rounded-[2rem] text-center animate-in zoom-in duration-500 border border-emerald-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                      <LucideCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h5 className="text-xl font-black mb-2">Terima Kasih!</h5>
                    <p className="text-sm font-bold opacity-70">Donasi Anda sangat berarti bagi kelancaran kegiatan kami.</p>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmDonation} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nama Anda</label>
                      <input 
                        type="text" 
                        placeholder="Hamba Allah"
                        value={confName}
                        onChange={(e) => setConfName(e.target.value)}
                        className={`w-full px-5 py-3.5 rounded-2xl border-2 border-slate-50 focus:border-${layout.primaryColor}-500 bg-slate-50/50 outline-none transition-all font-bold placeholder:text-slate-300 text-sm`}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nominal Donasi</label>
                      <input 
                        required
                        type="number" 
                        placeholder="Contoh: 50000"
                        value={confAmount}
                        onChange={(e) => setConfAmount(e.target.value)}
                        className={`w-full px-5 py-3.5 rounded-2xl border-2 border-slate-50 focus:border-${layout.primaryColor}-500 bg-slate-50/50 outline-none transition-all font-black placeholder:text-slate-300 text-sm`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bukti Bayar</label>
                      <div className="relative group">
                        <input 
                          required
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full p-6 rounded-[1.8rem] border-2 border-dashed transition-all duration-300 ${confImage ? `border-emerald-400 bg-emerald-50` : 'border-slate-100 bg-slate-50/50'} flex flex-col items-center justify-center gap-2`}>
                          {confImage ? (
                            <div className="flex items-center gap-2">
                              <LucideCheck className="w-5 h-5 text-emerald-600" />
                              <span className="text-xs font-black text-emerald-700">Gambar Terlampir</span>
                            </div>
                          ) : (
                            <>
                              <LucideUpload className="w-6 h-6 text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload Screenshot</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className={`w-full py-4.5 bg-${layout.primaryColor}-600 text-white rounded-2xl font-black shadow-2xl shadow-${layout.primaryColor}-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4`}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Kirim Laporan Donasi</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Portal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className={`p-4 bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 rounded-2xl shadow-inner`}>
                <LucideLock className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-slate-800 mb-1">Panel Admin</h2>
            <p className="text-slate-400 text-center mb-8 font-bold text-xs uppercase tracking-widest">Kredensial Pengurus</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                autoFocus
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-2xl border-2 border-slate-50 focus:border-${layout.primaryColor}-500 outline-none transition-all font-bold bg-slate-50 text-sm`}
                placeholder="Username"
              />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-2xl border-2 border-slate-50 focus:border-${layout.primaryColor}-500 outline-none transition-all font-bold bg-slate-50 text-sm`}
                placeholder="Password"
              />
              {loginError && (
                <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest animate-pulse">{loginError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className={`flex-1 py-3.5 rounded-2xl bg-${layout.primaryColor}-600 text-white font-black hover:scale-105 shadow-xl shadow-${layout.primaryColor}-100 transition-all text-sm`}
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Dev Entry */}
      <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
        <input 
          type="password" 
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="..."
          className="w-10 h-6 text-center bg-transparent border-none focus:outline-none text-[8px] text-slate-300 pointer-events-auto cursor-default"
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 p-8 flex flex-col animate-in slide-in-from-left-full duration-700">
        <div className="flex items-center gap-4 mb-12">
          <div className={`p-3 bg-${layout.primaryColor}-600 text-white rounded-2xl shadow-lg shadow-${layout.primaryColor}-100`}>
            <LucideLock className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl text-slate-800 tracking-tight">Admin Portal</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'income', label: 'Pemasukan', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'expense', label: 'Pengeluaran', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'dist', label: 'Penyaluran', icon: <LucideCheckCircle2 className="w-5 h-5" /> },
            { id: 'layout', label: 'Desain Layout', icon: <LucidePalette className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id 
                  ? `bg-${layout.primaryColor}-600 text-white shadow-xl shadow-${layout.primaryColor}-50 scale-[1.03]` 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="mt-12 flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LucideLogOut className="w-5 h-5" />
          Log Out
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-grow p-6 md:p-16 overflow-y-auto bg-slate-50/50">
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            {activeTab === 'layout' ? 'Sistem Desain' : 'Manajemen Log'}
          </h1>
          <div className={`h-1.5 w-20 bg-${layout.primaryColor}-500 rounded-full`}></div>
        </header>

        {activeTab === 'layout' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50 space-y-10 animate-in fade-in duration-700">
              <div className="space-y-10">
                <section className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3 border-b border-slate-50 pb-4 text-slate-800 font-black uppercase tracking-tight"><LucideSettings className="w-6 h-6 text-slate-400" /> Pengaturan Dasar</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Palet Warna</label>
                      <div className="flex flex-wrap gap-3">
                        {['emerald', 'blue', 'indigo', 'rose', 'amber', 'slate'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setLayoutForm({...layoutForm, primaryColor: color as any})}
                            className={`w-10 h-10 rounded-2xl bg-${color}-600 ring-offset-4 transition-all ${layoutForm.primaryColor === color ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : 'hover:scale-105'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3 border-b border-slate-50 pb-4 text-slate-800 font-black uppercase tracking-tight"><LucideHeartHandshake className="w-6 h-6 text-slate-400" /> Modul Donasi</h3>
                  <div className="space-y-6">
                    <label className="flex items-center gap-4 cursor-pointer bg-slate-50 p-5 rounded-3xl group">
                      <input 
                        type="checkbox" 
                        checked={layoutForm.showDonationSection}
                        onChange={(e) => setLayoutForm({...layoutForm, showDonationSection: e.target.checked})}
                        className={`w-6 h-6 rounded-lg accent-${layout.primaryColor}-600 shadow-sm`}
                      />
                      <span className="text-sm font-black text-slate-700 tracking-wide">Aktifkan Section QRIS Donasi</span>
                    </label>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">URL Gambar QRIS</label>
                      <input 
                        type="url" 
                        placeholder="Tempel link image QRIS"
                        value={layoutForm.qrisImageUrl}
                        onChange={(e) => setLayoutForm({...layoutForm, qrisImageUrl: e.target.value})}
                        className="w-full px-6 py-4 border-2 border-slate-50 rounded-2xl font-mono text-xs outline-none focus:border-slate-200 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </section>

                <button 
                  onClick={() => onUpdateLayout(layoutForm)}
                  className={`w-full py-5 bg-${layout.primaryColor}-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-${layout.primaryColor}-50`}
                >
                  <LucideSave className="w-6 h-6" /> Update Visual App
                </button>
              </div>
            </div>

            <div className="hidden lg:block space-y-8 animate-in slide-in-from-right-12 duration-1000">
               <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className={`absolute -right-12 -top-12 w-64 h-64 bg-${layout.primaryColor}-500/20 rounded-full blur-[100px] transition-all duration-1000`}></div>
                  <h3 className="text-3xl font-black mb-8 relative z-10 tracking-tight">Sistem Monitoring</h3>
                  <div className="space-y-6 relative z-10">
                    <p className="text-lg font-medium opacity-60 leading-relaxed italic">"Gunakan dashboard ini untuk menjaga amanah donatur dan memonitor setiap alokasi dana secara presisi."</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-20">
            {/* Input Form */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50 animate-in slide-in-from-left-8 duration-700 h-fit">
              <h2 className={`text-2xl font-black mb-10 flex items-center gap-4 text-slate-800`}>
                <div className={`w-10 h-10 rounded-2xl bg-${layout.primaryColor}-50 text-${layout.primaryColor}-600 flex items-center justify-center shadow-inner`}>
                  <LucidePlus className="w-6 h-6" />
                </div>
                Input Data {activeTab === 'income' ? 'Donasi' : activeTab === 'expense' ? 'Pengeluaran' : 'Laporan'}
              </h2>

              {activeTab === 'income' && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAddIncome(incomeForm); setIncomeForm({ ...incomeForm, donorName: '', amount: 0 }); }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nama Donatur</label>
                    <input type="text" value={incomeForm.donorName} onChange={(e) => setIncomeForm({ ...incomeForm, donorName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-emerald-400 transition-all outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nominal (IDR)</label>
                    <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black focus:border-emerald-400 transition-all outline-none" required />
                  </div>
                  <button type="submit" className={`w-full py-5 bg-${layout.primaryColor}-600 text-white rounded-3xl font-black shadow-2xl shadow-${layout.primaryColor}-50 transition-all active:scale-95`}>Simpan Transaksi</button>
                </form>
              )}

              {activeTab === 'expense' && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAddExpense(expenseForm); setExpenseForm({ ...expenseForm, itemName: '', unitPrice: 0, qty: 1 }); }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Deskripsi Barang</label>
                    <input type="text" value={expenseForm.itemName} onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-red-400 transition-all outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Hrg Satuan</label>
                      <input type="number" value={expenseForm.unitPrice} onChange={(e) => setExpenseForm({ ...expenseForm, unitPrice: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black focus:border-red-400 transition-all outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Qty</label>
                      <input type="number" value={expenseForm.qty} onChange={(e) => setExpenseForm({ ...expenseForm, qty: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black focus:border-red-400 transition-all outline-none" required />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-3xl font-black shadow-2xl shadow-red-50 transition-all active:scale-95">Simpan Alokasi</button>
                </form>
              )}

              {activeTab === 'dist' && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAddDistribution(distForm); }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Total Paket</label>
                    <input type="number" value={distForm.count} onChange={(e) => setDistForm({ ...distForm, count: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black focus:border-blue-400 transition-all outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Item Disalurkan</label>
                    <input type="text" value={distForm.itemType} onChange={(e) => setDistForm({ ...distForm, itemType: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-blue-400 transition-all outline-none" required />
                  </div>
                  <button type="submit" className={`w-full py-5 bg-${layout.primaryColor}-600 text-white rounded-3xl font-black shadow-2xl shadow-blue-50 transition-all active:scale-95`}>Publish Laporan</button>
                </form>
              )}
            </div>

            {/* Riwayat Table */}
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
              <h2 className="text-2xl font-black flex items-center gap-4 text-slate-400 font-black uppercase tracking-widest">
                <LucideHistory className="w-6 h-6" /> Daftar Riwayat
              </h2>
              
              <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50 max-h-[700px] overflow-y-auto scrollbar-hide">
                {activeTab === 'income' && (
                  <ul className="space-y-3">
                    {data.incomes.map((item, idx) => (
                      <li key={item.id} className="p-5 rounded-3xl bg-slate-50 flex justify-between items-center group animate-in slide-in-from-bottom-2 fill-mode-both shadow-sm hover:shadow-md transition-all" style={{ animationDelay: `${idx * 40}ms` }}>
                        <div className="flex gap-4 items-center">
                           {item.proofImage && (
                             <button 
                               onClick={() => setViewingProof(item.proofImage!)}
                               className="w-12 h-12 rounded-2xl bg-white overflow-hidden flex items-center justify-center border-2 border-transparent hover:border-emerald-500 transition-all shadow-sm group"
                             >
                               <img src={item.proofImage} alt="Bukti" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </button>
                           )}
                           <div>
                             <p className="font-black text-slate-800 flex items-center gap-2">
                               {item.donorName}
                               {item.proofImage && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">Verified</span>}
                             </p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{formatDate(item.date)}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-black text-${layout.primaryColor}-600`}>{formatCurrency(item.amount)}</span>
                          <button onClick={() => onDelete('incomes', item.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><LucideTrash2 className="w-5 h-5" /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Other tables similar style... */}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Proof Overlay */}
      {viewingProof && (
        <div className="fixed inset-0 bg-slate-900/95 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md">
          <button onClick={() => setViewingProof(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-all transform hover:rotate-90">
            <LucideX className="w-10 h-10" />
          </button>
          <img src={viewingProof} className="max-w-full max-h-full rounded-[3rem] shadow-2xl border-4 border-white/5 animate-in zoom-in duration-500" alt="Detail Bukti" />
        </div>
      )}
    </div>
  );
};

export default App;
