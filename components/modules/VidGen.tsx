import React, { useState, useEffect } from 'react';
import { generateVeoVideo, generateRandomPrompt } from '../../services/geminiService';
import { Loader2, Plus, Trash2, Sparkles, Video, Film, MessageSquare, Image as ImageIcon, History, X, Download, RotateCcw, RotateCw } from 'lucide-react';
import { ErrorPopup } from '../ErrorPopup';

const CATEGORIES = [
  'Cinematic', 'Animation', 'Drone Shot', 'Cyberpunk', 
  'Nature', 'Commercial', 'Fantasy', 'Horror', 'Documentary'
];

const RATIOS = [
  { id: '16:9', label: 'Landscape (16:9)' },
  { id: '9:16', label: 'Portrait (9:16)' }
];

interface DialogueLine {
  id: number;
  speaker: 'Orang 1' | 'Orang 2';
  text: string;
}

interface VideoHistoryItem {
    id: number;
    url: string;
    prompt: string;
}

interface SettingsState {
    prompt: string;
    category: string;
    aspectRatio: string;
    dialogues: DialogueLine[];
}

interface VidGenProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

export const VidGenModule: React.FC<VidGenProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    prompt: '',
    category: CATEGORIES[0],
    aspectRatio: '16:9',
    dialogues: [
        { id: 1, speaker: 'Orang 1', text: '' },
        { id: 2, speaker: 'Orang 2', text: '' }
    ]
  });
  
  const { prompt, category, aspectRatio, dialogues } = settings;

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Menunggu...');

  // History & Lightbox
  const [videoHistory, setVideoHistory] = useState<VideoHistoryItem[]>([]);
  const [viewVideo, setViewVideo] = useState<string | null>(null);

  // Settings History
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // --- Handlers ---
  const updateSettings = (newSettings: Partial<SettingsState>, recordHistory = true) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    if (recordHistory && JSON.stringify(updated) !== JSON.stringify(history[historyIndex])) {
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
        } else if (initialState.settings) { // Legacy
            const loaded = { ...settings, ...initialState.settings };
            setSettingsState(loaded);
            setHistory([loaded]);
            setHistoryIndex(0);
        }
        setResultVideo(initialState.resultVideo || null);
        setVideoHistory(initialState.videoHistory || []);
    } else {
        setHistory([settings]);
        setHistoryIndex(0);
    }
  }, [initialState]);

  // Save state on change
  useEffect(() => {
    onStateChange?.({
        history,
        historyIndex,
        resultVideo,
        videoHistory
    });
  }, [history, historyIndex, resultVideo, videoHistory]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddDialogue = () => {
    const nextId = dialogues.length > 0 ? Math.max(...dialogues.map(d => d.id)) + 1 : 1;
    const lastSpeaker = dialogues.length > 0 ? dialogues[dialogues.length - 1].speaker : 'Orang 2';
    const nextSpeaker = lastSpeaker === 'Orang 1' ? 'Orang 2' : 'Orang 1';
    
    updateSettings({ dialogues: [...dialogues, { id: nextId, speaker: nextSpeaker, text: '' }] });
  };

  const handleRemoveDialogue = (id: number) => {
    updateSettings({ dialogues: dialogues.filter(d => d.id !== id) });
  };

  const handleDialogueChange = (id: number, val: string) => {
    updateSettings({ dialogues: dialogues.map(d => d.id === id ? { ...d, text: val } : d) });
  };

  const handleGetIdea = async () => {
    try {
      const idea = await generateRandomPrompt();
      updateSettings({ prompt: idea });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !image) {
      setError("Mohon isi prompt atau unggah gambar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultVideo(null);
    setStatusMessage("Menghubungi Server Veo 3...");

    try {
      // Construct Prompt - More natural phrasing for Veo
      let fullPrompt = `Cinematic video (${category} style): ${prompt}.`;
      
      const dialogueText = dialogues
        .filter(d => d.text.trim() !== '')
        .map(d => `${d.speaker} says: "${d.text}"`)
        .join('. ');

      if (dialogueText) {
        fullPrompt += `\n\nCharacter Interaction/Dialogue: ${dialogueText}.`;
      }
      
      fullPrompt += "\nEnsure smooth motion, high resolution, and coherent visual storytelling.";

      setStatusMessage("Sedang merender video (VEO 3)... Mohon tunggu 1-2 menit.");
      
      const videoUrl = await generateVeoVideo(fullPrompt, aspectRatio, image);
      setResultVideo(videoUrl);
      
      // Add to History
      setVideoHistory(prev => [{
          id: Date.now(),
          url: videoUrl,
          prompt: prompt.substring(0, 50) + "..."
      }, ...prev]);

      setStatusMessage("Selesai!");

    } catch (err: any) {
      setError(err.message || "Gagal membuat video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Lightbox Video Player */}
      {viewVideo && (
        <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" 
            onClick={() => setViewVideo(null)}
        >
           {/* Close Button - Fixed to viewport */}
           <button 
                onClick={() => setViewVideo(null)} 
                className="fixed top-6 right-6 text-white hover:text-red-400 z-[210] p-3 bg-black/60 rounded-full border border-white/20 shadow-lg hover:bg-black/80 transition-all"
           >
              <X size={32}/>
           </button>
           
           <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <video src={viewVideo} controls autoPlay className="w-full max-h-[85vh] rounded-lg shadow-2xl" />
              <a href={viewVideo} download={`veo-video-${Date.now()}.mp4`} className="mt-4 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                 <Download size={20}/> Unduh Video
              </a>
           </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video className="w-8 h-8 text-emerald-500" /> Smart VidGen by VEO3
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Dari tulisan jadi video! Hidupkan imajinasimu jadi klip sinematik keren dengan kekuatan Google VEO 3.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          
          {/* Settings Row */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Rasio Video</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => updateSettings({ aspectRatio: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm dark:text-white outline-none"
                >
                  {RATIOS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Kategori</label>
                <select 
                  value={category}
                  onChange={(e) => updateSettings({ category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm dark:text-white outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
             <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
               <ImageIcon size={14}/> Upload Foto (Opsional - Image to Video)
             </label>
             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="vidgen-img-upload" 
                />
                <label htmlFor="vidgen-img-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                  {previewUrl ? (
                    <div className="relative h-40 w-full">
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white text-xs font-bold">Ganti Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-gray-400">
                      <span className="text-sm">Klik untuk upload gambar referensi</span>
                    </div>
                  )}
                </label>
             </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-xs font-semibold text-gray-500 uppercase">Prompt Video</label>
              <div className="flex gap-2">
                 <button 
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                 >
                    <RotateCcw size={14}/>
                 </button>
                 <button 
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                 >
                    <RotateCw size={14}/>
                 </button>
                 <button 
                    onClick={handleGetIdea}
                    className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline ml-2"
                 >
                    <Sparkles size={12} /> Berikan saya ide
                 </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => updateSettings({ prompt: e.target.value })}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white min-h-[100px]"
              placeholder="Deskripsikan video yang ingin Anda buat..."
            />
          </div>

          {/* Dialogue Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 mb-2">
               <MessageSquare size={16} className="text-primary-500"/>
               <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Skenario Dialog</h3>
             </div>
             
             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
               {dialogues.map((d) => (
                 <div key={d.id} className="flex gap-2 items-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded w-20 text-center ${d.speaker === 'Orang 1' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {d.speaker}
                    </span>
                    <input 
                      type="text"
                      value={d.text}
                      onChange={(e) => handleDialogueChange(d.id, e.target.value)}
                      placeholder={`Dialog ${d.speaker}...`}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm dark:text-white outline-none focus:border-primary-500"
                    />
                    <button 
                      onClick={() => handleRemoveDialogue(d.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
             
             <button 
               onClick={handleAddDialogue}
               className="w-full py-2 border border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center gap-1"
             >
               <Plus size={16} /> Tambah Baris Dialog
             </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-wait' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
            <span>{isLoading ? 'Sedang Memproses...' : 'Generate Video (VEO3)'}</span>
          </button>
          
          {error && (
            <ErrorPopup 
              message={error} 
              onClose={() => setError(null)} 
              onRetry={handleGenerate} 
            />
          )}
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col gap-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 min-h-[400px] border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
            {isLoading ? (
                <div className="text-center space-y-4 z-10">
                    <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-emerald-500/10 rounded-full animate-pulse backdrop-blur-sm"></div>
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">{statusMessage}</p>
                    <p className="text-xs text-gray-500">Video generation takes time (1-2 mins). Please wait.</p>
                </div>
            ) : resultVideo ? (
                <div className="w-full h-full flex flex-col gap-4 animate-fade-in group cursor-pointer" onClick={() => setViewVideo(resultVideo)}>
                <div className="flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-2xl relative">
                    <video 
                    src={resultVideo} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-h-[600px] w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="bg-black/50 text-white px-4 py-2 rounded-full font-bold">Klik untuk Perbesar</span>
                    </div>
                </div>
                <a 
                    href={resultVideo}
                    download={`veo-video-${Date.now()}.mp4`}
                    className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    Unduh Video MP4
                </a>
                </div>
            ) : (
                <div className="text-center text-gray-400">
                <Video size={64} className="mx-auto mb-4 opacity-20" />
                <p>Hasil video akan muncul di sini</p>
                </div>
            )}
            </div>

            {/* Video History Grid */}
            {videoHistory.length > 0 && (
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <History className="text-gray-500" size={18} />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Riwayat Video</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {videoHistory.map((item) => (
                            <div key={item.id} className="relative group rounded-lg overflow-hidden bg-black aspect-video cursor-pointer" onClick={() => setViewVideo(item.url)}>
                                <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[10px] text-white truncate">{item.prompt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};