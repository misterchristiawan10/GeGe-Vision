
import React, { useState, useEffect } from 'react';
import { ModuleDefinition, ModuleId, Theme, UserProfile } from '../types';
import { 
  Menu, X, LogOut, Home, ChevronDown, History, Info, Mail, 
  ShieldCheck, Clock as ClockIcon, Globe, Shield, Lock, Zap, 
  Database, EyeOff, Instagram, MessageCircle, Briefcase, 
  CheckCircle2, Rocket, Code2, Sparkles as SparklesIcon, 
  Settings, Key, Cpu, Sun, Moon
} from 'lucide-react';
import { MODULES } from './modules/Home';

interface LayoutProps {
  children: React.ReactNode;
  activeModuleId: ModuleId;
  onNavigate: (id: ModuleId) => void;
  user: UserProfile | null;
  onLogout: () => void;
  isSaving: boolean;
  onOpenApiSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const GeGePrismLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "w-9 h-9" : size === "md" ? "w-12 h-12" : "w-16 h-16";
  return (
    <div className={`${sizeClass} relative flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-950 to-black rounded-[28%] shadow-xl border border-white/10 group overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
        <path 
          d="M42,32 C35,32 28,38 28,50 C28,62 35,68 42,68 C48,68 51,64 51,58 L51,48 L42,48 M58,68 C65,68 72,62 72,50 C72,38 65,32 58,32 C52,32 49,36 49,42 L49,52 L58,52" 
          fill="none" 
          stroke="url(#goldGradientEnhanced)" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="goldGradientEnhanced" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-[10px] font-mono opacity-60 flex items-center gap-1.5 dark:text-gray-300">
      <ClockIcon size={10} />
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <h3 className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] text-[10px]">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, activeModuleId, onNavigate, user, onLogout, isSaving, onOpenApiSettings, theme, onToggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'contact' | 'about' | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Virtual Studio": true,
    "Video & Audio": true
  });

  const CATEGORIES = [
    { name: "Seni & Desain", moduleIds: ['karikatur', 'infografis', 'renovation-timelapse'] as ModuleId[] },
    { name: "Bisnis & Marketing", moduleIds: ['pinsta-product', 'content-creator', 'rebel-fx'] as ModuleId[] },
    { name: "Virtual Studio", moduleIds: ['world-tour', 'virtual-photoshoot', 'prewed-virtual', 'cosplay-fusion', 'bikini-photoshoot', 'smart-panda-studio'] as ModuleId[] },
    { name: "Video & Audio", moduleIds: ['vidgen', 'story-board', 'voice-over', 'mp4-to-mp3', 'thumbnail-maker', 'asmr-visual', 'image-resizer'] as ModuleId[] },
  ];

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNavClick = (id: ModuleId) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-dark-bg transition-colors duration-300 overflow-x-hidden">
      
      {/* About Modal */}
      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title="THE CORE VISION: SCALING FUTURE">
        <div className="space-y-8 py-2">
          <div className="text-center space-y-3">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                <Rocket size={40} />
             </div>
             <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Apa itu GeGe Vision?</h2>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400">The Ultimate Creative OS for Digital Visionaries</p>
          </div>

          <div className="space-y-8">
             <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center shadow-inner">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                   <span className="font-black text-indigo-600">GeGe Vision</span> bukan sekadar aplikasi AI biasa. Kami adalah ekosistem terpadu yang dirancang untuk menjadi "Brain Extension" bagi para kreator, desainer, dan pebisnis digital. Dengan engine <b>Prism v1.2.0</b>, kami menyatukan kekuatan generative AI tingkat tinggi ke dalam alur kerja yang intuitif dan <i>hassle-free</i>.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-3 hover:scale-105 transition-transform">
                   <div className="text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest">GOLD</div>
                   <p className="text-xs font-medium leading-relaxed">Kualitas premium tanpa kompromi. Setiap piksel dan bit audio diproses untuk hasil standar industri.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 space-y-3 hover:scale-105 transition-transform">
                   <div className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">GOSPEL</div>
                   <p className="text-xs font-medium leading-relaxed">Integritas data adalah harga mati. Privasi pengguna dan kedaulatan digital adalah fondasi kami.</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20 space-y-3 hover:scale-105 transition-transform">
                   <div className="text-violet-600 dark:text-violet-400 font-black text-xs uppercase tracking-widest">GEGE</div>
                   <p className="text-xs font-medium leading-relaxed">Winning energy. Kami memberikan <i>leverage</i> tak terbatas agar karya Anda selalu jadi "Final Boss" di market.</p>
                </div>
             </div>

             <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-2xl">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Code2 size={200} />
                </div>
                <h4 className="font-bold text-base mb-6 flex items-center gap-3">
                   <SparklesIcon size={20} className="text-yellow-400" /> Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                   {['GOOGLE GEMINI 3', 'VEO 3.1', 'PRISM ENGINE', 'EDGE COMPUTE', 'LOCAL-FIRST DB'].map(tech => (
                      <span key={tech} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/20 transition-colors">{tech}</span>
                   ))}
                </div>
                <p className="text-[10px] mt-8 opacity-60 italic font-medium">Handcrafted with precision by GeGe Creative Studio.</p>
             </div>
          </div>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="DIGITAL SOVEREIGNTY & GEGE VAULT">
        <div className="space-y-8 py-2">
          <div className="text-center space-y-2">
             <div className="w-20 h-20 bg-violet-500/10 rounded-[2rem] flex items-center justify-center text-violet-500 mx-auto border border-violet-500/20 shadow-inner">
                <Lock size={40} />
             </div>
             <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Privasi Anda Adalah Prioritas Gold Kami</h2>
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Versi 1.2.0 • Protokol Keamanan Ephemeral Aktif</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-violet-500 font-black text-xs uppercase tracking-widest">
                   <Zap size={18} /> EPHEMERAL PROCESSING
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">Setiap piksel yang Anda unggah diproses secara <b>real-time</b> melalui Google Gemini API tingkat tinggi. GeGe Vision tidak menyimpan salinan data mentah Anda di server pusat kami. Begitu sesi selesai, data menghilang bagai debu digital.</p>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-widest">
                   <Database size={18} /> LOCAL-FIRST MEMORY
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">Kami menggunakan teknologi <b>IndexedDB</b> (penyimpanan lokal peramban) untuk menyimpan riwayat kreasi Anda. Artinya, aset berharga Anda tetap berada di perangkat Anda, bukan di tangan pihak ketiga. Anda pegang kendali penuh.</p>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest">
                   <EyeOff size={18} /> ZERO TRACKING POLICY
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">GeGe Vision bebas dari iklan yang mengganggu dan pelacak perilaku (trackers). Kami tidak menjual data kebiasaan kreatif Anda kepada broker data. Kami di sini untuk akselerasi karya, bukan eksploitasi data.</p>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 text-rose-500 font-black text-xs uppercase tracking-widest">
                   <Shield size={18} /> ENTERPRISE GRADE ENCRYPTION
                </div>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">Semua komunikasi antara browser Anda dan mesin AI kami dilindungi oleh enkripsi <b>TLS 1.3</b>. Koneksi aman, ide aman, hasil pun aman. Tidak ada celah untuk penyadapan data visual Anda.</p>
             </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-indigo-950 text-white space-y-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldCheck size={100} />
             </div>
             <h4 className="font-bold text-base flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-400" /> Komitmen GeGe Vision
             </h4>
             <p className="text-xs opacity-90 leading-relaxed italic font-serif">
                "Kami percaya bahwa kreativitas tanpa privasi adalah kerentanan. Di GeGe Vision, kami membangun benteng digital supaya imajinasi Anda bisa terbang bebas tanpa rasa takut diawasi. Gold untuk kualitas, Gospel untuk integritas, dan GeGe untuk kemenangan karya Anda."
             </p>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="CONNECT WITH CREATIVE HQ">
        <div className="space-y-8 py-2">
          <div className="text-center space-y-3">
             <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mx-auto border border-indigo-500/20 shadow-inner">
                <MessageCircle size={40} />
             </div>
             <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Let's Sync Your Vision!</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Punya ide gila, butuh support teknis, atau mau kolaborasi bisnis? Tim spesialis AI kami siap bantu <b>gaspol</b> progres Anda.
             </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <a href="mailto:support@gegevision.com" className="flex items-center gap-6 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] hover:border-indigo-500 transition-all group shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/20">
                   <Mail size={24}/>
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Official Inquiry</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">support@gegevision.com</p>
                   <p className="text-[10px] text-gray-400 mt-1">Response time: &lt; 24 jam</p>
                </div>
                <Zap size={20} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
             </a>

             <div className="flex items-center gap-6 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] group shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
                   <Briefcase size={24}/>
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-1">Partnerships</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white">business@gegevision.com</p>
                   <p className="text-[10px] text-gray-400 mt-1">Scale your project with our AI Engine.</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] hover:border-pink-500 transition-all group text-center">
                   <Instagram size={32} className="text-pink-500 group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-pink-500">Instagram</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] hover:border-emerald-500 transition-all group text-center">
                   <Globe size={32} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-500">Community HQ</span>
                </a>
             </div>
          </div>
        </div>
      </Modal>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
              <GeGePrismLogo size="sm" />
              <div>
                <h1 className="text-lg font-black tracking-tighter text-gray-900 dark:text-white leading-none">GEGE VISION</h1>
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-500 font-bold mt-1">v1.2.0 • Pro Ecosystem</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400"><X size={20}/></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Theme Toggle Button */}
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                    </span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}></div>
                </div>
            </button>

             {/* Key Management Button */}
            <button 
                onClick={onOpenApiSettings}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-violet-600/5 hover:bg-violet-600/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 transition-all group"
            >
                <div className="p-1.5 bg-violet-600 rounded-lg text-white shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                    <Settings size={14} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">API Vault Settings</p>
                    <p className="text-[9px] opacity-70">Kelola 3 API Key Anda</p>
                </div>
            </button>

            <div className="space-y-1">
              <NavButton active={activeModuleId === 'home'} onClick={() => handleNavClick('home')} icon={Home}>Beranda</NavButton>
              <NavButton active={activeModuleId === 'global-history'} onClick={() => handleNavClick('global-history')} icon={History}>Riwayat Global</NavButton>
            </div>

            {CATEGORIES.map(category => (
              <div key={category.name} className="space-y-1">
                <button 
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-violet-500 transition-colors"
                >
                  <span>{category.name}</span>
                  <ChevronDown size={12} className={`transition-transform duration-300 ${openCategories[category.name] ? 'rotate-180' : ''}`} />
                </button>
                {openCategories[category.name] && (
                  <div className="space-y-0.5 mt-1">
                    {category.moduleIds.map(id => {
                      const mod = MODULES.find(m => m.id === id);
                      if (!mod) return null;
                      return (
                        <NavButton key={id} active={activeModuleId === id} onClick={() => handleNavClick(id)} icon={mod.icon} isSub>
                          {mod.title}
                        </NavButton>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
            {user && (
              <div className="flex items-center gap-3 mb-4 p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border-2 border-violet-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate text-gray-900 dark:text-white">{user.name}</p>
                  <div className="flex items-center justify-between">
                    <Clock />
                    {isSaving && (
                      <div className="flex items-center gap-1 text-[8px] text-emerald-500 font-bold animate-pulse">
                        <Zap size={8} /> SAVING...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30">
              <LogOut size={16} /> Logout Sesi
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 dark:text-gray-400"><Menu size={24} /></button>
           <div className="font-black text-violet-600 flex items-center gap-2 dark:text-violet-400">
              <GeGePrismLogo size="sm" /> GEGE VISION
           </div>
           <button onClick={onToggleTheme} className="p-2 text-gray-500 dark:text-gray-400">
              {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
           </button>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10">
            {children}
          </div>
          
          <footer className="bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 py-12 px-8 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Column 1: App Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <GeGePrismLogo size="sm" />
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">GEGE VISION</h3>
                                <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest leading-none mt-1">GOLD, GOSPEL, GEGE</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-200 dark:border-violet-800/50 shadow-sm">
                                Operational
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">v1.2.0-PRISM</span>
                        </div>
                    </div>

                    {/* Column 2: Layanan */}
                    <div className="flex flex-col">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">LAYANAN</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => handleNavClick('home')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">AI Studio</button></li>
                            <li><button onClick={() => handleNavClick('vidgen')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">AI Video</button></li>
                            <li><button onClick={() => handleNavClick('rebel-fx')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">AI Trading</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal & Support */}
                    <div className="flex flex-col">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">LEGAL & SUPPORT</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => setActiveModal('privacy')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">Privasi</button></li>
                            <li><button onClick={() => setActiveModal('contact')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">Kontak</button></li>
                            <li><button onClick={() => setActiveModal('about')} className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-colors">Tentang Aplikasi</button></li>
                        </ul>
                    </div>

                    {/* Column 4: Credits & Social Icons */}
                    <div className="md:text-right space-y-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Dibuat dengan ❤️ oleh <span className="font-black text-violet-600">GeGe Teams.</span></p>
                            <p className="text-[10px] text-gray-400">© 2025 GeGe Vision. All rights reserved.</p>
                        </div>
                        <div className="flex md:justify-end gap-3 pt-4">
                            <button onClick={() => setActiveModal('privacy')} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-violet-500 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
                                <ShieldCheck size={18} />
                            </button>
                            <button onClick={() => setActiveModal('about')} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-violet-500 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
                                <Info size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; children: React.ReactNode; isSub?: boolean }> = ({ active, onClick, icon: Icon, children, isSub }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 relative group ${
      active 
        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold shadow-sm' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
    } ${isSub ? 'pl-4' : ''}`}
  >
    <div className={`flex items-center justify-center w-6 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      <Icon size={isSub ? 16 : 20} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={isSub ? 'text-xs' : 'text-sm'}>{children}</span>
    {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse"></div>}
  </button>
);
