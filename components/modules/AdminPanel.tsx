
import React, { useState, useEffect } from 'react';
import { fetchWhitelistFromCloud } from '../../services/backendService';
import { Users, ShieldCheck, Search, Loader2, Info, ExternalLink, RefreshCw } from 'lucide-react';

export const AdminPanelModule: React.FC = () => {
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWhitelistFromCloud();
      setWhitelist(data);
    } catch (e) {
      console.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredList = whitelist.filter(email => 
    email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">CLOUD MONITOR</h2>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Database Aktivasi Terpusat (Read-Only Mode)</p>
          </div>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Box */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase mb-3">
              <Info size={16} /> Keamanan Aktif
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Demi keamanan, penambahan atau penghapusan user hanya dapat dilakukan melalui <b>Supabase Dashboard</b> resmi. Panel ini berfungsi sebagai monitor real-time.
            </p>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-[10px] font-black bg-amber-600 text-white px-4 py-2 rounded-full w-fit hover:bg-amber-500 transition-colors"
            >
              KE DASHBOARD <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/20 p-6 rounded-[2rem] border border-violet-100 dark:border-violet-900/30">
             <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{isLoading ? '...' : whitelist.length}</div>
             <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1">Total User Aktif</div>
          </div>
        </div>

        {/* List User */}
        <div className="md:col-span-2 bg-white dark:bg-dark-card p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-[500px]">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari email user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm dark:text-white focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi...</span>
              </div>
            ) : filteredList.length > 0 ? (
              filteredList.map(email => (
                <div key={email} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-violet-500/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <Users size={14} />
                    </div>
                    <span className="text-sm font-medium dark:text-gray-200">{email}</span>
                  </div>
                  <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    Authorized
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-xs italic">Email tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
