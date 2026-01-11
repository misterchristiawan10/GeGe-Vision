
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Sparkles, Trash2, Plus, 
  RefreshCw, Image as ImageIcon, Download, 
  Loader2, Clapperboard, Video, Camera, MessageSquare, PlayCircle, Mic, MicOff, Film, X, ZoomIn,
  RotateCcw, RotateCw, Settings, Palette, Info
} from 'lucide-react';
import { generateCreativeImage, generateStoryboardPlan, generateVeoVideo, StoryboardSceneData } from '../../services/geminiService';

const VISUAL_TEMPLATES = [
  { id: 'cinematic', label: 'Cinematic Realistic (Film)', ratio: '16:9', style: 'High-end cinematic photography, shot on Arri Alexa, 35mm lens, realistic textures, global illumination' },
  { id: 'reels', label: 'Social Media (TikTok/Reels)', ratio: '9:16', style: 'Vertical mobile cinematography, high-quality vlogger aesthetic, clear lighting, modern social media style' },
  { id: 'anime', label: 'Anime Studio Ghibli Style', ratio: '16:9', style: 'Hand-painted anime background, Studio Ghibli aesthetic, soft watercolor textures, nostalgic lighting, high-quality 2D animation' },
  { id: 'sketch', label: 'Professional Noir Sketch', ratio: '16:9', style: 'Rough charcoal storyboard sketch, high contrast black and white, dramatic shadows, hand-drawn texture' },
  { id: '3d_render', label: '3D Animation (Pixar Style)', ratio: '1:1', style: 'Stylized 3D render, Disney Pixar aesthetic, subsurface scattering, vibrant colors, expressive character lighting' }
];

const MOODS = [
  { id: 'dramatic', label: 'Dramatis / Intense', style: 'Dramatic shadows, high contrast, moody lighting, suspenseful atmosphere' },
  { id: 'warm', label: 'Hangat / Cozy', style: 'Warm golden hour lighting, soft glow, inviting and peaceful atmosphere' },
  { id: 'cold', label: 'Dingin / Misterius', style: 'Cold blue color grading, misty atmosphere, mysterious and sterile vibe' },
  { id: 'vibrant', label: 'Ceria / Pop', style: 'Bright saturated colors, high key lighting, energetic and happy vibe' },
  { id: 'vintage', label: 'Vintage 90s', style: 'Film grain, faded colors, nostalgic vintage aesthetic, retro camera look' }
];

interface Scene extends StoryboardSceneData {
  id: number;
  image: string | null;
  video: string | null;
  loading: boolean;
  videoLoading: boolean;
  error?: string;
  includeDialogueInVideo: boolean;
}

interface StoryBoardProps {
  initialImage?: File | null;
  initialState?: any;
  onStateChange?: (state: any) => void;
}

interface SettingsState {
    theme: string;
    template: typeof VISUAL_TEMPLATES[0];
    mood: typeof MOODS[0];
}

export const StoryBoardModule: React.FC<StoryBoardProps> = ({ initialImage, initialState, onStateChange }) => {
  const isHydrated = useRef(false);
  const [refImage, setRefImage] = useState<File | null>(null);
  const [previewRef, setPreviewRef] = useState<string | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  const [settings, setSettingsState] = useState<SettingsState>({
    theme: '',
    template: VISUAL_TEMPLATES[0],
    mood: MOODS[0]
  });

  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    if (JSON.stringify(updated) !== JSON.stringify(history[historyIndex])) {
        const newHistory = [...history.slice(0, historyIndex + 1), updated].slice(-15);
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

  // Lifecycle
  useEffect(() => {
    if (initialImage) {
      setRefImage(initialImage);
      setPreviewRef(URL.createObjectURL(initialImage));
    }
  }, [initialImage]);

  useEffect(() => {
    if (initialState && !isHydrated.current) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            setSettingsState(initialState.history[newIndex]);
        }
        setScenes(initialState.scenes || []);
        isHydrated.current = true;
    } else if (!initialState && !isHydrated.current) {
        setHistory([settings]);
        setHistoryIndex(0);
        isHydrated.current = true;
    }
  }, [initialState]);
  
  useEffect(() => {
    if (isHydrated.current) {
      onStateChange?.({ history, historyIndex, scenes });
    }
  }, [history, historyIndex, scenes]);

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRefImage(file);
      setPreviewRef(URL.createObjectURL(file));
    }
  };
  
  const handleDownload = async (imageUrl: string | null, filename: string) => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
      // Fallback for browsers that might not support fetching data URIs
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.click();
    }
  };

  const generatePlan = async () => {
    if (!settings.theme.trim()) return;
    setIsPlanning(true);
    setScenes([]);
    
    try {
      const sceneDataList = await generateStoryboardPlan(settings.theme, 5);
      const newScenes: Scene[] = sceneDataList.map((data, idx) => ({
        id: Date.now() + idx,
        ...data,
        image: null,
        video: null,
        loading: false,
        videoLoading: false,
        includeDialogueInVideo: false
      }));
      setScenes(newScenes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanning(false);
    }
  };

  const constructPrompt = (scene: Scene) => {
    return `
      [DIRECTOR'S PROTOCOL: SCENE RENDERING]
      SUBJECT CONSISTENCY: The person in this panel MUST match the Reference Face exactly (facial features, hair style, clothing).
      
      SCENE CONTEXT:
      - Action: ${scene.action}
      - Composition/Camera: ${scene.camera}
      - Style Directive: ${settings.template.style}
      - Lighting Mood: ${settings.mood.style}
      
      TECHNICAL: Professional 8K production quality, sharp focus on subject, detailed environment that fits the action.
    `;
  };

  const renderSingleScene = async (sceneId: number) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, loading: true, error: undefined } : s));
    
    try {
        const prompt = constructPrompt(scene);
        const imgUrl = await generateCreativeImage(prompt, refImage, settings.template.ratio, '1K');
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, image: imgUrl, loading: false } : s));
    } catch (e) {
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, loading: false, error: "Gagal" } : s));
    }
  };

  const renderAllScenes = async () => {
    setIsGeneratingAll(true);
    for (const scene of scenes) {
        if (!scene.image) {
            await renderSingleScene(scene.id);
        }
    }
    setIsGeneratingAll(false);
  };

  const handleGenerateVideo = async (id: number) => {
    const scene = scenes.find(s => s.id === id);
    if (!scene) return;
    
    setScenes(prev => prev.map(s => s.id === id ? { ...s, videoLoading: true } : s));

    try {
      let file: File | null = null;
      if (scene.image) {
        const res = await fetch(scene.image);
        const blob = await res.blob();
        file = new File([blob], "scene-base.png", { type: "image/png" });
      }

      let videoPrompt = `Cinematic Video Sequence. 
      ACTION: ${scene.action}. 
      CAMERA MOTION: ${scene.camera}. 
      ATMOSPHERE: ${settings.mood.label}.`;

      if (scene.includeDialogueInVideo && scene.dialogue) {
         videoPrompt += `\nCHARACTER SPEECH: "${scene.dialogue}".`;
      }
      
      const videoUrl = await generateVeoVideo(videoPrompt, settings.template.ratio, file);
      setScenes(prev => prev.map(s => s.id === id ? { ...s, video: videoUrl, videoLoading: false } : s));
    } catch (e: any) {
      setScenes(prev => prev.map(s => s.id === id ? { ...s, videoLoading: false } : s));
      alert("Gagal membuat video: " + e.message);
    }
  };

  const updateSceneField = (id: number, field: keyof StoryboardSceneData, value: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleManualScene = () => {
    setScenes([...scenes, {
        id: Date.now(),
        action: "Ketik deskripsi aksi di sini...",
        camera: "Medium Shot",
        dialogue: "...",
        image: null,
        video: null,
        loading: false,
        videoLoading: false,
        includeDialogueInVideo: false
    }]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
      
      {/* Lightbox */}
      {viewImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setViewImage(null)}>
           <button onClick={() => setViewImage(null)} className="fixed top-6 right-6 text-white p-3 bg-white/10 rounded-full transition-all"><X size={32}/></button>
           <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
               <img src={viewImage} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Full view" />
               <div className="mt-4">
                  <button 
                    onClick={() => handleDownload(viewImage, `storyboard-panel-${Date.now()}.png`)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors"
                  >
                      <Download size={20}/> Unduh HD
                  </button>
               </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl">
               <Clapperboard className="text-white" size={28} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Smart Storyboard</h2>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Visual Director Engine v2.0</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-all"><RotateCcw size={18}/></button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-all"><RotateCw size={18}/></button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Controls Panel */}
         <div className="lg:col-span-4 space-y-6">
            <section className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white border-b pb-3">
                   <Settings size={18} className="text-blue-500" />
                   <span>Konfigurasi Produksi</span>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">01. Referensi Karakter</label>
                      <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden group hover:border-blue-500 transition-colors">
                         <input type="file" accept="image/*" onChange={handleRefUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                         {previewRef ? (
                            <img src={previewRef} className="w-full h-full object-cover" alt="Character Ref" />
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                               <ImageIcon size={32} className="mb-2 opacity-20" />
                               <p className="text-[10px] font-bold">UNGGAH WAJAH UTAMA</p>
                               <p className="text-[9px] opacity-60">PENTING UNTUK KONSISTENSI</p>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">02. Logline / Tema</label>
                      <textarea 
                        value={settings.theme}
                        onChange={(e) => updateSettings({ theme: e.target.value })}
                        placeholder="Cth: Seorang detektif mengejar pencuri di atap gedung..."
                        className="w-full h-24 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Palette size={10}/> Visual Style</label>
                         <select 
                            value={settings.template.id}
                            onChange={(e) => updateSettings({ template: VISUAL_TEMPLATES.find(t => t.id === e.target.value) })}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-bold"
                         >
                            {VISUAL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Sparkles size={10}/> Mood / Atmosfer</label>
                         <select 
                            value={settings.mood.id}
                            onChange={(e) => updateSettings({ mood: MOODS.find(m => m.id === e.target.value) })}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-bold"
                         >
                            {MOODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                         </select>
                      </div>
                   </div>

                   <button 
                     onClick={generatePlan}
                     disabled={!settings.theme || isPlanning}
                     className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                   >
                     {isPlanning ? <Loader2 size={20} className="animate-spin" /> : <Clapperboard size={20} />}
                     {isPlanning ? 'MENYUSUN SKENARIO...' : 'GENERATE STORYLINE'}
                   </button>
                </div>
            </section>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
               <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Info size={20} />
               </div>
               <div className="space-y-1">
                  <h4 className="text-sm font-black text-blue-900 dark:text-blue-200">Director's Pro Tip</h4>
                  <p className="text-[10px] text-blue-800/70 dark:text-blue-400 leading-relaxed">
                     Klik <b>"Scene Manual"</b> jika Anda ingin menambahkan adegan khusus di luar skenario otomatis AI. Gunakan foto wajah yang jelas sebagai referensi.
                  </p>
               </div>
            </div>
         </div>

         {/* Scenes List */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-black text-xl text-gray-900 dark:text-white tracking-tight italic">BOARDS & TIMELINE</h3>
               <div className="flex gap-2">
                  {scenes.length > 0 && (
                    <button 
                        onClick={renderAllScenes} 
                        disabled={isGeneratingAll}
                        className="text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-md transition-all flex items-center gap-2"
                    >
                        {isGeneratingAll ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                        RENDER SEMUA PANEL
                    </button>
                  )}
                  <button onClick={handleManualScene} className="text-[10px] font-black bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-all">+ PANEL BARU</button>
               </div>
            </div>

            <div className="space-y-6">
               {scenes.length === 0 ? (
                  <div className="py-32 bg-gray-50 dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-gray-400 opacity-40">
                     <Film size={64} className="mb-4" />
                     <p className="text-xl font-black italic tracking-widest uppercase">No Boards Yet</p>
                     <p className="text-xs">Setup skenario Anda di panel kiri untuk memulai.</p>
                  </div>
               ) : (
                  scenes.map((scene, index) => (
                    <div key={scene.id} className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col md:flex-row animate-fade-in-up hover:shadow-xl hover:border-blue-500/30 transition-all duration-500">
                        {/* Visual Frame */}
                        <div className="md:w-1/2 aspect-video md:aspect-auto bg-slate-100 dark:bg-black/40 relative group overflow-hidden">
                           {scene.loading ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/5 backdrop-blur-sm space-y-3">
                                 <Loader2 size={40} className="text-blue-500 animate-spin" />
                                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Painting Scene {index + 1}...</p>
                              </div>
                           ) : scene.image ? (
                              <div className="w-full h-full relative group">
                                 <img 
                                    src={scene.image} 
                                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105" 
                                    onClick={() => setViewImage(scene.image)}
                                    alt={`Scene ${index+1}`} 
                                 />
                                 {scene.video && (
                                    <div className="absolute inset-0 bg-black z-20">
                                       <video src={scene.video} controls autoPlay loop className="w-full h-full object-contain" />
                                       <button onClick={() => updateSceneField(scene.id, 'video' as any, null as any)} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"><X size={16}/></button>
                                    </div>
                                 )}
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-4">
                                    {!scene.video && (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); setViewImage(scene.image); }} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 transform scale-75 group-hover:scale-100 transition-all hover:bg-white/40"><ZoomIn size={32}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDownload(scene.image, `panel-${index + 1}.png`); }} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 transform scale-75 group-hover:scale-100 transition-all hover:bg-white/40"><Download size={32}/></button>
                                      </>
                                    )}
                                 </div>
                                 <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button onClick={() => renderSingleScene(scene.id)} className="flex-1 py-2 bg-white/90 text-gray-900 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-white"><RefreshCw size={12}/> RE-RENDER</button>
                                    {!scene.video && (
                                       <button 
                                          onClick={() => handleGenerateVideo(scene.id)}
                                          disabled={scene.videoLoading}
                                          className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-blue-500 disabled:opacity-50"
                                       >
                                          {scene.videoLoading ? <Loader2 size={12} className="animate-spin"/> : <Video size={12}/>}
                                          {scene.videoLoading ? 'RENDERING VEO...' : 'MAKE VIDEO'}
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ) : (
                              <button 
                                 onClick={() => renderSingleScene(scene.id)}
                                 className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all space-y-3"
                              >
                                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center">
                                    <Plus size={32} />
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Render Scene {index + 1}</p>
                              </button>
                           )}
                           {scene.error && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 p-4 text-center">
                                <p className="text-red-500 font-bold text-xs mb-2">Gagal memuat visual</p>
                                <button onClick={() => renderSingleScene(scene.id)} className="text-[10px] font-bold px-4 py-2 bg-red-500 text-white rounded-lg">Coba Lagi</button>
                             </div>
                           )}
                        </div>

                        {/* Editor Section */}
                        <div className="flex-1 p-6 md:p-8 space-y-6 flex flex-col">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-blue-500">{index + 1}</span>
                                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Panel Editor</h4>
                              </div>
                              <button onClick={() => setScenes(scenes.filter(s => s.id !== scene.id))} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                           </div>

                           <div className="space-y-4 flex-1">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-blue-500 uppercase tracking-tighter flex items-center gap-1"><Film size={10}/> Deskripsi Aksi</label>
                                 <textarea 
                                    value={scene.action}
                                    onChange={(e) => updateSceneField(scene.id, 'action', e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-100 dark:border-gray-800 text-sm py-1 focus:border-blue-500 outline-none h-16 resize-none"
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-blue-500 uppercase tracking-tighter flex items-center gap-1"><Camera size={10}/> Kamera & Angle</label>
                                    <input 
                                       type="text"
                                       value={scene.camera}
                                       onChange={(e) => updateSceneField(scene.id, 'camera', e.target.value)}
                                       className="w-full bg-transparent border-b border-gray-100 dark:border-gray-800 text-sm py-1 focus:border-blue-500 outline-none"
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                       <label className="text-[9px] font-black text-blue-500 uppercase tracking-tighter flex items-center gap-1"><MessageSquare size={10}/> Dialog</label>
                                       <button 
                                          onClick={() => updateSceneField(scene.id, 'includeDialogueInVideo' as any, (!scene.includeDialogueInVideo) as any)}
                                          className={`p-1 rounded-full transition-colors ${scene.includeDialogueInVideo ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'text-gray-300'}`}
                                          title="Masukkan dialog ke audio video"
                                       >
                                          {scene.includeDialogueInVideo ? <Mic size={10}/> : <MicOff size={10}/>}
                                       </button>
                                    </div>
                                    <input 
                                       type="text"
                                       value={scene.dialogue}
                                       onChange={(e) => updateSceneField(scene.id, 'dialogue', e.target.value)}
                                       className="w-full bg-transparent border-b border-gray-100 dark:border-gray-800 text-sm py-1 focus:border-blue-500 outline-none italic font-serif"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="pt-4 flex justify-end gap-3">
                              {scene.image && (
                                <button 
                                    onClick={() => handleDownload(scene.image, `panel-${index + 1}.png`)}
                                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                                    title="Unduh Panel"
                                >
                                    <Download size={18}/>
                                </button>
                              )}
                           </div>
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
