
import React, { useState, useEffect } from 'react';
import { ModuleDefinition, ModuleId, Theme, UserProfile } from '../types';
import { Menu, X, LogOut, Home, ChevronDown, History, Info, Mail, ShieldCheck, Clock as ClockIcon, Globe, Shield, Lock, Zap, Database, EyeOff, Instagram, MessageCircle, Briefcase, CheckCircle2, Rocket, Code2, Sparkles as SparklesIcon, Key } from 'lucide-react';
import { MODULES } from './modules/Home';

interface LayoutProps {
  children: React.ReactNode;
  activeModuleId: ModuleId;
  onNavigate: (id: ModuleId) => void;
  user: UserProfile | null;
  onLogout: () => void;
  isSaving: boolean;
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
    <div className="text-[10px] font-mono opacity-60 flex items-center gap-1.5">
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
          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, activeModuleId, onNavigate, user, onLogout, isSaving }) => {
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

  const handleManageKey = async () => {
    await window.aistudio.openSelectKey();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      
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
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
             {/* Key Management Button */}
            <button 
                onClick={handleManageKey}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 transition-all group"
            >
                <div className="p-1.5 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <Key size={14} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest">API Key Active</p>
                    <p className="text-[9px] opacity-70">Ganti / Atur Kunci Anda</p>
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

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500"><Menu size={24} /></button>
           <div className="font-black text-violet-600 flex items-center gap-2">
              <GeGePrismLogo size="sm" /> GEGE VISION
           </div>
           <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-10 min-h-[calc(100vh-140px)]">
            {children}
          </div>
          <footer className="bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 py-10 px-6">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Dibuat dengan ❤️ oleh GeGe Teams.</p>
                <p className="text-[10px] text-gray-400 mt-1">© 2025 GeGe Vision. All rights reserved.</p>
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
