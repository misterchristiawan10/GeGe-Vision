
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, Info, Key, CheckCircle, RefreshCw, LogOut, Check } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSave: (keys: string[]) => void;
  initialKeys: string[];
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose, onLogout, onSave, initialKeys }) => {
  const [keys, setKeys] = useState<string[]>(['', '', '']);
  const [activeToggles, setActiveToggles] = useState<boolean[]>([true, false, false]);
  const [isValidating, setIsValidating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (initialKeys && initialKeys.length > 0) {
      const newKeys = [...keys];
      const newToggles = [...activeToggles];
      initialKeys.forEach((k, i) => {
        if (i < 3) {
            newKeys[i] = k;
            newToggles[i] = k !== '';
        }
      });
      setKeys(newKeys);
      setActiveToggles(newToggles);
    }
  }, [initialKeys]);

  if (!isOpen) return null;

  const handleToggle = (index: number) => {
    const newToggles = [...activeToggles];
    newToggles[index] = !newToggles[index];
    setActiveToggles(newToggles);
    if (!newToggles[index]) {
        const newKeys = [...keys];
        newKeys[index] = '';
        setKeys(newKeys);
    }
  };

  const handleKeyChange = (index: number, val: string) => {
    const newKeys = [...keys];
    newKeys[index] = val;
    setKeys(newKeys);
    if (val.trim() !== '') {
        const newToggles = [...activeToggles];
        newToggles[index] = true;
        setActiveToggles(newToggles);
    }
  };

  const handleSave = () => {
    onSave(keys.filter((_, i) => activeToggles[i]));
    setShowSaved(true);
    setTimeout(() => {
        setShowSaved(false);
        onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 animate-fade-in backdrop-blur-sm bg-black/60">
      <div className="relative w-full max-w-lg bg-slate-950 border border-violet-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col">
        {/* Decorative Light Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center border border-violet-500/20">
               <ShieldCheck className="text-violet-500" size={24} />
            </div>
            <div>
               <h2 className="text-lg font-black text-white tracking-widest uppercase italic">PENGATURAN API</h2>
               <p className="text-[9px] text-violet-400 font-bold tracking-[0.2em] uppercase">Multi-Key Vault v1.2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
           <div className="p-4 bg-violet-900/10 border border-violet-500/20 rounded-2xl flex gap-3">
              <Info size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-violet-300 leading-relaxed uppercase font-bold tracking-wider">
                Gunakan hingga 3 API Key gratis. Jika kuota satu kunci habis, sistem akan otomatis berpindah ke kunci berikutnya untuk kelancaran kreasi Anda.
              </p>
           </div>

           <div className="space-y-4">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className={`p-5 rounded-2xl border transition-all ${activeToggles[idx] ? 'bg-slate-900 border-violet-500/30' : 'bg-slate-950 border-white/5 opacity-60'}`}>
                   <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Key size={14} className={activeToggles[idx] ? 'text-violet-500' : 'text-gray-600'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeToggles[idx] ? 'text-white' : 'text-gray-500'}`}>
                           API Gemini #{idx + 1} {idx === 0 ? '(Bawaan)' : ''}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleToggle(idx)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${activeToggles[idx] ? 'bg-violet-600' : 'bg-slate-800'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${activeToggles[idx] ? 'translate-x-5' : ''}`}></div>
                      </button>
                   </div>
                   <div className="relative group">
                      <input 
                        type="password"
                        value={keys[idx]}
                        disabled={!activeToggles[idx]}
                        onChange={(e) => handleKeyChange(idx, e.target.value)}
                        placeholder={activeToggles[idx] ? "Masukkan Kunci API Gemini Anda..." : "Kunci Dinonaktifkan"}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-mono text-violet-400 focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-gray-700"
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-slate-900/30">
           <button 
             onClick={onLogout}
             className="px-4 py-2 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500/10 transition-all"
           >
              LOGOUT
           </button>
           
           <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white"
              >
                BATAL
              </button>
              <button 
                onClick={handleSave}
                disabled={showSaved}
                className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest px-8 py-2 rounded-lg shadow-lg shadow-violet-600/20 flex items-center gap-2 min-w-[120px] justify-center transition-all active:scale-95"
              >
                {showSaved ? <><Check size={14}/> TERSIMPAN</> : 'SIMPAN'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
