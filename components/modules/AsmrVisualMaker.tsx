
import React, { useState, useEffect, useRef } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { generateVeoVideo } from '../../services/geminiService';
import { 
    CloudRain, Flame, Waves, Wind, Coffee, Moon, Sun, 
    Video, Image as ImageIcon, Loader2, Download, X, ZoomIn, 
    RotateCcw, RotateCw, Sparkles, Volume2
} from 'lucide-react';

interface AsmrVisualMakerProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const PRESETS = [
  { 
    id: 'rain_room', 
    name: 'Hujan di Balik Jendela', 
    icon: CloudRain, 
    prompt: 'A close-up, cozy view through a window pane during a heavy rainstorm. The focus is sharply on the crystal-clear water droplets sliding down the glass. Outside, a moody and blurred garden or city street is visible through the rain. Only a small part of the indoor window sill is visible, with a steaming cup of coffee or a small glowing candle to create a warm contrast. High-fidelity water physics, cinematic atmospheric lighting, 8K resolution.' 
  },
  { 
    id: 'river_forest', 
    name: 'Aliran Sungai Hutan', 
    icon: Waves, 
    prompt: 'A pristine slow-moving river in a lush green tropical forest. Ancient mossy rocks, sunlight filtering through dense tree canopy (god rays). Clear water ripples. Photorealistic, hyper-detailed, peaceful nature vibe.' 
  },
  { 
    id: 'campfire_night', 
    name: 'Api Unggun Malam', 
    icon: Flame, 
    prompt: 'A small crackling campfire in a dark pine forest at midnight. Bright orange embers flying into the starry night sky. Realistic fire physics, glowing logs, silhouettes of tall trees in the background. Cinematic lighting.' 
  },
  { 
    id: 'library_rain', 
    name: 'Perpustakaan Klasik', 
    icon: Coffee, 
    prompt: 'An old aesthetic library with mahogany bookshelves. View focused on a study desk by a large window. It is raining heavily OUTSIDE. Rain streaks are visible on the glass. The room interior is dim and warm, serving as a cozy frame for the rainy view outside. Soft lo-fi lighting, dust particles dancing in the light rays.' 
  },
  { 
    id: 'space_window', 
    name: 'Jendela Luar Angkasa', 
    icon: Moon, 
    prompt: 'View from a futuristic space station window overlooking a glowing nebula and Earth. Soft blue cockpit lighting, minimalist interior framing the massive space view. Ethereal, silent, cosmic ASMR vibes.' 
  }
];

const VISUAL_STYLES = [
  { id: 'realistic', name: 'Ultra Realistic', keyword: '8K Photorealistic, RAW photography, high fidelity' },
  { id: 'lofi', name: 'Lo-Fi Anime', keyword: 'Studio Ghibli style, lo-fi aesthetic, hand-painted textures, nostalgic vibe' },
  { id: 'cinematic', name: 'Cinematic Movie', keyword: 'Epic movie shot, anamorphic lens, high contrast, dramatic shadows' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', keyword: 'Neon lights, rainy futuristic city, purple and teal palette, synthwave vibe' }
];

interface SettingsState {
    selectedPreset: string;
    style: string;
    intensity: number;
    time: 'Day' | 'Night' | 'Sunset';
    isGenerateVideo: boolean;
}

export const AsmrVisualMakerModule: React.FC<AsmrVisualMakerProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    selectedPreset: PRESETS[0].id,
    style: VISUAL_STYLES[0].id,
    intensity: 50,
    time: 'Night',
    isGenerateVideo: false
  });

  const [promptPrefix, setPromptPrefix] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHydrated = useRef(false);

  useEffect(() => {
    if (history.length === 0) {
        setHistory([settings]);
        setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    if (initialState && !isHydrated.current) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            setSettingsState(initialState.history[newIndex]);
        }
        setVideoResult(initialState.videoResult || null);
        isHydrated.current = true;
    }
  }, [initialState]);

  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({ 
            history, 
            historyIndex,
            videoResult,
            generator: initialState?.generator 
        });
    }
  }, [history, historyIndex, videoResult]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    const newHistory = [...history.slice(0, historyIndex + 1), updated].slice(-15);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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

  useEffect(() => {
    const preset = PRESETS.find(p => p.id === settings.selectedPreset);
    const style = VISUAL_STYLES.find(s => s.id === settings.style);
    
    let finalPrompt = `[ASMR ATMOSPHERIC VISUAL] 
    Scenario: ${preset?.prompt}. 
    Style: ${style?.keyword}. 
    Atmosphere: ${settings.time} time, Intensity level: ${settings.intensity}%. 
    Focus: Sensory details, textures, and calming elements. 
    Technical: Masterpiece quality, no noise, perfectly balanced exposure.`;

    if (settings.isGenerateVideo || true) { // Always include motion rules for better VEO integration
        finalPrompt += `\n[MOTION RULES]: Subtle and slow motion. Raindrops should fall slowly outside the glass, water ripples should move gently, fire should flicker softly. Perfect for infinite looping. The focus should remain on the exterior elements seen through the frame.`;
    }

    setPromptPrefix(finalPrompt);
  }, [settings]);

  const handleGenerateVideoClick = async () => {
    setIsVideoLoading(true);
    setVideoStatus('Menghubungi Server Veo 3...');
    try {
        setVideoStatus('Sedang merender video ASMR... (1-2 menit)');
        const url = await generateVeoVideo(promptPrefix, "16:9");
        setVideoResult(url);
    } catch (e) {
        console.error(e);
        alert("Gagal membuat video ASMR.");
    } finally {
        setIsVideoLoading(false);
    }
  };

  const extraControls = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end gap-2 -mb-4">
        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
      </div>

      <div className="bg-white dark:bg-dark-card/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-4 shadow-inner">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1"><Sparkles size={10}/> Pilih Skenario ASMR</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => updateSettings({ selectedPreset: p.id })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${settings.selectedPreset === p.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100'}`}
              >
                <p.icon size={20} className="mb-1" />
                <span className="text-[10px] font-bold leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Gaya Visual</label>
            <select 
              value={settings.style}
              onChange={(e) => updateSettings({ style: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
            >
              {VISUAL_STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Waktu / Pencahayaan</label>
            <select 
              value={settings.time}
              onChange={(e) => updateSettings({ time: e.target.value as any })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
            >
              <option value="Day">Siang Hari</option>
              <option value="Sunset">Matahari Terbenam</option>
              <option value="Night">Malam Hari</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Intensitas Efek ({settings.intensity}%)</label>
                <Volume2 size={12} className="text-gray-400" />
            </div>
            <input 
                type="range" min="0" max="100" 
                value={settings.intensity} 
                onChange={(e) => updateSettings({ intensity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-2">
                    <Video size={16} className="text-indigo-600" />
                    <div>
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Buat Video ASMR (VEO 3)</p>
                        <p className="text-[9px] text-indigo-600/70">Visual bergerak & atmosferik</p>
                    </div>
                </div>
                <button 
                    onClick={handleGenerateVideoClick}
                    disabled={isVideoLoading}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md transition-all ${isVideoLoading ? 'bg-gray-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                >
                    {isVideoLoading ? 'Loading...' : 'Generate Video'}
                </button>
            </div>
        </div>
      </div>

      {videoResult && (
          <div className="animate-fade-in-up space-y-3">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider">
                  <Video size={14}/> Hasil Video ASMR
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-indigo-500/30">
                  <video src={videoResult} controls autoPlay loop className="w-full h-auto" />
                  <div className="absolute top-4 right-4 flex gap-2">
                      <a href={videoResult} download="asmr-panda.mp4" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20">
                          <Download size={16} />
                      </a>
                      <button onClick={() => setVideoResult(null)} className="p-2 bg-black/40 hover:bg-red-500 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20">
                          <X size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isVideoLoading && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-pulse flex items-center gap-3">
            <Loader2 size={20} className="text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{videoStatus}</p>
        </div>
      )}
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="asmr-visual"
      title="GeGe ASMR Visual"
      description="Ciptakan lingkungan relaksasi virtual yang terfokus pada ketenangan alam di luar jendela."
      promptPrefix={promptPrefix}
      requireImage={false}
      mainImageLabel="Subjek Tambahan (Opsional)"
      allowReferenceImage={true}
      referenceImageLabel="Referensi Gaya (Opsional)"
      extraControls={extraControls}
      batchModeAvailable={false}
      defaultAspectRatio="16:9"
      initialState={initialState?.generator}
      onStateChange={(state) => onStateChange?.({ 
          history, 
          historyIndex,
          videoResult,
          generator: state 
      })}
    />
  );
};
