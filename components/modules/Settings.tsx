
import React, { useState, useEffect } from 'react';
import { getDrafts, deleteDraft, downloadDraftAsText, clearAllDrafts } from '../../services/draftService';
import { Draft, UserApiKey, ModuleId } from '../../types';
import { 
  Settings as SettingsIcon, Shield, AlertTriangle, Search, ChevronRight, 
  Mail, Send, CheckCircle, Cpu, Database, Activity, Globe, Trash2, 
  Download, Sparkles, RefreshCw, Zap, Clock, Info, ExternalLink,
  BookOpen, HelpCircle
} from 'lucide-react';
import { setGlobalApiKeys } from '../../services/geminiService';

type SubModule = 'BANTUAN' | 'KRITIK' | 'TENTANG' | 'DRAFT' | 'API';

interface SettingsProps {
  onNavigate: (id: ModuleId) => void;
}

interface GuideItem {
  id: ModuleId;
  icon: string;
  title: string;
  desc: string;
}

const GUIDES: GuideItem[] = [
  { id: 'virtual-photoshoot', icon: "🎨", title: "Smart Studio", desc: "Panduan cara ganti outfit dan latar belakang secara presisi." },
  { id: 'vidgen', icon: "🎬", title: "VidGen VEO3", desc: "Pelajari cara menulis prompt video sinematik dengan Google VEO." },
  { id: 'infografis', icon: "📊", title: "Infografis AI", desc: "Cara mengubah data mentah menjadi visual yang menarik." },
  { id: 'voice-over', icon: "🎙️", title: "Voice Over Pro", desc: "Tips memilih karakter suara yang sesuai dengan emosi konten." },
  { id: 'world-tour', icon: "🌍", title: "World Tour", desc: "Keliling dunia secara virtual dengan landmark ikonik." },
  { id: 'rebel-fx', icon: "📈", title: "AI Trading", desc: "Gunakan Astra AI untuk menganalisa chart forex dan crypto." },
  { id: 'smart-panda-studio', icon: "🏛️", title: "Nusantara Studio", desc: "Eksplorasi pakaian adat Indonesia dengan akurasi tinggi." },
  { id: 'prewed-virtual', icon: "💍", title: "Prewedding", desc: "Wujudkan foto prewedding impian tanpa biaya mahal." }
];

export const SettingsModule: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<SubModule>('API');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Key State
  const [useDefaultKey, setUseDefaultKey] = useState<boolean>(true);
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([
    { id: '1', label: 'API Gemini #1', key: '', isActive: true },
    { id: '2', label: 'API Gemini #2', key: '', isActive: false },
    { id: '3', label: 'API Gemini #3', key: '', isActive: false },
  ]);
  const [keyErrors, setKeyErrors] = useState<Record<string, string>>({});
  const [globalConfigError, setGlobalConfigError] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // System Status State
  const [major] = useState(1);
  const [minor] = useState(2);
  const [patch] = useState(0);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');

  useEffect(() => {
    if (activeTab === 'DRAFT') {
      setDrafts(getDrafts());
    }
    
    if (activeTab === 'API' || activeTab === 'TENTANG') {
      loadApiSettings();
    }

    if (activeTab === 'TENTANG') {
        calculateStorage();
    }
  }, [activeTab]);

  const calculateStorage = () => {
      try {
          const size = new Blob([JSON.stringify(localStorage)]).size;
          setStorageUsage((size / 1024).toFixed(2) + ' KB');
      } catch (e) {
          setStorageUsage('Unknown');
      }
  };

  const loadApiSettings = () => {
      const storedSettings = localStorage.getItem('gege_api_vault');
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings);
          if (parsed.keys) {
            const mappedKeys = apiKeys.map((k, i) => ({
                ...k,
                key: parsed.keys[i] || '',
                isActive: parsed.activeToggles[i] || false
            }));
            setApiKeys(mappedKeys);
          }
          if (parsed.useSystemKey !== undefined) setUseDefaultKey(parsed.useSystemKey);
        } catch (e) { console.error(e); }
      }
  };

  const handleSaveApiKeys = () => {
    const errors: Record<string, string> = {};
    setGlobalConfigError(null);
    let isValid = true;

    apiKeys.forEach(k => {
        const cleanKey = k.key.trim();
        if (k.isActive && cleanKey.length === 0) {
            errors[k.id] = "API Key tidak boleh kosong jika aktif.";
            isValid = false;
        } else if (cleanKey.length > 0 && cleanKey.length < 30) {
            errors[k.id] = "Format Kunci tidak valid (Terlalu pendek).";
            isValid = false;
        }
    });

    setKeyErrors(errors);

    const hasValidActiveUserKey = apiKeys.some(k => k.isActive && k.key.trim().length >= 30);
    
    if (!useDefaultKey && !hasValidActiveUserKey) {
        setGlobalConfigError("Opsi sistem mati dan tidak ada kunci pribadi yang aktif!");
        isValid = false;
    }

    if (!isValid) return;

    try {
        const settingsToSave = {
            keys: apiKeys.map(k => k.key),
            activeToggles: apiKeys.map(k => k.isActive),
            useSystemKey: useDefaultKey
        };
        localStorage.setItem('gege_api_vault', JSON.stringify(settingsToSave));
        
        const validUserKeys = apiKeys.filter(k => k.isActive && k.key.trim().length >= 30).map(k => k.key);
        setGlobalApiKeys(validUserKeys);

        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (e) {
        alert("Gagal menyimpan pengaturan.");
    }
  };

  const handleKeyChange = (id: string, value: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, key: value } : k));
    if (keyErrors[id]) {
        setKeyErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    }
    if (globalConfigError) setGlobalConfigError(null);
  };

  const handleKeyToggle = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
    if (globalConfigError) setGlobalConfigError(null);
  };

  const toggleDefaultKey = () => {
      setUseDefaultKey(!useDefaultKey);
      if (globalConfigError) setGlobalConfigError(null);
  };

  const handleDeleteDraft = (id: string) => {
    if (confirm("Hapus draf ini selamanya?")) {
      setDrafts(deleteDraft(id));
    }
  };

  const handleClearAllDrafts = () => {
    if (confirm("Hapus semua draf? Tindakan ini tidak bisa dibatalkan.")) {
      clearAllDrafts();
      setDrafts([]);
    }
  };

  const simulateUpdate = () => {
    setCheckingUpdate(true);
    setTimeout(() => {
      setCheckingUpdate(false);
      alert("Sistem sudah menggunakan versi terbaru (v1.2.0-PRISM).");
    }, 1500);
  };

  const filteredGuides = GUIDES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'API':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="border-b border-gray-100 dark:border-white/5 pb-6">
               <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase italic tracking-tight">
                 <Shield className="text-violet-500" size={24} /> API Vault Management
               </h3>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Konfigurasi Jantung Kecerdasan Buatan GeGe</p>
             </div>

             <div className="space-y-6">
                {globalConfigError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-3 animate-shake">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">{globalConfigError}</p>
                    </div>
                )}

                <div className={`p-6 bg-gray-50 dark:bg-slate-900 border rounded-3xl flex items-center justify-between group transition-all ${useDefaultKey ? 'border-violet-500/30 shadow-lg shadow-violet-500/5' : 'border-gray-100 dark:border-white/5 opacity-70'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${useDefaultKey ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                         <Cpu size={24} />
                      </div>
                      <div>
                         <h4 className={`font-black uppercase tracking-tight text-sm ${useDefaultKey ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Kunci Sistem GeGe</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shared Global Quota (Default)</p>
                      </div>
                   </div>
                   <button 
                     onClick={toggleDefaultKey}
                     className={`w-14 h-7 rounded-full relative transition-colors ${useDefaultKey ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                   >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${useDefaultKey ? 'translate-x-7' : ''}`}></div>
                   </button>
                </div>

                <div className="flex items-center gap-2 px-2">
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5"></div>
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Kunci Pribadi</span>
                   <div className="h-px flex-1 bg-gray-100 dark:bg-white/5"></div>
                </div>

                {apiKeys.map((item) => (
                   <div key={item.id} className={`p-6 bg-white dark:bg-dark-card border rounded-3xl transition-all ${keyErrors[item.id] ? 'border-red-500 shadow-lg shadow-red-500/5' : item.isActive ? 'border-violet-500/20' : 'border-gray-100 dark:border-white/5 opacity-60'}`}>
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.isActive ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                               <Zap size={16} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${keyErrors[item.id] ? 'text-red-500' : 'text-gray-500'}`}>{item.label}</span>
                         </div>
                         <button 
                           onClick={() => handleKeyToggle(item.id)}
                           className={`w-10 h-5 rounded-full relative transition-colors ${item.isActive ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                         >
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${item.isActive ? 'translate-x-5' : ''}`}></div>
                         </button>
                      </div>
                      
                      <div className="relative">
                         <input 
                            type="password"
                            value={item.key}
                            disabled={!item.isActive}
                            onChange={(e) => handleKeyChange(item.id, e.target.value)}
                            placeholder="Masukkan Kunci API Gemini..."
                            className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl px-4 py-3 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none transition-all font-mono ${keyErrors[item.id] ? 'border-red-500' : 'border-gray-200 dark:border-white/5 focus:border-violet-500'}`}
                         />
                         {keyErrors[item.id] && (
                            <p className="text-[9px] text-red-500 mt-2 font-bold flex items-center gap-1">
                                <AlertTriangle size={10} /> {keyErrors[item.id]}
                            </p>
                         )}
                      </div>
                   </div>
                ))}

                <button 
                  onClick={handleSaveApiKeys}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                   {showSaveSuccess ? (
                      <>
                        <CheckCircle size={18} /> SETTINGS SAVED
                      </>
                   ) : "SIMPAN PERUBAHAN"}
                </button>
             </div>
          </div>
        );
      case 'DRAFT':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight flex items-center gap-2">
                     <Database className="text-violet-500" size={24} /> Draft Repository
                   </h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Simpan Prompt & Ide Konten Berharga Anda</p>
                </div>
                {drafts.length > 0 && (
                <button 
                  onClick={handleClearAllDrafts}
                  className="text-[9px] font-black bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30 uppercase tracking-tighter"
                >
                  DELETE ALL
                </button>
              )}
             </div>

            {drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[30%] flex items-center justify-center mb-4 border border-dashed border-gray-300">
                   <Database size={40} className="text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Belum ada draf yang disimpan</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {drafts.map((draft) => (
                  <div key={draft.id} className="group relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-3xl hover:border-violet-500/30 transition-all hover:shadow-xl shadow-violet-500/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-violet-600 text-white">
                             {draft.module}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                             <Clock size={10} /> {new Date(draft.timestamp).toLocaleDateString()}
                           </span>
                        </div>
                        <h4 className="font-black text-lg text-gray-900 dark:text-white truncate">{draft.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => downloadDraftAsText(draft)}
                          className="flex-1 md:flex-none p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-violet-500 rounded-2xl transition-all border border-transparent hover:border-violet-500/20"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="flex-1 md:flex-none p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'BANTUAN':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="relative rounded-[2.5rem] overflow-hidden p-10 bg-slate-900 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Pusat Bantuan GeGe</h3>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8 max-w-lg">Temukan modul dan akselerasi kreativitas Anda dengan akses cepat.</p>
                   
                   <div className="relative max-w-xl">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari solusi atau nama modul..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
                      />
                      <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                   </div>
                </div>
             </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    {searchQuery ? `Hasil Pencarian (${filteredGuides.length})` : 'Akses Cepat Modul'}
                  </h4>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-[9px] font-bold text-violet-500 hover:underline">Hapus Filter</button>
                  )}
               </div>
               
               {filteredGuides.length > 0 ? (
                 <div className="grid md:grid-cols-2 gap-4">
                    {filteredGuides.map((guide) => (
                      <GuideCard 
                        key={guide.id}
                        icon={guide.icon}
                        title={guide.title}
                        desc={guide.desc}
                        onClick={() => onNavigate(guide.id)}
                      />
                    ))}
                  </div>
               ) : (
                 <div className="py-20 text-center opacity-40">
                    <HelpCircle size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs font-bold uppercase text-gray-400">Pencarian "{searchQuery}" tidak ditemukan</p>
                 </div>
               )}
            </div>
          </div>
        );
      case 'KRITIK':
        return (
          <div className="h-full flex flex-col animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8 flex-1">
               <div className="space-y-6">
                  <div className="bg-white dark:bg-dark-card p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm h-full flex flex-col justify-center relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Mail size={150} />
                     </div>
                     <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-violet-600/20">
                        <Mail size={32} />
                     </div>
                     <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic mb-4">Sync Your Vision</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                        Punya saran fitur baru atau menemukan bug? Feedback Anda adalah bahan bakar inovasi kami selanjutnya.
                     </p>
                     
                     <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-between group hover:border-violet-500 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-black shadow-sm text-violet-600">@</div>
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Direct Contact</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">gegevisionteam@gmail.com</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-gray-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-gray-200 dark:border-white/5 flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase italic tracking-tight">
                     <Send className="text-violet-500" size={24} /> Kirim Masukan
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subjek Laporan</label>
                        <input type="text" className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-violet-500 transition-all" placeholder="Cth: Bug di Modul Traveling" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Pesan</label>
                        <textarea className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-violet-500 h-40 resize-none transition-all" placeholder="Jelaskan secara detail..." />
                     </div>
                  </div>

                  <button className="mt-8 w-full py-5 bg-violet-600 text-white font-black rounded-2xl shadow-xl shadow-violet-600/20 hover:bg-violet-500 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                     KIRIM SEKARANG <ChevronRight size={18} />
                  </button>
               </div>
            </div>
          </div>
        );
      case 'TENTANG':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-5/12 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/20 rounded-full blur-[60px] -mr-20 -mt-20"></div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <Activity className="text-violet-400" size={24} />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">System Health</span>
                      </div>
                      <div className="text-4xl font-black mb-2 tracking-tighter italic">OPTIMAL.</div>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed">GeGe Engine is running at peak performance. All neural nodes active.</p>
                   </div>
                   
                   <div className="relative z-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-6">
                      <div>
                         <p className="text-[9px] uppercase text-gray-500 font-black mb-1">API Latency</p>
                         <p className="text-xl font-mono font-black text-emerald-400">~45ms</p>
                      </div>
                      <div>
                         <p className="text-[9px] uppercase text-gray-500 font-black mb-1">Stability</p>
                         <p className="text-xl font-mono font-black text-violet-400">99.9%</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <SpecCard icon={<Cpu />} title="Core Engine" label="Version Build" val={`v${major}.${minor}.${patch}`} color="text-blue-500" />
                   <SpecCard icon={<Database />} title="Storage" label="Local Usage" val={storageUsage} color="text-purple-500" />
                   <SpecCard icon={<Globe />} title="Network" label="Architecture" val="Hybrid-Edge" color="text-orange-500" />
                   <SpecCard icon={<Shield />} title="Security" label="API Status" val={apiKeys.filter(k => k.isActive).length > 0 || useDefaultKey ? 'ACTIVE' : 'INACTIVE'} color="text-emerald-500" />
                </div>
             </div>

             <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={simulateUpdate}
                  disabled={checkingUpdate}
                  className="w-full py-5 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-xs font-black text-gray-500 dark:text-gray-400 hover:text-violet-500 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  {checkingUpdate ? (
                     <>
                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                       SCANNING REPOSITORY...
                     </>
                  ) : (
                     <>
                       <RefreshCw size={16} /> CHECK FOR ENGINE UPDATES
                     </>
                  )}
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32 flex flex-col h-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-[1.8rem] flex items-center justify-center shadow-2xl">
             <SettingsIcon className="w-10 h-10 text-white dark:text-black" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Control Center</h2>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] mt-1">Ecosystem Configuration v1.2</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100/50 dark:bg-black/40 p-1.5 rounded-[2rem] border border-gray-200 dark:border-white/5 backdrop-blur-xl overflow-x-auto max-w-full no-scrollbar">
          {['API', 'DRAFT', 'BANTUAN', 'KRITIK', 'TENTANG'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as SubModule)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black transition-all duration-500 tracking-widest whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white dark:bg-violet-600 text-black dark:text-white shadow-xl scale-105' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0c] rounded-[3.5rem] p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl flex-1 overflow-y-auto custom-scrollbar relative">
        {renderContent()}
      </div>
    </div>
  );
};

const SpecCard = ({ icon, title, label, val, color }: any) => (
  <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-violet-500/20 transition-all group">
    <div className="flex items-center gap-4 mb-4">
       <div className={`p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
       <h4 className="font-black uppercase tracking-tight text-xs text-gray-900 dark:text-white">{title}</h4>
    </div>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-mono font-black text-gray-800 dark:text-gray-100">{val}</p>
  </div>
);

const GuideCard = ({ title, desc, icon, onClick }: { title: string, desc: string, icon: string, onClick?: () => void }) => (
  <div onClick={onClick} className="group p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:border-violet-500/30 transition-all hover:shadow-2xl cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
    <div className="flex items-start gap-5 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-3xl group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-violet-500 transition-colors flex justify-between items-center uppercase italic tracking-tight">
            {title}
            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);
