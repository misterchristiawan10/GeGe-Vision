
import React, { useState } from 'react';
import { ShieldAlert, Handshake, CheckCircle2, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface CopyrightGuardProps {
  onComplete: () => void;
}

export const CopyrightGuard: React.FC<CopyrightGuardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    setIsExiting(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      {/* Backdrop with heavy blur */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>
      
      {/* Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border border-white/10 bg-white dark:bg-dark-card shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {step === 1 ? (
          /* STEP 1: WARNING */
          <div className="animate-fade-in-up p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-[30%] bg-red-500/10 flex items-center justify-center border border-red-500/20 relative group">
               <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse group-hover:bg-red-500/40 transition-colors"></div>
               <ShieldAlert size={48} className="text-red-500 relative z-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
                PERINGATAN KERAS!!
              </h1>
              <div className="h-1 w-20 bg-red-500 mx-auto rounded-full"></div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Tools ini dibangun dengan dedikasi tinggi untuk <span className="text-gray-900 dark:text-white font-bold">dipakai</span>, <span className="text-red-500 font-bold underline decoration-wavy">bukan untuk dicopas</span> atau dijual kembali seenaknya demi cuan tanpa izin.
            </p>

            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/30 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
               <h2 className="text-sm font-black text-red-600 dark:text-red-400 mb-2 flex items-center justify-center gap-2">
                  <AlertTriangle size={16} /> BERANI NYALIN TANPA IZIN?
               </h2>
               <p className="text-xs text-red-500/80 italic leading-relaxed">
                 "Semoga dompetmu sulit dibuka, hidupmu nge-lag parah, dan koneksi WiFi-mu putus tiap 5 menit pas lagi penting-pentingnya. 😏"
               </p>
            </div>

            <div className="space-y-4 text-xs text-gray-500 dark:text-gray-500 leading-relaxed font-medium">
               <p>Pokoknya, jangan ngaku-ngaku, jangan comot, dan jangan cari masalah.</p>
               <p className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-full inline-block">
                 Izin dulu kalau mau edit, yang punya nggak galak kok. Cuma butuh dihargai aja. 😏
               </p>
            </div>

            <button 
              onClick={handleFirstConfirm}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 group"
            >
              SIAP BOSS, SAYA PAHAM!
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          /* STEP 2: APPRECIATION */
          <div className="animate-fade-in-up p-8 md:p-12 text-center space-y-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
               <Handshake size={48} className="text-emerald-500 relative z-10" />
               <div className="absolute -top-1 -right-1 bg-white dark:bg-dark-card rounded-full p-1 border border-emerald-500">
                  <CheckCircle2 size={16} className="text-emerald-500" />
               </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                Mantap Jiwa!
              </h1>
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                Terima kasih telah menghargai karya ini.
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Kamu adalah <span className="px-2 py-0.5 bg-violet-500 text-white font-bold rounded">pengguna berkelas</span> yang mengerti nilai sebuah inovasi.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selamat berkarya, nikmati fitur premium kami, dan biarkan imajinasimu terbang tanpa batas!
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleFinalConfirm}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <Zap size={20} fill="currentColor" />
                GAS MASUK APLIKASI
              </button>
            </div>

            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
              GeGe Vision v1.2.0 • Secured Access
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
