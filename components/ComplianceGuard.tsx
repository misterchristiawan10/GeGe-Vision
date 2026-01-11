import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, Zap, CheckCircle2, ArrowRight, ScrollText, Globe } from 'lucide-react';

interface ComplianceGuardProps {
  onAccept: () => void;
}

export const ComplianceGuard: React.FC<ComplianceGuardProps> = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      setIsExiting(true);
      setTimeout(onAccept, 500);
    }
  };

  return (
    <div className={`fixed inset-0 z-[11000] flex items-center justify-center p-4 md:p-6 transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-fade-in-up">
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 w-full"></div>
        
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 border border-violet-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Digital Sovereignty</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Protokol Keamanan GeGe Vision v1.2</p>
            </div>
          </div>

          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <section className="space-y-2">
                <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" /> 01. Ephemeral Data Policy
                </h4>
                <p className="text-xs">
                  Kami mengadopsi prinsip <b>"Zero-Stay"</b>. Setiap piksel gambar yang Anda proses hanya numpang lewat di engine AI kami. GeGe Vision tidak menyimpan salinan permanen aset mentah Anda di cloud kami. Sesi berakhir = Data lenyap dari RAM server.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock size={14} className="text-indigo-500" /> 02. Local-First Storage
                </h4>
                <p className="text-xs">
                  Riwayat kreasi Anda disimpan secara eksklusif menggunakan teknologi <b>IndexedDB</b> di browser Anda. Kami tidak memiliki akses ke "Vault" lokal Anda. Privasi Anda adalah kedaulatan Anda sepenuhnya.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" /> 03. ethical AI Usage
                </h4>
                <p className="text-xs">
                  Anda setuju untuk tidak menggunakan GeGe Vision untuk membuat konten yang melanggar hukum, deepfake berbahaya, atau materi eksplisit tanpa izin. GeGe Vision adalah alat untuk akselerasi kreatif, bukan eksploitasi digital.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={14} className="text-rose-500" /> 04. No-Tracking Commitment
                </h4>
                <p className="text-xs">
                  Kami membenci iklan yang membuntuti Anda. Tidak ada tracker pihak ketiga, tidak ada penjualan data ke broker. Kami membiayai ekosistem ini melalui inovasi, bukan dengan menjual privasi Anda.
                </p>
              </section>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 dark:border-white/10 bg-transparent transition-all checked:border-violet-600 checked:bg-violet-600"
                />
                <CheckCircle2 className="pointer-events-none absolute left-1 top-1 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-violet-500 transition-colors">
                  Saya memahami dan menyetujui seluruh Protokol Privasi & Etika Digital GeGe Vision.
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Gold Quality • Gospel Integrity • GeGe Performance</p>
              </div>
            </label>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={!agreed}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
              agreed 
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            AKTIVASI EKOSISTEM <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};