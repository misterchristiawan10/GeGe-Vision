
import React, { useState, useEffect, useRef } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { generateThumbnailDescription, generateViralHeadline } from '../../services/geminiService';
import { 
    RotateCcw, RotateCw, Type, Palette, Sparkles, Target, Layers, 
    Box, Type as FontIcon, Maximize2, PaintBucket, MousePointer2,
    CheckCircle2, Wand2, Loader2, RefreshCw, Dices
} from 'lucide-react';

interface ThumbnailMakerProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const CATEGORIES = [
  { id: 'motivation', name: 'Afirmasi & Motivasi', style: 'Soulful, Inspiring, Soft Volumetric Glow, cinematic depth, spiritual or ethereal nature elements, golden hour lighting, powerful minimalist subjects' },
  { id: 'gaming', name: 'Gaming / Streamer', style: 'High energy, aggressive high-contrast, vibrant neon glows, action-packed particles, sharp perspective angles, anamorphic lens flares, RGB color scheme' },
  { id: 'vlog', name: 'Vlog / Lifestyle', style: 'Aesthetic, bright and airy, cheerful saturated colors, clean blurred backgrounds, soft rim lighting, premium professional photography look, inviting atmosphere' },
  { id: 'tech', name: 'Technology / Review', style: 'Futuristic, ultra-clean industrial aesthetic, high-tech holographic glows, sharp metallic textures, deep blue and teal color grading, precise engineering focus' },
  { id: 'horror', name: 'Mystery / Horror', style: 'Dark and moody, heavy fog, suspenseful cinematic lighting, high-grain textures, desaturated eerie color palette, sharp scary shadows, mysterious focal points' },
  { id: 'tutorial', name: 'Tutorial / Edukasi', style: 'Crystal clear focus on subjects, professional studio setup, high visibility contrast, organized composition, bright balanced lighting, zero clutter' },
  { id: 'finance', name: 'Finance / Business', style: 'Trustworthy and elite, luxury gold/green accents, powerful steady composition, premium material textures, sharp corporate aesthetic, high-stakes visual weight' }
];

const BACKGROUND_VIBES: Record<string, string[]> = {
  motivation: ['Puncak Gunung saat Sunrise', 'Danau Tenang dengan Kabut', 'Langit Tak Berbatas', 'Hutan Pinus Ethereal', 'Cahaya Ilahi di Ruang Hampa'],
  gaming: ['Cyberpunk Neon Alley', 'Arena Esports Futuristik', 'Ruang Kontrol Pesawat Luar Angkasa', 'Dimensi Digital Glitch', 'Dungeon Fantasy Gelap'],
  vlog: ['Kafe Minimalis Estetik', 'Jalanan Kota Tokyo/Seoul', 'Taman Bunga Musim Semi', 'Interior Apartemen Mewah', 'Pantai Tropis Cerah'],
  tech: ['Lab Teknologi Minimalis', 'Server Room Futuristik', 'Sirkuit Elektronik Raksasa', 'Data Center Holografik', 'Meja Kerja Minimalis Setup'],
  horror: ['Rumah Tua Terbengkalai', 'Hutan Gelap Berkabut Tebal', 'Lorong Rumah Sakit Sepi', 'Kuburan Tua Berlumut', 'Gua Bawah Tanah Misterius'],
  tutorial: ['Studio Foto Putih Bersih', 'Ruang Belajar Modern', 'Workshop Kreatif Rapi', 'Office Minimalis Modern', 'Perpustakaan Klasik'],
  finance: ['Wall Street Trading Floor', 'Lobi Bank Mewah', 'Vault Emas Raksasa', 'Ruang Meeting C-Level', 'City Skyline Malam Hari']
};

const VISUAL_CONCEPTS = [
  { id: 'split', name: 'Split Screen (Vs)', desc: 'Strong vertical division, maximum contrast between two sides, heroic vs villainous vibe' },
  { id: 'center', name: 'Subject Focus', desc: 'Massive single subject at dead center, intense gaze into camera, heavy background bokeh, 3D pop effect' },
  { id: 'typo', name: 'Text Dominance', desc: 'Extreme text size, text takes 70% of screen space, graphic-heavy layout' },
  { id: 'chaos', name: 'Action Chaos', desc: 'Full of motion blur, sparks, explosions, and dynamic debris, feeling of extreme movement' },
  { id: 'minimal', name: 'Minimalist', desc: 'Single iconic object, extreme negative space, modern clean look, focus on silhouette' },
  { id: 'perspective', name: 'Deep Angle', desc: 'Worm-eye view or fisheye distortion for extreme scale, making subjects look monumental' }
];

const COLOR_PSYCHOLOGY = [
  { id: 'red', name: 'Red (High Energy)', keyword: 'Aggressive vibrant red, high urgency, intense energy, heat, danger, passion' },
  { id: 'blue', name: 'Blue (Trust)', keyword: 'Deep professional sapphire blue, reliable tech vibe, icy clarity, calm but powerful' },
  { id: 'yellow', name: 'Yellow (Attention)', keyword: 'Bright caution yellow, maximum visibility, joyful alert, energetic warmth' },
  { id: 'gold', name: 'Gold (Premium)', keyword: 'Metallic reflective liquid gold, elite status, luxury finish, winning energy' },
  { id: 'green', name: 'Green (Wealth)', keyword: 'Emerald money green, organic growth, nature vitality, prosperity' },
  { id: 'purple', name: 'Purple (Creative)', keyword: 'Mystical deep royal purple, spiritual creativity, neon magic, rarity' },
  { id: 'black', name: 'Black (Power)', keyword: 'Matte black charcoal, intense contrast, mysterious authoritative power, premium depth' }
];

const FONT_TYPES = [
  { id: 'impact', name: 'Ultra Bold (Impact)', keyword: 'Extremely thick, heavy-weight, impactful sans-serif font like Impact or Anton, sharp modern corners' },
  { id: 'modern', name: 'Modern Sans', keyword: 'Geometric clean sans-serif font, minimalist professional, high legibility, tech-oriented' },
  { id: 'serif', name: 'Classic Serif', keyword: 'Elegant sharp-serif font, editorial luxury fashion style, high-end look, traditional authority' },
  { id: 'hand', name: 'Handwritten', keyword: 'Authentic aggressive brush font or stylish marker script for personal vibe, raw and emotional' },
  { id: 'mono', name: 'Monospace Tech', keyword: 'Technical blocky monospace font, digital coding aesthetic, robotic precision' }
];

const FONT_SIZES = [24, 28, 32, 36, 40, 48, 56, 64, 72, 84, 96, 110, 124, 150];

const TEXT_COLORS = [
  { id: 'white', name: 'Putih', hex: '#FFFFFF' },
  { id: 'yellow', name: 'Kuning', hex: '#FFFF00' },
  { id: 'red', name: 'Merah', hex: '#FF0000' },
  { id: 'orange', name: 'Oranye', hex: '#FFA500' },
  { id: 'pink', name: 'Hot Pink', hex: '#FF69B4' },
  { id: 'purple', name: 'Ungu Elektrik', hex: '#A020F0' },
  { id: 'cyan', name: 'Cyan / Aqua', hex: '#00FFFF' },
  { id: 'skyblue', name: 'Biru Langit', hex: '#87CEEB' },
  { id: 'lime', name: 'Lime Green', hex: '#00FF00' },
  { id: 'gold', name: 'Emas', hex: '#FFD700' },
  { id: 'silver', name: 'Perak', hex: '#C0C0C0' },
  { id: 'black', name: 'Hitam', hex: '#000000' }
];

const OUTLINE_OPTIONS = [
  { id: 'black', name: 'Hitam Tebal', desc: 'Extra-thick black stroke for maximum legibility and high-contrast graphic pop' },
  { id: 'white_glow', name: 'Putih Glow', desc: 'Clean white stroke with a soft, ethereal outer glow for visibility on dark parts' },
  { id: 'red_neon', name: 'Merah Neon', desc: 'Vibrant intense neon red outer glow, emitting light onto surrounding elements' },
  { id: 'blue_neon', name: 'Biru Neon', desc: 'Intense cinematic neon blue outer glow, cool electric high-tech vibe' },
  { id: 'none', name: 'Tanpa Outline', desc: 'Flat sharp text without any decorative stroke or effects for a modern minimalist look' }
];

const VISUAL_HOOKS = [
  'Tidak Ada',
  'Panah Merah Raksasa (Clickbait Arrow)',
  'Lingkaran Kuning Terang (Target Circle)',
  'Efek Cahaya Aura Subjek (Glow)',
  'Latar Belakang Sangat Blur (f/1.2 Bokeh)',
  'Emoji 3D Ekspresi Terkejut Raksasa',
  'Partikel Api & Bara (Ember Sparks)',
  'Tanda Tanya Raksasa Bercahaya Putih'
];

interface SettingsState {
    headline: string;
    subheadline: string;
    category: string;
    concept: string;
    colorPsychology: string;
    fontType: string;
    headlineSize: number;
    subheadlineSize: number;
    textColor: string;
    outline: string;
    hook: string;
    mood: string;
    randomBackground: boolean;
    activeBgStyle: string;
}

export const ThumbnailMakerModule: React.FC<ThumbnailMakerProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    headline: '',
    subheadline: '',
    category: CATEGORIES[0].id,
    concept: VISUAL_CONCEPTS[1].id,
    colorPsychology: COLOR_PSYCHOLOGY[0].id,
    fontType: FONT_TYPES[0].id,
    headlineSize: 96,
    subheadlineSize: 48,
    textColor: TEXT_COLORS[1].id,
    outline: OUTLINE_OPTIONS[0].id,
    hook: VISUAL_HOOKS[0],
    mood: 'High Energy',
    randomBackground: false,
    activeBgStyle: ''
  });

  const [promptPrefix, setPromptPrefix] = useState('');
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHeadlineLoading, setIsHeadlineLoading] = useState(false);
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
        isHydrated.current = true;
    }
  }, [initialState]);

  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({ 
            history, 
            historyIndex,
            generator: initialState?.generator 
        });
    }
  }, [history, historyIndex]);

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

  const handleRollBackground = () => {
    const categoryVibes = BACKGROUND_VIBES[settings.category] || ['Studio Foto'];
    const randomVibe = categoryVibes[Math.floor(Math.random() * categoryVibes.length)];
    updateSettings({ activeBgStyle: randomVibe, randomBackground: true });
  };

  const handleAutoHeadline = async () => {
    setIsHeadlineLoading(true);
    const cat = CATEGORIES.find(c => c.id === settings.category)?.name || "Umum";
    try {
        const viralHeadline = await generateViralHeadline(cat, settings.headline);
        updateSettings({ headline: viralHeadline });
    } catch (e) {
        console.error(e);
    } finally {
        setIsHeadlineLoading(false);
    }
  };

  const handleBrainstormScene = async () => {
    const cat = CATEGORIES.find(c => c.id === settings.category)?.name || "General";
    const head = settings.headline || "Amazing Video";
    
    // Add additional context for the AI Brainstorming
    const settingsContext = `Mood: ${settings.mood}, Concept: ${settings.concept}, Color Psychology: ${settings.colorPsychology}`;
    
    try {
        return await generateThumbnailDescription(cat, head, settingsContext);
    } catch (e) {
        console.error(e);
        return "Professional cinematic studio setup with high contrast lighting and sharp textures.";
    }
  };

  useEffect(() => {
    const { 
      headline, subheadline, category, concept, colorPsychology, 
      fontType, headlineSize, subheadlineSize, textColor, outline, hook, mood,
      randomBackground, activeBgStyle
    } = settings;

    const cat = CATEGORIES.find(c => c.id === category);
    const con = VISUAL_CONCEPTS.find(c => c.id === concept);
    const cp = COLOR_PSYCHOLOGY.find(c => c.id === colorPsychology);
    const ft = FONT_TYPES.find(f => f.id === fontType);
    const tc = TEXT_COLORS.find(t => t.id === textColor);
    const out = OUTLINE_OPTIONS.find(o => o.id === outline);
    
    const bgInstruction = randomBackground && activeBgStyle 
        ? `Use a highly detailed background specifically styled as: "${activeBgStyle}".`
        : `Style: ${cat?.style}.`;

    let prompt = `[MASTER-LEVEL GRAPHIC DESIGN: HIGH-CTR YOUTUBE THUMBNAIL]
    Objective: Create a viral-style thumbnail that captures immediate attention.
    
    VISUAL ARCHITECTURE:
    - Context/Category: ${cat?.name}.
    - Background: ${bgInstruction}
    - Composition: ${con?.name} (${con?.desc}).
    - Lighting/Atmosphere: ${mood} lighting with dramatic shadows, rim lighting, and subsurface scattering.
    - Color Strategy: ${cp?.keyword}. Hyper-saturated for screen-pop.
    
    STRICT TEXT RENDERING (VECTOR QUALITY):
    1. MAIN HEADLINE: Render text "${headline.toUpperCase()}" 
       - Style: ${ft?.keyword}.
       - Size: ${headlineSize}pt (Massive, screen-filling, dominant).
       - Color: ${tc?.name} (${tc?.hex}).
       - Effect: ${out?.desc}. High-end graphic design finish.
    2. SUB-HEADLINE: Render text "${subheadline}"
       - Style: Professional secondary font.
       - Size: ${subheadlineSize}pt (High visibility).
       - Color: Complements main headline.
    
    CLICK HOOK: ${hook === 'Tidak Ada' ? 'Balanced composition.' : `Ensure the "${hook}" is a prominent 3D-like element that acts as the primary curiosity focal point.`}
    
    Technical: 8K resolution, Crystal Clear, Anamorphic lens distortion, Masterpiece quality.
    Subject: If a base image is provided, integrate it as the central hero. If not, generate a powerful scene for ${cat?.name}.`;

    setPromptPrefix(prompt);
  }, [settings]);

  const extraControls = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end gap-2 -mb-4">
        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"><RotateCcw size={14}/></button>
        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"><RotateCw size={14}/></button>
      </div>

      <div className="bg-white dark:bg-dark-card/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-6 shadow-sm">
        
        {/* Step 1: Text Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-wider">
              <Type size={14}/> 01. Judul & Tipografi
            </div>
            <button 
                onClick={handleAutoHeadline}
                disabled={isHeadlineLoading}
                className="flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm active:scale-95"
            >
                {isHeadlineLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {isHeadlineLoading ? "Generating..." : "Auto Clickbait Headline"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
             <div className="md:col-span-8 space-y-2">
                <div className="relative group">
                    <input 
                        type="text" 
                        value={settings.headline}
                        onChange={(e) => updateSettings({ headline: e.target.value })}
                        placeholder="Judul Utama (Maks 3-4 kata)"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm dark:text-white outline-none focus:border-rose-500 shadow-inner"
                    />
                    {settings.headline && (
                        <div className="absolute right-3 top-3 text-[9px] font-bold text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded opacity-0 group-focus-within:opacity-100 transition-opacity">
                            {settings.headline.split(' ').length} Kata
                        </div>
                    )}
                </div>
                <input 
                    type="text" 
                    value={settings.subheadline}
                    onChange={(e) => updateSettings({ subheadline: e.target.value })}
                    placeholder="Sub-judul (Opsional)"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent p-2.5 text-xs dark:text-white outline-none focus:border-rose-500"
                />
             </div>
             <div className="md:col-span-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase w-12">H-Size</label>
                   <select 
                        value={settings.headlineSize}
                        onChange={(e) => updateSettings({ headlineSize: parseInt(e.target.value) })}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white"
                   >
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                   <label className="text-[9px] font-bold text-gray-400 uppercase w-12">S-Size</label>
                   <select 
                        value={settings.subheadlineSize}
                        onChange={(e) => updateSettings({ subheadlineSize: parseInt(e.target.value) })}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white"
                   >
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Jenis Font</label>
                <select 
                    value={settings.fontType}
                    onChange={(e) => updateSettings({ fontType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white"
                >
                    {FONT_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Mood Thumbnail</label>
                <div className="grid grid-cols-2 gap-1">
                    {['High Energy', 'Dark'].map(m => (
                        <button 
                            key={m}
                            onClick={() => updateSettings({ mood: m })}
                            className={`py-2 rounded-lg text-[9px] font-bold transition-all border ${settings.mood === m ? 'bg-rose-500 text-white border-rose-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* Step 2: Background & Atmosphere */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-wider">
                <Box size={14}/> 02. Latar & Suasana
              </div>
              <div className="flex items-center gap-2">
                 {settings.randomBackground && (
                    <span className="text-[9px] font-mono text-indigo-400 truncate max-w-[120px]">{settings.activeBgStyle}</span>
                 )}
                 <button 
                    onClick={handleRollBackground}
                    className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/50 transition-all shadow-sm active:scale-95"
                 >
                    <Dices size={12} /> Roll Random BG
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">Warna Teks</label>
                <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ backgroundColor: TEXT_COLORS.find(t => t.id === settings.textColor)?.hex }}></div>
                    <select 
                        value={settings.textColor}
                        onChange={(e) => updateSettings({ textColor: e.target.value })}
                        className="flex-1 bg-transparent text-xs dark:text-white outline-none"
                    >
                        {TEXT_COLORS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">Gaya Outline</label>
                <select 
                    value={settings.outline}
                    onChange={(e) => updateSettings({ outline: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white outline-none"
                >
                    {OUTLINE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">Strategi Warna</label>
                <select 
                    value={settings.colorPsychology}
                    onChange={(e) => updateSettings({ colorPsychology: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white outline-none"
                >
                    {COLOR_PSYCHOLOGY.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">Visual Hook</label>
                <select 
                    value={settings.hook}
                    onChange={(e) => updateSettings({ hook: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 border-gray-300 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white outline-none"
                >
                    {VISUAL_HOOKS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* Step 3: Scene & Category */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
           <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-wider">
            <Target size={14}/> 03. Konsep & Kategori
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Topik Video</label>
                <select 
                    value={settings.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      // Clear random bg if category changes to keep it relevant
                      updateSettings({ category: newCat, randomBackground: false, activeBgStyle: '' });
                    }}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white outline-none"
                >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Komposisi Visual</label>
                <select 
                    value={settings.concept}
                    onChange={(e) => updateSettings({ concept: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-xs dark:text-white outline-none"
                >
                    {VISUAL_CONCEPTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 opacity-50">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optimasi CTR Aktif</span>
        </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="thumbnail-maker"
      title="GeGe Thumbnail Maker"
      description="Refined for performance. Ciptakan thumbnail yang memicu klik dengan pengaturan tipografi profesional dan psikologi visual."
      promptPrefix={promptPrefix}
      requireImage={false}
      mainImageLabel="Subjek Utama (Opsional)"
      allowReferenceImage={true}
      referenceImageLabel="Referensi Gaya (Opsional)"
      extraControls={extraControls}
      batchModeAvailable={true}
      defaultAspectRatio="16:9"
      customPromptGenerator={handleBrainstormScene}
      initialState={initialState?.generator}
      onStateChange={(state) => onStateChange?.({ 
          history, 
          historyIndex,
          generator: state 
      })}
    />
  );
};
