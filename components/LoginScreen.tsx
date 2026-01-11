
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { checkWhitelistedEmail } from '../services/backendService';
import { Mail, ShieldCheck, ArrowRight, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<{msg: string, type: 'auth' | 'system' | null}>({msg: '', type: null});
  const [showEmailInput, setShowEmailInput] = useState(false);

  // EMAIL MASTER ADMIN YANG BISA LOGIN DI SEMUA APPS
  const MASTER_ADMIN_EMAIL = 'gegevisionteam@gmail.com';

  const handleLogin = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setError({msg: 'Silakan masukkan email Anda.', type: 'auth'});
      return;
    }

    setIsLoading(true);
    setError({msg: '', type: null});

    try {
      // 1. CEK MASTER ADMIN BYPASS
      // Jika email adalah master admin, langsung login sebagai admin tanpa cek database.
      if (cleanEmail === MASTER_ADMIN_EMAIL) {
          onLogin({
            name: 'GeGe Master Admin',
            email: cleanEmail,
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=admin-god-mode`,
            role: 'admin'
          });
          return;
      }

      // 2. CEK USER BIASA DI DATABASE WHITELIST
      const isWhitelisted = await checkWhitelistedEmail(cleanEmail);

      if (isWhitelisted) {
          onLogin({
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${cleanEmail}`,
            role: 'user'
          });
      } else {
          setError({
            msg: 'Akun Anda belum diaktivasi oleh Admin. Silakan hubungi tim kami untuk akses.',
            type: 'auth'
          });
      }
    } catch (e) {
      setError({
        msg: 'Gagal menghubungi server keamanan. Periksa koneksi internet Anda.',
        type: 'system'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-br from-indigo-950 via-violet-950 to-black p-8 text-center border-b border-white/5">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl border border-white/20">
              <Sparkles size={32} className="text-violet-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">GeGe Vision</h2>
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] mt-1">v1.2.0 • Pro Ecosystem</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selamat Datang</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Silakan aktivasi sesi Anda untuk memulai kreasi.</p>
            </div>

            {error.msg && (
              <div className={`p-4 rounded-2xl flex gap-3 items-start animate-shake ${error.type === 'system' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30' : 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30'}`}>
                {error.type === 'system' ? <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" /> : <ShieldCheck size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
                <p className={`text-xs font-medium leading-relaxed ${error.type === 'system' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{error.msg}</p>
              </div>
            )}

            <div className="space-y-4">
              {showEmailInput ? (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Aktivasi</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="user@example.com"
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-violet-50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-900/30 text-center space-y-4">
                   <p className="text-xs text-violet-700 dark:text-violet-300 font-medium italic">"Your creativity is restricted by your verification status."</p>
                </div>
              )}

              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>MEMVERIFIKASI...</span>
                  </>
                ) : (
                  <>
                    <span>{showEmailInput ? 'VERIFIKASI AKUN' : 'MULAI SESI'}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Portal GeGe Security v1.2.0</p>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] text-gray-400 uppercase font-black tracking-[0.3em]">
          Powered by GeGe Vision
        </p>
      </div>
    </div>
  );
};
