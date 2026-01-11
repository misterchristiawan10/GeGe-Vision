
import React, { useState, useRef, useEffect } from 'react';
import { AudioWaveform, Play, Download, Trash2, Sparkles, Wand2, AudioLines, Loader2, Music, StopCircle, RotateCcw, RotateCw } from 'lucide-react';
import { generateSpeech, generateScript } from '../../services/geminiService';

const VOICES = [
  // Laki-laki
  { id: 'puck', name: 'Puck', gender: 'Male', desc: 'Tenang & Santai. Cocok untuk narasi cerita atau podcast.' },
  { id: 'charon', name: 'Charon', gender: 'Male', desc: 'Berat & Berwibawa. Cocok untuk dokumenter atau trailer film.' },
  { id: 'fenrir', name: 'Fenrir', gender: 'Male', desc: 'Energik & Intens. Cocok untuk iklan promo atau konten hype.' },
  { id: 'alnilam', name: 'Alnilam', gender: 'Male', desc: 'Narator Epik. Suara dalam dan megah untuk cerita fantasi.' },
  { id: 'sadaltager', name: 'Sadaltager', gender: 'Male', desc: 'Penyiar Ceria. Suara cerah dan ramah untuk pengumuman.' },
  { id: 'orus', name: 'Orus', gender: 'Male', desc: 'Suara narator yang dalam dan beresonansi, ideal untuk trailer epik.' },
  { id: 'achernar', name: 'Achernar', gender: 'Male', desc: 'Suara pria muda yang antusias, cocok untuk iklan produk modern.' },
  { id: 'gacrux', name: 'Gacrux', gender: 'Male', desc: 'Sangat dalam & berwibawa. Untuk pengumuman resmi atau narasi epik.' },
  { id: 'achird', name: 'Achird', gender: 'Male', desc: 'Ringan & bijaksana. Cocok untuk konten filosofis atau audiobook.' },
  { id: 'algenib', name: 'Algenib', gender: 'Male', desc: 'Serak & kuat. Ideal untuk iklan industri atau otomotif.' },
  { id: 'enceladus', name: 'Enceladus', gender: 'Male', desc: 'Jernih & Dingin. Cocok untuk konten sains atau tech.' },

  // Perempuan
  { id: 'kore', name: 'Kore', gender: 'Female', desc: 'Lembut & Menenangkan. Cocok untuk meditasi atau puisi.' },
  { id: 'zephyr', name: 'Zephyr', gender: 'Female', desc: 'Profesional & Jelas. Suara standar penyiar berita.' },
  { id: 'schedar', name: 'Schedar', gender: 'Female', desc: 'Dewasa & Elegan. Suara matang dan berkelas untuk konten mewah.' },
  { id: 'despina', name: 'Despina', gender: 'Female', desc: 'Misterius & Berbisik. Cocok untuk cerita horor atau ASMR.' },
  { id: 'autonoe', name: 'Autonoe', gender: 'Female', desc: 'Muda & Enerjik. Suara khas vlogger atau konten anak muda.' },
  { id: 'callirrhoe', name: 'Callirrhoe', gender: 'Female', desc: 'Suara yang menenangkan dan hampir berbisik, sempurna untuk audiobook atau relaksasi.' },
  { id: 'aoede', name: 'Aoede', gender: 'Female', desc: 'Suara yang ceria dan jernih, bagus untuk tutorial atau konten anak-anak.' },
  { id: 'pulcherrima', name: 'Ibu Pertiwi', gender: 'Female', desc: 'Hangat & keibuan. Terpercaya untuk video penjelasan atau narasi perusahaan.' },
  { id: 'vindemiatrix', name: 'Vindemiatrix', gender: 'Female', desc: 'Cerah & cepat. Untuk konten media sosial yang energik.' },
  { id: 'laomedeia', name: 'Laomedeia', gender: 'Female', desc: 'Ceria & unik. Cocok untuk karakter animasi atau tutorial yang menyenangkan.' },
];

interface GeneratedAudio {
  id: number;
  dataUrl: string; // Persistent dataUrl for storage
  text: string;
  voice: string;
  timestamp: string;
}

interface SettingsState {
    script: string;
    selectedVoice: string;
    emotion: string;
}

interface VoiceOverProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const VoiceOverStudioModule: React.FC<VoiceOverProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    script: '',
    selectedVoice: VOICES[11].id, // Default Kore (index 11)
    emotion: '',
  });

  const { script, selectedVoice, emotion } = settings;
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [audioList, setAudioList] = useState<GeneratedAudio[]>([]);

  // Preview State
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  
  // Settings History
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    if (JSON.stringify(updated) !== JSON.stringify(history[historyIndex])) {
        const newHistory = [...history.slice(0, historyIndex + 1), updated];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setSettingsState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setSettingsState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };
  
  // Load initial state
  useEffect(() => {
    if (initialState) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            setSettingsState(initialState.history[newIndex]);
        } else if (initialState.settings) { // Legacy support
            const loaded = { ...settings, ...initialState.settings };
            setSettingsState(loaded);
            setHistory([loaded]);
            setHistoryIndex(0);
        }
        setAudioList(initialState.audioList || []);
    } else if (historyIndex === -1) {
        setHistory([settings]);
        setHistoryIndex(0);
    }
  }, [initialState]);

  // Save state on change
  useEffect(() => {
    if (historyIndex !== -1) {
      onStateChange?.({
          history,
          historyIndex,
          audioList,
      });
    }
  }, [history, historyIndex, audioList]);

  const handlePreview = async (voiceId: string) => {
    // If the clicked preview is already playing, stop it.
    if (audioRef.current && playingPreviewId === voiceId) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlayingPreviewId(null);
        return;
    }
    
    // Stop any other currently playing audio
    if (audioRef.current) {
        audioRef.current.pause();
    }

    setPlayingPreviewId(null);
    setPreviewLoadingId(voiceId);

    try {
        const previewText = "Selamat datang di GeGe Vision, Gold, Gospel, GeGe.";
        const url = await generateSpeech(previewText, voiceId);
        
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.play();
        setPlayingPreviewId(voiceId);

        audio.onended = () => {
            setPlayingPreviewId(null);
            audioRef.current = null;
        };
        audio.onpause = () => { // Handle manual stop/pause
            setPlayingPreviewId(null);
        };
        
    } catch (e) {
        console.error("Preview failed", e);
        alert("Gagal memutar pratinjau.");
    } finally {
        setPreviewLoadingId(null);
    }
  };

  const handleAutoScript = async () => {
    setIsGeneratingScript(true);
    try {
      const topic = script.length > 5 ? script : "Promosi Produk Teknologi Canggih";
      const generated = await generateScript(topic);
      updateSettings({ script: generated });
    } catch (error) {
      console.error(error);
      alert("Gagal membuat naskah otomatis.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!script.trim()) {
      alert("Mohon isi naskah terlebih dahulu.");
      return;
    }

    setIsGeneratingAudio(true);
    try {
      // 1. Generate speech, which returns a temporary blob URL
      const tempAudioUrl = await generateSpeech(script, selectedVoice, emotion);
      
      // 2. Fetch the blob from the temporary URL
      const response = await fetch(tempAudioUrl);
      const blob = await response.blob();

      // 3. Convert blob to a persistent Base64 Data URL for storage
      const dataUrl = await blobToDataUrl(blob);

      // 4. Clean up the temporary blob URL to free memory
      URL.revokeObjectURL(tempAudioUrl);

      const voiceName = VOICES.find(v => v.id === selectedVoice)?.name || selectedVoice;
      const genderLabel = VOICES.find(v => v.id === selectedVoice)?.gender === 'Male' ? 'Laki-laki' : 'Perempuan';

      const newAudio: GeneratedAudio = {
        id: Date.now(),
        dataUrl: dataUrl,
        text: script.length > 50 ? script.substring(0, 50) + "..." : script,
        voice: `${voiceName} (${genderLabel})`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setAudioList(prev => [newAudio, ...prev]);
    } catch (error: any) {
      console.error(error);
      alert("Gagal membuat audio: " + error.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDeleteAudio = (id: number) => {
    setAudioList(prev => prev.filter(a => a.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Hapus semua riwayat rekaman?")) {
      setAudioList([]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AudioWaveform className="text-teal-500" size={32} /> GeGe Voice Pro Unlimited
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Butuh pengisi suara profesional? GeGe Voice siap membacakannya dengan kualitas studio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* INPUT SECTION */}
        <div className="bg-slate-900 dark:bg-dark-card rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none"></div>

           <div className="relative z-10 space-y-8">

              <div className="space-y-2">
                <label className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                   <AudioLines size={14} /> Naskah & Emosi
                </label>
                <textarea 
                  value={script}
                  onChange={(e) => updateSettings({ script: e.target.value })}
                  placeholder="Tulis naskah di sini..."
                  className="w-full h-32 bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none transition-all"
                />
                <div className="flex justify-between items-center gap-4">
                   <input 
                      type="text" 
                      value={emotion}
                      onChange={(e) => updateSettings({ emotion: e.target.value })}
                      placeholder="Gaya / Emosi (Contoh: Berbisik, Marah...)"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500 placeholder-slate-500"
                    />
                   <button 
                     onClick={handleAutoScript}
                     disabled={isGeneratingScript}
                     className="text-xs flex items-center gap-1 text-teal-400 hover:text-teal-300 disabled:opacity-50 transition-colors border border-teal-500/30 px-3 py-1.5 rounded-full hover:bg-teal-500/10"
                   >
                      {isGeneratingScript ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isGeneratingScript ? 'Menulis...' : 'Tuliskan Naskah Otomatis'}
                   </button>
                </div>
              </div>
              
              {/* Voice Selection */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-teal-400 uppercase tracking-wider">Pilih Karakter Suara</label>
                 
                 {/* Suara Pria */}
                 <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300">Suara Pria</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                       {VOICES.filter(v => v.gender === 'Male').map(voice => (
                         <div 
                           key={voice.id}
                           onClick={() => updateSettings({ selectedVoice: voice.id })}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                             selectedVoice === voice.id 
                               ? 'border-teal-500 bg-teal-900/30 shadow-lg' 
                               : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                           }`}
                         >
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-sm text-white">{voice.name}</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handlePreview(voice.id); }}
                                 className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 hover:bg-teal-600 text-white transition-colors"
                               >
                                 {previewLoadingId === voice.id ? <Loader2 size={14} className="animate-spin" /> : 
                                  playingPreviewId === voice.id ? <StopCircle size={14} /> : 
                                  <Play size={14} className="ml-0.5" />}
                               </button>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">{voice.desc}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Suara Wanita */}
                 <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300">Suara Wanita</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                       {VOICES.filter(v => v.gender === 'Female').map(voice => (
                         <div 
                           key={voice.id}
                           onClick={() => updateSettings({ selectedVoice: voice.id })}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                             selectedVoice === voice.id 
                               ? 'border-teal-500 bg-teal-900/30 shadow-lg' 
                               : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                           }`}
                         >
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-sm text-white">{voice.name}</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handlePreview(voice.id); }}
                                 className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 hover:bg-teal-600 text-white transition-colors"
                               >
                                 {previewLoadingId === voice.id ? <Loader2 size={14} className="animate-spin" /> : 
                                  playingPreviewId === voice.id ? <StopCircle size={14} /> : 
                                  <Play size={14} className="ml-0.5" />}
                               </button>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">{voice.desc}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-3 items-center pt-4">
                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white bg-slate-700 rounded-lg"><RotateCcw size={16}/></button>
                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white bg-slate-700 rounded-lg"><RotateCw size={16}/></button>
                <button 
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio || !script.trim()}
                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/50 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingAudio ? <Loader2 className="animate-spin" size={18} /> : <Wand2 />}
                    <span>{isGeneratingAudio ? 'Sedang Memproses Suara...' : 'GENERATE AUDIO'}</span>
                </button>
              </div>

           </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="bg-slate-900/50 dark:bg-dark-card/50 rounded-2xl border border-slate-700/50 p-6 min-h-[200px]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Music size={20} className="text-teal-500" /> Riwayat Rekaman
              </h3>
              {audioList.length > 0 && (
                 <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300">Hapus Semua</button>
              )}
           </div>

           <div className="space-y-4">
              {audioList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-10 text-slate-500 opacity-60">
                    <AudioLines size={48} className="mb-2" />
                    <p className="text-sm">Belum ada rekaman.</p>
                 </div>
              ) : (
                 audioList.map((audio) => (
                    <div key={audio.id} className="bg-slate-800 dark:bg-gray-800 border border-slate-700 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 animate-fade-in-up">
                       <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-400">
                          <Play size={18} fill="currentColor" />
                       </div>
                       
                       <div className="flex-1 min-w-0 w-full text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-2 mb-1">
                             <span className="text-sm font-bold text-white">{audio.voice}</span>
                             <span className="text-[10px] text-slate-400">{audio.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{audio.text}</p>
                       </div>

                       <div className="w-full md:w-auto flex items-center gap-3">
                          <audio controls src={audio.dataUrl} className="h-8 w-full md:w-48 rounded-lg" />
                          
                          <a 
                            href={audio.dataUrl} 
                            download={`voiceover-${audio.id}.wav`}
                            className="p-2 text-slate-400 hover:text-teal-400 transition-colors"
                            title="Unduh"
                          >
                             <Download size={18} />
                          </a>
                          
                          <button 
                            onClick={() => handleDeleteAudio(audio.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Hapus"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
