
import React from 'react';
import { X, Sparkles, Rocket, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface WelcomeMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureItem = ({ icon: Icon, title, desc, color }: any) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 transition-all hover:scale-[1.02]">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-fade-in-up">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row h-full">
          {/* Left Branding Side (Desktop) */}
          <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-950 via-violet-950 to-black p-10 flex-col justify-between text-white border-r border-white/5">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Sparkles size={24} className="text-violet-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-none">GeGe Studio.</h2>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">v1.2.0 • Prism Engine</p>
              <p className="text-xs text-gray-400 italic">"Gold, Gospel, GeGe - Scaling your imagination to reality."</p>
            </div>
          </div>

          {/* Right Content Side */}
          <div className="flex-1 p-8 md:p-10 space-y-8">
            <div className="flex justify-between items-start md:hidden">
               <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">Welcome to GeGe</h2>
               <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">Powering Your Creative DNA</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                GeGe Vision adalah ekosistem AI premium yang dirancang untuk mempercepat alur kerja kreatif Anda. Dari studio foto virtual hingga trading cerdas, semua ada di sini.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FeatureItem 
                icon={Zap} 
                title="AI Virtual Studio" 
                desc="Ganti wajah, outfit, dan background dengan presisi tinggi hanya dalam hitungan detik."
                color="bg-violet-600"
              />
              <FeatureItem 
                icon={Rocket} 
                title="Content Powerhouse" 
                desc="Hasilkan video sinematik (VEO3), desain infografis, dan script voice-over secara instan."
                color="bg-indigo-600"
              />
              <FeatureItem 
                icon={ShieldCheck} 
                title="Data Sovereignty" 
                desc="Privasi prioritas kami. Semua hasil diproses secara ephemeral dan disimpan secara lokal."
                color="bg-emerald-600"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
              <button 
                onClick={onClose}
                className="w-full sm:flex-1 py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-500/20 active:scale-95 group"
              >
                MULAI MISI <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest hidden sm:block">
                Press ESC to close
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
