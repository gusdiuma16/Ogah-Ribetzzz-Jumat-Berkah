import ogahLogo from './ogah.png';
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
  LucideCheck,
  LucideClock,
  LucideShieldCheck,
  LucideXCircle,
  LucideHome,
  LucideTarget,
  LucideInstagram,
  LucideBookOpen,
  LucideArrowRight,
  LucideFileText,
  LucideMonitor,
  LucidePlay,
  LucideDatabase,
  LucideAlertTriangle
} from 'lucide-react';
import { Income, Expense, Distribution, AppData, LayoutConfig, AppView, Article, GalleryItem } from './types';
import { APP_CONFIG, INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('ogah_ribet_portal_v1');
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      // Merge with initial data to ensure all fields exist
      return { 
        ...INITIAL_DATA, 
        ...parsed,
        layout: { ...INITIAL_DATA.layout, ...parsed.layout }
      };
    } catch {
      return INITIAL_DATA;
    }
  });
  
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [storageError, setStorageError] = useState(false);
  
  const [confName, setConfName] = useState('');
  const [confAmount, setConfAmount] = useState('');
  const [confImage, setConfImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Robust LocalStorage persistence with Quota Handling
  useEffect(() => {
    try {
      localStorage.setItem('ogah_ribet_portal_v1', JSON.stringify(data));
      setStorageError(false);
    } catch (e) {
      if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
        console.error('LocalStorage Quota Exceeded');
        setStorageError(true);
      }
    }
  }, [data]);

  useEffect(() => {
    if (accessCode === APP_CONFIG.SECRET_CODE) {
      setShowLoginModal(true);
      setAccessCode('');
    }
  }, [accessCode]);

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
      setCurrentView('admin');
    } else {
      setLoginError('Kredensial salah');
    }
  };

  const handleConfirmDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newPending: Income = {
      id: crypto.randomUUID(),
      donorName: confName.trim() || 'Hamba Allah',
      amount: parseInt(confAmount) || 0,
      date: new Date().toISOString().split('T')[0],
      proofImage: confImage || undefined
    };
    setTimeout(() => {
      setData(prev => ({ ...prev, pendingIncomes: [...prev.pendingIncomes, newPending] }));
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setConfName(''); setConfAmount(''); setConfImage(null);
      setTimeout(() => { setSubmitSuccess(false); setShowQrisModal(false); }, 3000);
    }, 1500);
  };

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const { layout } = data;
  const primaryColorClass = layout.primaryColor || 'emerald';

  if (isAdmin && currentView === 'admin') {
    return (
      <AdminDashboard 
        data={data} 
        setData={setData} 
        onLogout={() => { setIsAdmin(false); setCurrentView('home'); }} 
        formatCurrency={formatCurrency} 
        formatDate={formatDate}
        storageError={storageError}
      />
    );
  }

  return (
    <div className={`min-h-screen ${layout.themeMode === 'soft' ? 'bg-slate-100' : 'bg-slate-50'} text-slate-900 transition-all duration-500 pb-12`} style={{ fontFamily: layout.fontFamily }}>
      
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className={`w-10 h-10 rounded-xl bg-${primaryColorClass}-600 flex items-center justify-center text-white shadow-lg`}>
              <img src={ogahLogo} alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-800">
              {layout.foundationName ? layout.foundationName.split(' ')[0] : 'Ogah'} <span className={`text-${primaryColorClass}-600`}>Foundation</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-black uppercase text-[11px] tracking-widest text-slate-400">
            <button onClick={() => setCurrentView('home')} className={`transition-all hover:scale-105 ${currentView === 'home' ? `text-${primaryColorClass}-600` : 'hover:text-slate-600'}`}>Beranda</button>
            <button onClick={() => setCurrentView('transparency')} className={`transition-all hover:scale-105 ${currentView === 'transparency' ? `text-${primaryColorClass}-600` : 'hover:text-slate-600'}`}>Transparansi</button>
            <button onClick={() => setCurrentView('gallery')} className={`transition-all hover:scale-105 ${currentView === 'gallery' ? `text-${primaryColorClass}-600` : 'hover:text-slate-600'}`}>Dokumentasi</button>
            <button onClick={() => setCurrentView('articles')} className={`transition-all hover:scale-105 ${currentView === 'articles' ? `text-${primaryColorClass}-600` : 'hover:text-slate-600'}`}>Artikel</button>
            <button onClick={() => setShowLoginModal(true)} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"><LucideLock className="w-4 h-4" /></button>
          </div>
          
          <button className="md:hidden p-2 text-slate-400" onClick={() => setShowLoginModal(true)}><LucideLock className="w-6 h-6" /></button>
        </div>
      </nav>

      <main className="pt-24 animate-in fade-in duration-700">
        
        {/* HOME VIEW */}
        {currentView === 'home' && (
          <div className="space-y-24">
            {/* Hero */}
            <section className="px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 py-12 md:py-24">
              <div className="flex-1 space-y-8 text-center md:text-left">
                <div className={`inline-flex px-4 py-2 bg-${primaryColorClass}-50 text-${primaryColorClass}-600 rounded-full font-black text-xs uppercase tracking-widest animate-bounce-subtle`}>Bakti Untuk Sesama</div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                  {layout.foundationName}
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                  {layout.foundationDescription}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <button onClick={() => setCurrentView('transparency')} className={`px-10 py-5 bg-${primaryColorClass}-600 text-white rounded-2xl font-black shadow-2xl shadow-${primaryColorClass}-100 hover:scale-105 transition-all flex items-center gap-3`}>
                    Mulai Eksplorasi <LucideArrowRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowQrisModal(true)} className="px-10 py-5 bg-white text-slate-800 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition-all border border-slate-100">
                    Scan QRIS Donasi
                  </button>
                </div>
              </div>
              <div className="flex-1 relative group">
                <div className={`absolute -inset-6 bg-${primaryColorClass}-600/10 rounded-[5rem] blur-3xl group-hover:scale-110 transition-transform duration-1000`}></div>
                <img src={layout.heroImageUrl} className="relative w-full aspect-square md:aspect-[4/5] object-cover rounded-[3.5rem] shadow-2xl border-8 border-white" alt="Foundation Work" />
              </div>
            </section>

            {/* Menu Nav Icons */}
            <section className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: 'Transparency', icon: <LucideFileText />, view: 'transparency', color: 'emerald', desc: 'Dana & Alokasi' },
                { label: 'Kenali Kami', icon: <LucideInstagram />, link: layout.instagramUrl, color: 'rose', desc: 'Sosial Media' },
                { label: 'Dokumentasi', icon: <LucideImage />, view: 'gallery', color: 'blue', desc: 'Galeri Foto' },
                { label: 'Artikel', icon: <LucideBookOpen />, view: 'articles', color: 'indigo', desc: 'Blog Berita' },
                { label: 'Akses Privat', icon: <LucideMonitor />, action: () => setShowLoginModal(true), color: 'slate', desc: 'Panel Admin' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => item.view ? setCurrentView(item.view as AppView) : item.action ? item.action() : window.open(item.link, '_blank')}
                  className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:-translate-y-3 hover:shadow-2xl transition-all group overflow-hidden relative"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-${item.color}-500/20 group-hover:h-full transition-all duration-500`}></div>
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10 shadow-sm`}>
                    {item.icon}
                  </div>
                  <div className="text-center relative z-10">
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-800 transition-colors block">{item.label}</span>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors uppercase">{item.desc}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* About & Visi Misi */}
            <section className="bg-white py-24 px-6 border-y border-slate-50">
              <div className="max-w-6xl mx-auto space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">Tentang <span className={`text-${primaryColorClass}-600`}>Yayasan</span></h2>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                      {layout.aboutUs}
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-black text-slate-900">{data.incomes.length + 15}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Donatur Tetap</p>
                      </div>
                      <div className="w-px h-10 bg-slate-100"></div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-slate-900">{data.distributions.length + 120}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Paket Tersebar</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className={`p-10 rounded-[3rem] bg-${primaryColorClass}-600 text-white space-y-6 shadow-2xl shadow-${primaryColorClass}-100 hover:scale-[1.02] transition-all`}>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                        <LucideTarget className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Visi & Misi</h3>
                      <div className="space-y-4">
                        <p className="font-bold border-l-4 border-white/30 pl-4">{layout.vision}</p>
                        <p className="text-white/80 font-medium text-sm leading-relaxed">{layout.mission}</p>
                      </div>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50 space-y-6 hover:bg-slate-100 transition-all group">
                      <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-${primaryColorClass}-600 shadow-sm group-hover:scale-110 transition-transform`}>
                        <LucideCheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Tujuan Kami</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{layout.goals}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Other views (transparency, gallery, articles) follow the same logic as before... */}
        {currentView === 'transparency' && (
          <div className="max-w-4xl mx-auto px-6 space-y-12 pb-24">
             <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-800 uppercase">Transparansi Dana</h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">Data Keuangan Real-Time</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-b-4 border-emerald-500">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pemasukan</p>
                <p className="text-xl md:text-2xl font-black text-slate-800">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-b-4 border-red-500">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pengeluaran</p>
                <p className="text-xl md:text-2xl font-black text-slate-800">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-white p-8 rounded-[3rem] shadow-2xl border-b-4 border-blue-500 text-center md:text-left">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Sisa Dana Yayasan</p>
                <p className={`text-xl md:text-2xl font-black text-${primaryColorClass}-600`}>{formatCurrency(balance)}</p>
              </div>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
                <h3 className={`text-xl font-black mb-8 flex items-center gap-3 text-${primaryColorClass}-800 uppercase tracking-tight`}><LucideHistory className="w-5 h-5" /> Donasi Masuk</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-300 font-black uppercase text-[10px] tracking-widest border-b"><th className="pb-4">Nama Donatur</th><th className="pb-4">Tanggal</th><th className="pb-4 text-right">Nominal</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.incomes.map((item, i) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors animate-in fade-in" style={{animationDelay: `${i*50}ms`}}>
                          <td className="py-5 font-bold text-slate-700">{item.donorName}</td>
                          <td className="py-5 text-slate-400">{formatDate(item.date)}</td>
                          <td className="py-5 text-right font-black text-emerald-600">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-red-800 uppercase tracking-tight"><LucideHistory className="w-5 h-5" /> Alokasi Pengeluaran</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-300 font-black uppercase text-[10px] tracking-widest border-b"><th className="pb-4">Keperluan</th><th className="pb-4 text-center">Qty</th><th className="pb-4 text-right">Total</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.expenses.map((item, i) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors animate-in fade-in" style={{animationDelay: `${i*50}ms`}}>
                          <td className="py-5 font-bold text-slate-700">{item.itemName}</td>
                          <td className="py-5 text-center font-black">x{item.qty}</td>
                          <td className="py-5 text-right font-black text-red-600">{formatCurrency(item.unitPrice * item.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        {currentView === 'gallery' && (
          <div className="max-w-6xl mx-auto px-6 pb-24 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-800 uppercase">Dokumentasi Kita</h2>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
              {data.gallery.map((item) => (
                <div key={item.id} className="break-inside-avoid relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl animate-in zoom-in duration-700 group">
                  <img src={item.url} className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.caption} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-white font-black text-lg mb-1">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'articles' && (
          <div className="max-w-5xl mx-auto px-6 pb-24 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-800 uppercase">Artikel & Kabar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {data.articles.map((article) => (
                <div key={article.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-slate-50 flex flex-col group animate-in slide-in-from-bottom-12 duration-700">
                  <div className="relative h-72 overflow-hidden">
                    <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={article.title} />
                  </div>
                  <div className="p-10 space-y-4">
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">{article.title}</h3>
                    <p className="text-slate-500 leading-relaxed line-clamp-3">{article.content}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 pt-4">{formatDate(article.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QRIS Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 flex flex-col max-h-[92vh] p-10">
            <button onClick={() => setShowQrisModal(false)} className="self-end p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm"><LucideX className="w-6 h-6" /></button>
            <div className="overflow-y-auto pr-2 scrollbar-hide flex-grow mt-2">
              <div className="text-center mb-8">
                <div className={`inline-flex p-5 bg-${primaryColorClass}-50 text-${primaryColorClass}-600 rounded-3xl mb-6 shadow-inner`}><LucideQrCode className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Scan Donasi</h3>
                <div className="mt-8 bg-white p-6 rounded-[3rem] border-4 border-slate-50 shadow-2xl inline-block mx-auto"><img src={layout.qrisImageUrl} alt="QRIS" className="w-56 h-56 rounded-2xl" /></div>
              </div>
              <div className="border-t border-slate-100 pt-10 space-y-6">
                <h4 className="font-black text-xl text-slate-800 uppercase tracking-tight flex items-center gap-3"><div className={`w-8 h-8 rounded-full bg-${primaryColorClass}-500 text-white flex items-center justify-center text-sm`}>2</div> Konfirmasi Bayar</h4>
                {submitSuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-10 rounded-[3rem] text-center border border-emerald-100 animate-in zoom-in"><LucideClock className="w-12 h-12 mx-auto mb-4 animate-pulse" /><h5 className="font-black text-xl mb-2 tracking-tight">Berhasil Terkirim</h5><p className="text-sm font-medium opacity-80">Donasi Anda segera kami verifikasi di panel pengurus.</p></div>
                ) : (
                  <form onSubmit={handleConfirmDonation} className="space-y-5">
                    <input type="text" placeholder="Nama Donatur (Hamba Allah)" value={confName} onChange={(e) => setConfName(e.target.value)} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold bg-slate-50/50 text-lg" />
                    <input required type="number" placeholder="Nominal Rp" value={confAmount} onChange={(e) => setConfAmount(e.target.value)} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-emerald-500 outline-none font-black bg-slate-50/50 text-lg" />
                    <div className="relative p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center gap-3 group hover:bg-slate-50 transition-all cursor-pointer">
                       <input required type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = () => setConfImage(r.result as string); r.readAsDataURL(file); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       {confImage ? <LucideCheck className="text-emerald-500 w-10 h-10" /> : <LucideUpload className="text-slate-300 w-10 h-10" />}
                       <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{confImage ? 'Bukti Terlampir' : 'Upload Bukti Bayar'}</span>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={`w-full py-6 bg-${primaryColorClass}-600 text-white rounded-[1.8rem] font-black shadow-2xl shadow-${primaryColorClass}-100 active:scale-95 transition-all text-lg tracking-tight`}>{isSubmitting ? 'Mengirim Data...' : 'Kirim Konfirmasi'}</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl p-12 animate-in zoom-in duration-300 border border-white/20">
            <div className="flex justify-center mb-8"><div className={`p-5 bg-${primaryColorClass}-50 text-${primaryColorClass}-600 rounded-[1.8rem] shadow-inner`}><LucideLock className="w-10 h-10" /></div></div>
            <h2 className="text-3xl font-black text-center text-slate-800 tracking-tighter">Panel Admin</h2>
            <form onSubmit={handleLogin} className="mt-10 space-y-5">
              <input autoFocus type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold bg-slate-50/50 text-sm" placeholder="Username" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 focus:border-emerald-500 outline-none font-bold bg-slate-50/50 text-sm" placeholder="Password" />
              {loginError && <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest animate-pulse">{loginError}</p>}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest">Batal</button>
                <button type="submit" className={`flex-1 py-5 rounded-2xl bg-${primaryColorClass}-600 text-white font-black hover:scale-105 transition-all shadow-xl shadow-${primaryColorClass}-100 text-sm uppercase tracking-widest`}>Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Code Footer */}
      <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
        <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="..." className="w-12 h-6 text-center bg-transparent border-none text-[8px] text-slate-300 pointer-events-auto outline-none" />
      </footer>
    </div>
  );
};

const AdminDashboard: React.FC<{
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  onLogout: () => void;
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
  storageError: boolean;
}> = ({ data, setData, onLogout, formatCurrency, formatDate, storageError }) => {
  const [activeTab, setActiveTab] = useState<'verify' | 'income' | 'expense' | 'articles' | 'gallery' | 'content'>('verify');
  const [layoutForm, setLayoutForm] = useState<LayoutConfig>(data.layout);
  const [newArticle, setNewArticle] = useState<Omit<Article, 'id'>>({ title: '', content: '', date: new Date().toISOString().split('T')[0], imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop' });
  const [newGallery, setNewGallery] = useState<Omit<GalleryItem, 'id'>>({ url: '', caption: '', type: 'image' });
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const primaryColorClass = data.layout.primaryColor || 'emerald';

  const approveIncome = (id: string) => {
    const item = data.pendingIncomes.find(i => i.id === id);
    if (item) setData(prev => ({ ...prev, incomes: [...prev.incomes, item], pendingIncomes: prev.pendingIncomes.filter(i => i.id !== id) }));
  };

  const deleteItem = (type: keyof AppData, id: string) => {
    setData(prev => ({ ...prev, [type]: (prev[type] as any[]).filter((i: any) => i.id !== id) }));
  };

  const clearStorage = () => {
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data dan kembali ke pengaturan awal?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const clearPending = () => {
    if (confirm('Hapus semua antrean donasi yang belum diverifikasi? Ini akan mengosongkan memori.')) {
      setData(prev => ({ ...prev, pendingIncomes: [] }));
    }
  };

  const saveContent = () => {
    setData(prev => ({ ...prev, layout: layoutForm }));
    alert('Konten Berhasil Diperbarui!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 p-8 flex flex-col animate-in slide-in-from-left-full duration-700 h-screen overflow-y-auto sticky top-0">
        <div className="flex items-center gap-4 mb-12">
          <div className={`p-4 bg-${primaryColorClass}-600 text-white rounded-2xl shadow-xl`}><LucideLock className="w-6 h-6" /></div>
          <span className="font-black text-2xl text-slate-800 tracking-tighter">Admin Portal</span>
        </div>
        <nav className="space-y-3 flex-grow">
          {[
            { id: 'verify', label: 'Verifikasi QRIS', icon: <LucideShieldCheck className="w-5 h-5" />, count: data.pendingIncomes.length },
            { id: 'income', label: 'Pemasukan', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'expense', label: 'Pengeluaran', icon: <LucidePlus className="w-5 h-5" /> },
            { id: 'articles', label: 'Artikel & Berita', icon: <LucideBookOpen className="w-5 h-5" /> },
            { id: 'gallery', label: 'Galeri Dokumentasi', icon: <LucideImage className="w-5 h-5" /> },
            { id: 'content', label: 'Konten Website', icon: <LucidePalette className="w-5 h-5" /> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] font-black transition-all text-xs uppercase tracking-widest ${activeTab === tab.id ? `bg-${primaryColorClass}-600 text-white shadow-2xl scale-[1.03]` : 'text-slate-400 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4">{tab.icon} {tab.label}</div>
              {tab.count !== undefined && tab.count > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'}`}>{tab.count}</span>}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-12 flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"><LucideLogOut className="w-5 h-5" /> Keluar Dashboard</button>
      </aside>

      <main className="flex-grow p-8 md:p-16 overflow-y-auto bg-slate-50/50">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{activeTab.replace(/([A-Z])/g, ' $1')} Manager</h1>
            <div className={`h-2 w-24 bg-${primaryColorClass}-500 rounded-full mt-4`}></div>
          </div>
          {storageError && (
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl flex items-center gap-4 animate-pulse">
              <LucideAlertTriangle className="text-amber-600 w-6 h-6" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-amber-800 tracking-widest">Memori Penuh</p>
                <p className="text-[9px] font-bold text-amber-600">Hapus data lama untuk menyimpan data baru.</p>
              </div>
            </div>
          )}
        </header>

        {activeTab === 'verify' && (
          <div className="space-y-6 max-w-4xl">
            {storageError && (
              <div className="bg-white p-6 rounded-[2rem] border-2 border-amber-100 flex items-center justify-between shadow-sm">
                <p className="text-xs font-bold text-slate-500">Antrean bukti transfer (Base64) memakan terlalu banyak memori. Bersihkan antrean jika perlu.</p>
                <button onClick={clearPending} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase">Bersihkan Antrean</button>
              </div>
            )}
            {data.pendingIncomes.length === 0 ? <div className="bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-100 flex flex-col items-center"><LucideClock className="w-16 h-16 text-slate-100 mb-6" /><h3 className="text-slate-300 font-black uppercase tracking-widest">Tidak ada antrean donasi</h3></div> : data.pendingIncomes.map(item => (
              <div key={item.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 flex justify-between items-center animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex gap-6 items-center">
                  <button onClick={() => setViewingProof(item.proofImage!)} className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-slate-100 border-2 border-slate-50 shadow-inner group relative">
                    <img src={item.proofImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </button>
                  <div>
                    <p className="font-black text-slate-800 text-xl">{item.donorName}</p>
                    <p className="font-black text-emerald-600 text-lg">{formatCurrency(item.amount)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => deleteItem('pendingIncomes', item.id)} className="p-5 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-100 transition-all shadow-sm"><LucideXCircle className="w-8 h-8" /></button>
                   <button onClick={() => approveIncome(item.id)} className={`p-5 bg-${primaryColorClass}-500 text-white rounded-[1.5rem] shadow-2xl hover:scale-105 transition-all`}><LucideShieldCheck className="w-8 h-8" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-10 max-w-5xl">
            <div className="bg-white rounded-[4rem] p-12 shadow-2xl space-y-10 border border-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-400 px-4">Nama Yayasan</label><input type="text" value={layoutForm.foundationName} onChange={e => setLayoutForm({...layoutForm, foundationName: e.target.value})} className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 font-black border-2 border-transparent focus:border-emerald-500 outline-none text-lg" /></div>
                <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-400 px-4">Instagram URL</label><input type="text" value={layoutForm.instagramUrl} onChange={e => setLayoutForm({...layoutForm, instagramUrl: e.target.value})} className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 font-black border-2 border-transparent focus:border-emerald-500 outline-none text-lg" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-400 px-4">Slogan / Deskripsi Hero</label><textarea rows={3} value={layoutForm.foundationDescription} onChange={e => setLayoutForm({...layoutForm, foundationDescription: e.target.value})} className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-50 font-black border-2 border-transparent focus:border-emerald-500 outline-none text-lg leading-relaxed" /></div>
              <button onClick={saveContent} className={`w-full py-6 bg-${primaryColorClass}-600 text-white rounded-[2rem] font-black shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-xl tracking-tight`}><LucideSave className="w-8 h-8" /> Update Konten Branding</button>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-4"><LucideDatabase className="w-6 h-6 text-slate-400" /> Manajemen Sistem & Penyimpanan</h3>
              <p className="text-sm text-slate-400 font-medium">Jika aplikasi terasa lambat atau gagal menyimpan data baru (Quota Exceeded), Anda dapat membersihkan cache data lama atau mengosongkan seluruh penyimpanan.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <button onClick={clearPending} className="flex items-center justify-center gap-3 py-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-all">
                  <LucideXCircle className="w-5 h-5" /> Bersihkan Antrean QRIS
                </button>
                <button onClick={clearStorage} className="flex items-center justify-center gap-3 py-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                  <LucideTrash2 className="w-5 h-5" /> Reset Total Website
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Article/Gallery sections remain mostly the same... */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-6xl">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl space-y-8 h-fit border border-slate-50">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4"><LucidePlus className="w-8 h-8 text-emerald-500" /> Tulis Artikel Baru</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setData(prev => ({...prev, articles: [...prev.articles, {...newArticle, id: crypto.randomUUID()}]})); setNewArticle({...newArticle, title: '', content: ''}); }}>
                <input type="text" placeholder="Judul Artikel" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                <textarea rows={6} placeholder="Konten Artikel..." value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-medium outline-none border-2 border-transparent focus:border-emerald-500" required />
                <input type="url" placeholder="URL Gambar Header" value={newArticle.imageUrl} onChange={e => setNewArticle({...newArticle, imageUrl: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500" required />
                <button type="submit" className={`w-full py-6 bg-${primaryColorClass}-600 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all text-lg`}>Publish Artikel</button>
              </form>
            </div>
            <div className="space-y-6">
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest px-4">Daftar Artikel</h3>
               <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2">
                 {data.articles.map(a => (
                   <div key={a.id} className="bg-white p-6 rounded-[2.5rem] shadow-lg flex justify-between items-center group border border-slate-50">
                     <div className="flex gap-4 items-center">
                       <img src={a.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                       <div className="max-w-[200px]"><p className="font-black text-slate-800 truncate">{a.title}</p></div>
                     </div>
                     <button onClick={() => deleteItem('articles', a.id)} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><LucideTrash2 className="w-6 h-6" /></button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Existing tabs follow previous patterns... */}
        {(activeTab === 'income' || activeTab === 'expense') && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pb-20 max-w-6xl">
              <div className="bg-white rounded-[4rem] p-12 shadow-2xl space-y-8 h-fit border border-slate-50">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-6">
                  <div className={`p-4 bg-${primaryColorClass}-50 text-${primaryColorClass}-600 rounded-[1.8rem] shadow-inner`}>
                    <LucidePlus className="w-8 h-8" />
                  </div>
                  Input Manual
                </h2>
                {activeTab === 'income' ? (
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const name = (e.currentTarget.elements[0] as HTMLInputElement).value; const amount = parseInt((e.currentTarget.elements[1] as HTMLInputElement).value); setData(prev => ({...prev, incomes: [...prev.incomes, {id: crypto.randomUUID(), donorName: name, amount, date: new Date().toISOString().split('T')[0]}]})); e.currentTarget.reset(); }}>
                    <input type="text" placeholder="Nama Donatur" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                    <input type="number" placeholder="Nominal Rp" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                    <button type="submit" className={`w-full py-6 bg-${primaryColorClass}-600 text-white rounded-[2rem] font-black shadow-2xl transition-all`}>Simpan Donasi</button>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); const item = (e.currentTarget.elements[0] as HTMLInputElement).value; const price = parseInt((e.currentTarget.elements[1] as HTMLInputElement).value); const qty = parseInt((e.currentTarget.elements[2] as HTMLInputElement).value); setData(prev => ({...prev, expenses: [...prev.expenses, {id: crypto.randomUUID(), itemName: item, unitPrice: price, qty, date: new Date().toISOString().split('T')[0]}]})); e.currentTarget.reset(); }}>
                    <input type="text" placeholder="Keperluan" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-red-500" required />
                    <div className="grid grid-cols-2 gap-6">
                      <input type="number" placeholder="Harga" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-red-500" required />
                      <input type="number" placeholder="Qty" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-red-500" required />
                    </div>
                    <button type="submit" className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black shadow-2xl transition-all">Simpan Pengeluaran</button>
                  </form>
                )}
              </div>
              <div className="bg-white rounded-[4rem] p-10 shadow-xl max-h-[700px] overflow-y-auto border border-slate-50">
                <h3 className="text-xl font-black text-slate-400 mb-8 uppercase tracking-widest flex items-center gap-4"><LucideHistory className="w-6 h-6" /> Log Transaksi</h3>
                <div className="space-y-4">
                  {(activeTab === 'income' ? data.incomes : data.expenses).map(item => (
                    <div key={item.id} className="p-6 bg-slate-50 rounded-[2rem] flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                      <div>
                        <p className="font-black text-slate-800 text-lg">{'donorName' in item ? item.donorName : (item as Expense).itemName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`font-black text-lg ${'amount' in item ? 'text-emerald-600' : 'text-red-600'}`}>
                          {'amount' in item ? formatCurrency(item.amount) : formatCurrency((item as Expense).unitPrice * (item as Expense).qty)}
                        </span>
                        <button onClick={() => deleteItem(activeTab === 'income' ? 'incomes' : 'expenses', item.id)} className="text-slate-200 hover:text-red-500 transition-colors transform hover:rotate-12"><LucideTrash2 className="w-7 h-7" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-6xl">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl space-y-8 h-fit border border-slate-50">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4"><LucidePlus className="w-8 h-8 text-blue-500" /> Tambah Dokumentasi</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setData(prev => ({...prev, gallery: [...prev.gallery, {...newGallery, id: crypto.randomUUID()}]})); setNewGallery({...newGallery, url: '', caption: ''}); }}>
                <input type="url" placeholder="URL Gambar/Video" value={newGallery.url} onChange={e => setNewGallery({...newGallery, url: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500" required />
                <input type="text" placeholder="Caption Momen" value={newGallery.caption} onChange={e => setNewGallery({...newGallery, caption: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500" required />
                <button type="submit" className={`w-full py-6 bg-${primaryColorClass}-600 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all text-lg`}>Tambah Ke Galeri</button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-4 h-fit">
              {data.gallery.map(g => (
                <div key={g.id} className="relative group rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-square">
                  <img src={g.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <button onClick={() => deleteItem('gallery', g.id)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><LucideTrash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {viewingProof && (
        <div className="fixed inset-0 bg-slate-900/95 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md">
          <button onClick={() => setViewingProof(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-all transform hover:rotate-90">
            <LucideX className="w-12 h-12" />
          </button>
          <img src={viewingProof} className="max-w-full max-h-full rounded-[4rem] shadow-2xl border-4 border-white/10 animate-in zoom-in duration-500" alt="Detail Bukti" />
        </div>
      )}
    </div>
  );
};

export default App;
