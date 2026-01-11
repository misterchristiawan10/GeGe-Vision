
import React, { useState, useEffect, useRef } from 'react';
// @google/genai-api:fix - Add 'Settings' to lucide-react imports. Fixed duplicate ImageIcon names.
import { Copy, RefreshCw, Sparkles, Zap, Layout, Palette, Image as UIImage, Monitor, ChevronDown, Check, Wand2, CloudRain, MapPin, Loader2, CloudLightning, Sun, Cloud, ArrowRight, Type, PenTool, Calendar, Users, Target, Search, List, Download, ImageIcon, Gauge, X, ZoomIn, BarChart3, RotateCcw, RotateCw, Settings } from 'lucide-react';
import { generateCreativeImage, refineUserPrompt } from '../../services/geminiService';
import { ErrorPopup } from '../ErrorPopup';

interface InfografisProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const INFO_TYPES = [
  { id: 'timeline', label: 'Timeline / Kronologis', desc: 'Urutan waktu kejadian', details: 'A horizontal linear progression showcasing chronological milestones. Use clear time markers, connecting lines, and sequential data points to narrate the history or evolution.' },
  { id: 'flowchart', label: 'Flowchart / Proses', desc: 'Langkah-langkah sistematis', details: 'A complex system diagram with interconnected nodes, decision trees, and directional arrows. The layout should visualize a step-by-step workflow or algorithm with logical branching.' },
  { id: 'comparison', label: 'Perbandingan (Vs)', desc: 'Membandingkan dua hal atau lebih', details: 'A split-screen symmetrical composition. Use contrasting colors to differentiate two distinct subjects. Feature side-by-side data tables, radar charts, and pros/cons lists for direct comparison.' },
  { id: 'statistical', label: 'Statistik / Data Viz', desc: 'Grafik batang, pie chart, data berat', details: 'A data-heavy visualization focused on quantitative accuracy. Incorporate bar charts, donut graphs, and scatter plots. Use bold typography for key percentages and a clean grid layout.' },
  { id: 'anatomical', label: 'Anatomi / Bedah Komponen', desc: 'Menjelaskan bagian-bagian objek', details: 'An exploded view diagram showing internal components. Use leader lines with detailed labels to deconstruct the subject into its parts. Technical and precise illustrative style.' },
  { id: 'roadmap', label: 'Roadmap / Peta Jalan', desc: 'Rencana masa depan atau strategi', details: 'A winding path visualization representing a strategic journey. Mark key phases (Q1, Q2, etc.) as checkpoints along the route. Gamified aesthetic with start and end goals.' },
  { id: 'hierarchy', label: 'Hierarki / Struktur', desc: 'Piramida atau struktur organisasi', details: 'A tiered pyramid or tree structure layout. visualizes authority levels or categorization from top-down or bottom-up. Clear separation between layers using shades of color.' },
  { id: 'mindmap', label: 'Mind Map', desc: 'Hubungan ide yang bercabang', details: 'A network diagram with a central core concept and radiating branches. Organic connections linking related sub-topics. Use color coding to group thematic clusters.' },
  { id: 'cycle', label: 'Siklus / Loop', desc: 'Proses yang berulang', details: 'A circular flow diagram representing an infinite loop or closed system. Use rotational symmetry and arrows indicating continuous movement or recycling processes.' },
  { id: 'list', label: 'List / Daftar', desc: 'Daftar poin penting', details: 'A structured vertical listicle layout. Use stylized bullets, numbered icons, or cards to organize key points. Ensure high readability with ample whitespace between items.' },
];

const ART_STYLES = [
  { id: 'isometric', label: '3D Isometric', keyword: 'isometric 3D render, blender style, clean hard shadows, orthographic camera view, floating elements, 3d assets', lighting: 'Soft studio lighting' },
  { id: 'clay', label: 'Claymorphism (3D Clay)', keyword: 'claymorphism, soft clay 3d, rounded shapes, matte plastic finish, cute 3d style, playful aesthetics, soft studio lighting', lighting: 'Soft ambient lighting' },
  { id: 'flat', label: 'Flat Design Modern', keyword: 'flat vector art, corporate memphis style, minimalist, clean lines, solid colors, no gradients, geometric shapes', lighting: 'Flat lighting' },
  { id: 'sketch', label: 'Hand-Drawn Sketch', keyword: 'technical hand-drawn sketch, blueprint aesthetic, white lines on blue background, graphite texture, rough pencil strokes', lighting: 'None' },
  { id: 'neon', label: 'Cyberpunk / Neon', keyword: 'futuristic HUD interface, neon glowing lines, dark mode data visualization, grid background, cybernetic aesthetics, hologram effect', lighting: 'Neon glow' },
  { id: 'paper', label: 'Paper Cutout', keyword: 'layered paper craft style, depth of field, origami textures, shadow depth, collage art, tactile feel', lighting: 'Hard shadows' },
  { id: 'vintage', label: 'Vintage / Retro', keyword: 'vintage poster style, grain texture, muted colors, 1950s infographic, worn paper texture, retro typography', lighting: 'Warm vintage' },
  { id: 'glassmorphism', label: 'Glassmorphism', keyword: 'glassmorphism UI, frosted glass effect, translucent layers, modern UI, blur background, vivid gradients behind glass', lighting: 'Backlit' },
  { id: 'pixel', label: 'Pixel Art', keyword: 'pixel art style, 8-bit graphics, retro game ui, blocky aesthetic, dithering patterns', lighting: 'None' },
  { id: 'bauhaus', label: 'Bauhaus / Geometric', keyword: 'bauhaus design style, abstract geometric shapes, bold primary colors, diagonal composition, minimalist architecture', lighting: 'Flat' },
  { id: 'watercolor', label: 'Watercolor / Cat Air', keyword: 'watercolor painting style, soft edges, artistic splashes, paper texture, wet-on-wet technique', lighting: 'Natural' },
  { id: 'lowpoly', label: 'Low Poly', keyword: 'low poly art, polygon mesh, sharp edges, geometric 3d, minimalist 3d, faceted shading', lighting: 'Low poly shading' },
  { id: 'blueprint', label: 'Technical Blueprint', keyword: 'architectural blueprint, technical schematic, white lines on blue grid, engineering drawing style', lighting: 'None' },
  { id: 'popart', label: 'Pop Art', keyword: 'pop art style, comic book dots, halftone patterns, bold outlines, vibrant contrast, ben-day dots', lighting: 'Hard contrast' },
];

const COLOR_PALETTES = [
  { id: 'vibrant', label: 'Vibrant & Pop', keyword: 'vibrant saturated colors, high contrast, bold primary colors (Cyan, Magenta, Yellow)' },
  { id: 'corporate', label: 'Corporate Blue & Grey', keyword: 'professional business palette, shades of blue and slate grey, clean white background, trustworthy' },
  { id: 'bmkg', label: 'BMKG Official (Green/Blue)', keyword: 'meteorological map colors, green for land, blue for ocean, heat map gradient (blue-green-yellow-red)' },
  { id: 'pastel', label: 'Soft Pastels', keyword: 'soft pastel color palette, soothing tones, baby pink, mint green, pale blue, low saturation' },
  { id: 'dark', label: 'Dark Mode', keyword: 'dark mode aesthetics, charcoal background, neon accent colors, high contrast text' },
  { id: 'monochrome', label: 'Monokromatik', keyword: 'monochromatic color scheme, single hue variations, clean and minimal, sophisticated' },
  { id: 'earth', label: 'Earth Tones', keyword: 'natural earth tones, organic colors, olive green, terracotta, beige, brown' },
  { id: 'luxury', label: 'Luxury Gold & Black', keyword: 'luxury color palette, matte black background, metallic gold accents, elegant typography' },
  { id: 'ocean', label: 'Ocean / Cool', keyword: 'cool color palette, deep blues, teal, aquamarine, refreshing and calm' },
  { id: 'sunset', label: 'Sunset / Warm', keyword: 'warm color palette, orange, purple and pink gradients, golden hour lighting' },
  { id: 'retro80s', label: 'Retro 80s / Vaporwave', keyword: 'vaporwave aesthetic, synthwave palette, neon pink, cyan, purple, retro gradient' },
  { id: 'forest', label: 'Forest / Nature', keyword: 'forest palette, deep emerald greens, wood browns, leaf textures, eco-friendly vibe' },
  { id: 'grayscale', label: 'Grayscale / B&W', keyword: 'grayscale, black and white only, high contrast, newspaper print style' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: 'Landscape (16:9)', value: '--ar 16:9' },
  { id: '9:16', label: 'Portrait (Story/Reels)', value: '--ar 9:16' },
  { id: '4:5', label: 'Instagram Feed (4:5)', value: '--ar 4:5' },
  { id: '1:1', label: 'Square (1:1)', value: '--ar 1:1' },
  { id: '3:2', label: 'Presentation (3:2)', value: '--ar 3:2' },
  { id: '21:9', label: 'Ultrawide (21:9)', value: '--ar 21:9' },
];

const FONTS = [
  { id: 'auto', label: '✨ Otomatis (AI Decision)', keyword: 'typography matching the art style' },
  { id: 'sans', label: 'Modern Sans Serif (Clean)', keyword: 'modern sans-serif typography, Helvetica or Roboto style, clean and legible' },
  { id: 'serif', label: 'Elegant Serif (Classic)', keyword: 'elegant serif typography, Times New Roman or Garamond style, editorial look' },
  { id: 'futuristic', label: 'Futuristic / Sci-Fi', keyword: 'futuristic sci-fi font, techno typography, digital glitch text effects' },
  { id: 'hand', label: 'Handwritten / Marker', keyword: 'handwritten marker font, casual script, organic typography, notebook style' },
  { id: 'bold', label: 'Bold Impact (Headline)', keyword: 'bold impact font, thick heavy typography, headline style, commanding' },
  { id: 'mono', label: 'Monospace (Code/Tech)', keyword: 'monospace typewriter font, coding style typography, technical data look' },
];

const WRITING_STYLES = [
  { id: 'auto', label: '✨ Otomatis (Sesuai Topik)', keyword: 'neutral and informative tone' },
  { id: 'pro', label: 'Profesional & Formal', keyword: 'professional corporate tone, formal business language, executive summary style' },
  { id: 'casual', label: 'Casual & Friendly', keyword: 'casual friendly tone, easy to understand, approachable, conversational' },
  { id: 'academic', label: 'Akademis & Detail', keyword: 'academic scientific tone, detailed analysis, dense information, data-driven' },
  { id: 'witty', label: 'Witty & Fun', keyword: 'witty humorous tone, fun and engaging, creative copywriting, punchy' },
  { id: 'minimal', label: 'Minimalis (To-the-point)', keyword: 'minimalist concise tone, bullet points only, very little text, visual focus' },
  { id: 'persuasive', label: 'Persuasif (Marketing)', keyword: 'persuasive marketing tone, selling points, call to action focus, promotional' },
];

const TARGET_AUDIENCES = [
  { id: 'general', label: 'Umum (General Public)', keyword: 'designed for a general audience, easy to read for everyone' },
  { id: 'kids', label: 'Anak-anak (Kids/Students)', keyword: 'designed for kids, playful, colorful, educational, large text, simple concepts' },
  { id: 'pro', label: 'Profesional / C-Level', keyword: 'designed for business professionals, executive summary style, sophisticated, high-level data' },
  { id: 'tech', label: 'Tech Savvy / Developer', keyword: 'designed for tech enthusiasts, complex diagrams, schematic look, detailed specs' },
  { id: 'elderly', label: 'Lansia (Senior Friendly)', keyword: 'high accessibility design, large text, high contrast, clear visual hierarchy' },
  { id: 'social', label: 'Pengguna Medsos (Gen Z)', keyword: 'trendy, aesthetically pleasing, instagrammable, catchy visuals, social media optimized' },
];

const INFOGRAPHIC_GOALS = [
  { id: 'educate', label: 'Edukasi / Penjelasan', keyword: 'educational purpose, clear explanation, step-by-step breakdown, learning aid' },
  { id: 'market', label: 'Marketing / Promosi', keyword: 'marketing material, persuasive design, highlighting unique selling points, brand focus' },
  { id: 'viral', label: 'Viral / Shareable', keyword: 'highly shareable content, shock value, emotional impact, eye-catching design' },
  { id: 'report', label: 'Laporan / Data', keyword: 'data reporting, accuracy focused, clean charts, objective presentation, dashboard style' },
  { id: 'guide', label: 'Panduan / Tutorial', keyword: 'instructional guide, instructional design, how-to format, clear sequence' },
];

const CITY_COORDINATES: Record<string, { lat: number, lon: number }> = {
  "Jakarta": { lat: -6.2088, lon: 106.8456 }, "Surabaya": { lat: -7.2575, lon: 112.7521 }, "Bandung": { lat: -6.9175, lon: 107.6191 }, "Medan": { lat: 3.5952, lon: 98.6722 }, "Semarang": { lat: -6.9667, lon: 110.4167 }, "Makassar": { lat: -5.1477, lon: 119.4327 }, "Palembang": { lat: -2.9909, lon: 104.7567 }, "Denpasar": { lat: -8.6705, lon: 115.2126 }, "Yogyakarta": { lat: -7.7956, lon: 110.3695 }, "Balikpapan": { lat: -1.2379, lon: 116.8529 }, "Jayapura": { lat: -2.5000, lon: 140.7000 }, "Manado": { lat: 1.4748, lon: 124.8428 }, "Padang": { lat: -0.9471, lon: 100.4172 }, "Banda Aceh": { lat: 5.5483, lon: 95.3238 }, "Pontianak": { lat: -0.0263, lon: 109.3425 }
};
const INDONESIAN_CITIES = Object.keys(CITY_COORDINATES);

const getWeatherDescription = (code: number) => {
  if (code === 0) return "Cerah (Clear Sky)";
  if ([1, 2, 3].includes(code)) return "Berawan (Cloudy)";
  if ([45, 48].includes(code)) return "Berkabut (Foggy)";
  if ([51, 53, 55].includes(code)) return "Gerimis (Drizzle)";
  if ([61, 63, 65].includes(code)) return "Hujan (Rain)";
  if ([80, 81, 82].includes(code)) return "Hujan Deras (Heavy Rain)";
  if ([95, 96, 99].includes(code)) return "Hujan Petir (Thunderstorm)";
  return "Berawan (Cloudy)";
};

const getIndonesianDate = () => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('id-ID', options);
};

const Dropdown = ({ label, icon: Icon, options, value, onChange, isDarkMode }: any) => (
  <div>
      <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {Icon && <Icon size={14} />} {label}
      </div>
      <div className="relative">
          <select 
              value={value.id}
              onChange={(e) => onChange(options.find((o: any) => o.id === e.target.value))}
              className={`w-full p-2.5 text-sm rounded-lg border appearance-none outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${
                  isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-900' 
                  : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-indigo-100'
              }`}
          >
              {options.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className={`absolute right-3 top-3.5 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
      </div>
  </div>
);

interface SettingsState {
    isWeatherMode: boolean;
    topic: string;
    manualPrompt: string;
    selectedCity: string;
    selectedType: any;
    selectedStyle: any;
    selectedPalette: any;
    selectedFont: any;
    selectedTone: any;
    selectedTarget: any;
    selectedGoal: any;
    aspectRatio: any;
    imageSize: string;
    isEnhanced: boolean;
    promptFormat: string;
}

export const InfografisModule: React.FC<InfografisProps> = ({ initialState, onStateChange }) => {
  const isHydrated = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [settings, setSettingsState] = useState<SettingsState>({
    isWeatherMode: false,
    topic: '',
    manualPrompt: '',
    selectedCity: INDONESIAN_CITIES[0],
    selectedType: INFO_TYPES[0],
    selectedStyle: ART_STYLES[2],
    selectedPalette: COLOR_PALETTES[1],
    selectedFont: FONTS[0], 
    selectedTone: WRITING_STYLES[0],
    selectedTarget: TARGET_AUDIENCES[0],
    selectedGoal: INFOGRAPHIC_GOALS[0],
    aspectRatio: ASPECT_RATIOS[0],
    imageSize: '2K',
    isEnhanced: true, 
    promptFormat: 'gemini',
  });
  
  const [isManualCityInput, setIsManualCityInput] = useState(false);
  const [realTimeWeather, setRealTimeWeather] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Settings History
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    if (isHydrated.current) {
        const newHistory = [...history.slice(0, historyIndex + 1), updated].slice(-20);
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

  useEffect(() => {
    if (initialState && !isHydrated.current) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            setSettingsState(initialState.history[newIndex]);
        }
        setResultImage(initialState.resultImage || null);
        isHydrated.current = true;
    } else if (!initialState && !isHydrated.current) {
        setHistory([settings]);
        setHistoryIndex(0);
        isHydrated.current = true;
    }
  }, [initialState]);

  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({
            history,
            historyIndex,
            resultImage,
        });
    }
  }, [history, historyIndex, resultImage]);

  const { isWeatherMode, topic, manualPrompt, selectedCity, selectedType, selectedStyle, selectedPalette, selectedFont, selectedTone, selectedTarget, selectedGoal, aspectRatio, imageSize, isEnhanced, promptFormat } = settings;

  useEffect(() => {
    setCurrentDate(getIndonesianDate());
  }, []);

  useEffect(() => {
    if (isWeatherMode && selectedCity) {
      const timeoutId = setTimeout(async () => {
        setIsLoadingWeather(true);
        try {
          let lat, lon;
          if (CITY_COORDINATES[selectedCity]) {
            lat = CITY_COORDINATES[selectedCity].lat;
            lon = CITY_COORDINATES[selectedCity].lon;
          } else {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(selectedCity)}&count=1&language=id&format=json`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
              lat = geoData.results[0].latitude;
              lon = geoData.results[0].longitude;
            } else {
              throw new Error("Kota tidak ditemukan di satelit");
            }
          }

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FBangkok`
          );
          const data = await response.json();
          if (data.current_weather) {
            setRealTimeWeather({
              temp: data.current_weather.temperature,
              desc: getWeatherDescription(data.current_weather.weathercode),
              wind: data.current_weather.windspeed
            });
          }
        } catch (error) {
          console.error("Gagal mengambil data cuaca:", error);
          setRealTimeWeather({ temp: 30, desc: "Cerah (Data Tidak Ditemukan)", wind: 10 });
        } finally {
          setIsLoadingWeather(false);
        }
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCity, isWeatherMode]);

  const toggleWeatherMode = () => {
    const newMode = !isWeatherMode;
    if (newMode) {
        updateSettings({ 
            isWeatherMode: newMode,
            selectedPalette: COLOR_PALETTES[2],
            selectedType: { id: 'weather', label: 'Peta Cuaca (BMKG)', desc: '', details: '' }
        });
    } else {
        updateSettings({
            isWeatherMode: newMode,
            selectedPalette: COLOR_PALETTES[1],
            selectedType: INFO_TYPES[0]
        });
    }
  };

  useEffect(() => {
    if (isProcessing) return; 
    buildPrompt();
  }, [settings]);

  const buildPrompt = () => {
    const today = getIndonesianDate();
    let base = '';
    let topicDescription = '';
    
    if (isWeatherMode) {
      const weatherData = realTimeWeather 
        ? `${realTimeWeather.desc}, ${realTimeWeather.temp}°C, Wind ${realTimeWeather.wind}km/h`
        : "Loading weather data...";
      topicDescription = `Subject: Professional Real-Time Weather Forecast Infographic for ${selectedCity}, Indonesia. Date: "${today}". Data: ${weatherData}.`;
    } else {
      const safeTopic = topic || 'General Knowledge';
      topicDescription = `Subject: A comprehensive ${selectedType.label} regarding "${safeTopic}".`;
    }

    const layoutDetails = isWeatherMode 
        ? `Layout: Meteorological map focused on ${selectedCity}, displaying the date "${today}", authentic temperature and condition icons. BMKG style inspiration.`
        : `Layout: ${selectedType.details} The composition should be balanced, guiding the viewer's eye through the ${selectedType.label} structure logicaly.`;

    const styleDetails = `Art Style: ${selectedStyle.keyword}. Lighting: ${selectedStyle.lighting}. Materials: High fidelity textures.`;
    const colorDetails = `Color Palette: ${selectedPalette.keyword}. Visual Hierarchy: Use color to distinguish key data points.`;
    const fontDetails = selectedFont.id !== 'auto' ? ` Typography: ${selectedFont.keyword}.` : '';
    const toneDetails = selectedTone.id !== 'auto' ? ` Tone: ${selectedTone.keyword}.` : '';
    const targetDetails = !isWeatherMode ? ` Target Audience: ${selectedTarget.keyword}. Goal: ${selectedGoal.keyword}.` : '';

    const manualInjection = manualPrompt ? ` CUSTOM INSTRUCTIONS: ${manualPrompt}.` : '';
    
    if (promptFormat === 'midjourney') {
        base = `/imagine prompt: ${topicDescription} ${layoutDetails} ${styleDetails} ${colorDetails} ${fontDetails} ${manualInjection} ${aspectRatio.value} --v 6.0`;
    } else if (promptFormat === 'dalle') {
        base = `Create a high quality infographic. ${topicDescription} ${layoutDetails} ${styleDetails} ${colorDetails} ${manualInjection}`;
    } else {
        base = `**Subject:** ${topic || (isWeatherMode ? selectedCity : 'Topic')}\n**Description:** ${topicDescription}\n**Format:** ${selectedType.label} (${isWeatherMode ? 'Map' : selectedType.details})\n**Style:** ${selectedStyle.label}\n**Visual Keywords:** ${selectedStyle.keyword}\n**Color Scheme:** ${selectedPalette.label} (\${selectedPalette.keyword})\n**Typography:** ${selectedFont.label}\n**Target:** ${selectedTarget.label}\n**Aspect Ratio:** ${aspectRatio.label}\n**Custom Instructions:** ${manualPrompt || 'None'}\n\n**Detailed Directive:**\nPlease generate a highly detailed and data-rich visualization. The layout should strictly follow the logic of a ${isWeatherMode ? 'Meteorological Map' : selectedType.label}. Use the specified art style to create a unique aesthetic. Ensure the background provides good contrast for the data elements.`;
    }

    setGeneratedPrompt(base);
  };

  const activateGeminiMagic = async () => {
    setIsProcessing(true);
    try {
        const baseTopic = topic || (isWeatherMode ? `Cuaca ${selectedCity}` : 'Infografis Umum');
        
        let promptContext = `Buatkan konsep visual infografis yang sangat detail, kreatif, dan profesional tentang: ${baseTopic}. Target audiens: ${selectedTarget.label}. Gaya: ${selectedStyle.label}.`;
        
        if (manualPrompt && manualPrompt.trim().length > 0) {
             promptContext += `\n\n[PENTING] Instruksi Tambahan User: "${manualPrompt}". Pastikan instruksi ini diintegrasikan dengan baik ke dalam deskripsi visual.`;
        }

        const refinedTopic = await refineUserPrompt(promptContext);
        
        updateSettings({ manualPrompt: refinedTopic });

    } catch (e) {
        console.error("Magic fail", e);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleGenerateImage = async () => {
    if (!generatedPrompt) return;
    setIsGeneratingImage(true);
    setGenError(null);
    setResultImage(null);
    
    try {
      const ar = aspectRatio.id;
      const result = await generateCreativeImage(generatedPrompt, null, ar, imageSize);
      setResultImage(result);
    } catch (e: any) {
      console.error(e);
      setGenError(e.message || "Gagal membuat infografis.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRandomize = () => {
    if (isWeatherMode) return; 
    updateSettings({
        selectedType: INFO_TYPES[Math.floor(Math.random() * INFO_TYPES.length)],
        selectedStyle: ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)],
        selectedPalette: COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)],
        selectedFont: FONTS[Math.floor(Math.random() * FONTS.length)],
        selectedTone: WRITING_STYLES[Math.floor(Math.random() * WRITING_STYLES.length)],
        selectedTarget: TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)],
        selectedGoal: INFOGRAPHIC_GOALS[Math.floor(Math.random() * INFOGRAPHIC_GOALS.length)],
    });
  };

  const bgMain = 'bg-slate-50 dark:bg-dark-bg';
  const textMain = 'text-slate-800 dark:text-slate-100';
  const cardBg = 'bg-white dark:bg-dark-card';
  const cardBorder = 'border-slate-100 dark:border-slate-700';

  return (
    <div className={`font-sans selection:bg-rose-200 transition-colors duration-300 animate-fade-in ${bgMain} ${textMain}`}>
      
      {viewImage && (
        <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" 
            onClick={() => setViewImage(null)}
        >
           <button 
                onClick={() => setViewImage(null)} 
                className="fixed top-6 right-6 text-white hover:text-red-400 z-[210] p-3 bg-black/60 rounded-full border border-white/20 shadow-lg hover:bg-black/80 transition-all"
           >
              <X size={32}/>
           </button>
           
           <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={viewImage} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Full Preview" />
              <div className="mt-4 flex gap-4">
                 <a href={viewImage} download={`infografis-${Date.now()}.png`} className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors">
                    <Download size={20}/> Unduh HD
                 </a>
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Infografis</h2>
            <p className="text-gray-500 dark:text-gray-400">Punya data tapi bingung cara nampilinnya? Biar AI yang bikinin infografis keren & mudah dibaca.</p>
          </div>
          <button 
                onClick={toggleWeatherMode}
                className={`relative px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                    isWeatherMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : `border ${isDarkMode ? 'border-rose-500/50 text-rose-400 hover:bg-rose-900/20' : 'border-rose-200 text-rose-500 hover:bg-rose-50'} bg-transparent`
                }`}
            >
                {isWeatherMode ? <><ArrowRight size={16} /> Kembali</> : <><CloudRain size={16} /> Mode Cuaca</>}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        
        <div className="lg:col-span-5 space-y-6">
          
          <section className={`p-6 rounded-2xl shadow-sm border transition-all duration-500 flex flex-col ${
            isWeatherMode 
              ? isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50/50 border-blue-100' 
              : `${cardBg} ${cardBorder}`
          }`}>
            {isWeatherMode ? (
              <div className="space-y-4 animate-fade-in">
                <div className={`flex items-center justify-between font-bold border-b pb-2 mb-2 ${isDarkMode ? 'text-blue-400 border-blue-800' : 'text-blue-700 border-blue-200'}`}>
                   <div className="flex items-center gap-2">
                      <CloudRain size={20} />
                      <span>Data Cuaca Real-Time</span>
                   </div>
                   {isLoadingWeather && <div className="text-xs font-normal opacity-70 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Mengambil data...</div>}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 flex items-center justify-between gap-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-800/60'}`}>
                      <div className="flex items-center gap-1"><MapPin size={12}/> {isManualCityInput ? "Ketik Nama Kota" : "Pilih Kota"}</div>
                      <button 
                        onClick={() => {
                          setIsManualCityInput(!isManualCityInput);
                          updateSettings({ selectedCity: !isManualCityInput ? '' : INDONESIAN_CITIES[0] });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                          isDarkMode 
                            ? 'bg-blue-900 border-blue-700 hover:bg-blue-800 text-blue-200' 
                            : 'bg-white border-blue-200 hover:bg-blue-50 text-blue-600'
                        }`}
                      >
                        {isManualCityInput ? <><List size={10}/> Pilih Daftar</> : <><PenTool size={10}/> Input Manual</>}
                      </button>
                    </label>

                    <div className="relative">
                      {isManualCityInput ? (
                        <div className="relative">
                           <input
                            type="text"
                            value={selectedCity}
                            onChange={(e) => updateSettings({ selectedCity: e.target.value })}
                            placeholder="Contoh: Malang, Bukittinggi..."
                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition-all font-medium pr-10 ${
                              isDarkMode 
                                ? 'bg-slate-800 border-blue-900 text-blue-100 focus:border-blue-500 focus:ring-blue-900/50' 
                                : 'bg-white border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-100'
                            }`}
                          />
                          <Search size={16} className={`absolute right-3 top-3.5 pointer-events-none ${isDarkMode ? 'text-blue-500' : 'text-blue-300'}`} />
                        </div>
                      ) : (
                        <div className="relative">
                          <select 
                            value={selectedCity}
                            onChange={(e) => updateSettings({ selectedCity: e.target.value })}
                            className={`w-full p-3 rounded-xl appearance-none focus:ring-2 outline-none font-medium transition-colors ${
                              isDarkMode 
                                ? 'bg-slate-800 border-blue-900 text-blue-100 focus:border-blue-500 focus:ring-blue-900/50' 
                                : 'bg-white border-blue-200 text-blue-900 focus:border-blue-400 focus:ring-blue-100'
                            }`}
                          >
                            {INDONESIAN_CITIES.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className={`absolute right-3 top-3.5 pointer-events-none ${isDarkMode ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                   <div>
                      <span className="text-xs text-blue-400">Tanggal</span>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentDate.split(',')[1]}</p>
                   </div>
                   <div>
                      <span className="text-xs text-blue-400">Temperatur</span>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{realTimeWeather?.temp ?? '--'}°C</p>
                   </div>
                   <div>
                      <span className="text-xs text-blue-400">Kondisi</span>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{realTimeWeather?.desc ?? '--'}</p>
                   </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                      <Target size={20} className="text-rose-500" />
                      <span>Topik & Konten</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-rose-500"><RotateCcw size={16}/></button>
                      <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-rose-500"><RotateCw size={16}/></button>
                   </div>
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateSettings({ topic: e.target.value })}
                    placeholder="Contoh: Cara Kerja Fotosintesis, Sejarah Kopi..."
                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 transition-all font-medium ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-rose-500 focus:ring-rose-900/50' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-400 focus:ring-rose-100'
                    }`}
                  />
                  <div className="absolute right-3 top-3.5 flex items-center gap-2">
                     <button onClick={handleRandomize} className={`p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors ${isDarkMode ? 'text-rose-500' : 'text-rose-400'}`} title="Acak Semua">
                        <RefreshCw size={16} />
                     </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Dropdown label="Tipe Infografis" icon={Layout} options={INFO_TYPES} value={selectedType} onChange={(v: any) => updateSettings({ selectedType: v })} isDarkMode={isDarkMode} />
                  <Dropdown label="Gaya Artistik" icon={Palette} options={ART_STYLES} value={selectedStyle} onChange={(v: any) => updateSettings({ selectedStyle: v })} isDarkMode={isDarkMode} />
                </div>
              </div>
            )}
          </section>

          <section className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 space-y-6 ${cardBg} ${cardBorder}`}>
             <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white border-b pb-3">
                <Settings size={20} className="text-indigo-500" />
                <span>Pengaturan Lanjutan</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown label="Palet Warna" icon={Palette} options={COLOR_PALETTES} value={selectedPalette} onChange={(v: any) => updateSettings({ selectedPalette: v })} isDarkMode={isDarkMode} />
                <Dropdown label="Tipografi" icon={Type} options={FONTS} value={selectedFont} onChange={(v: any) => updateSettings({ selectedFont: v })} isDarkMode={isDarkMode} />
                <Dropdown label="Gaya Penulisan" icon={PenTool} options={WRITING_STYLES} value={selectedTone} onChange={(v: any) => updateSettings({ selectedTone: v })} isDarkMode={isDarkMode} />
                <Dropdown label="Target Audiens" icon={Users} options={TARGET_AUDIENCES} value={selectedTarget} onChange={(v: any) => updateSettings({ selectedTarget: v })} isDarkMode={isDarkMode} />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Dropdown label="Tujuan Utama" icon={Target} options={INFOGRAPHIC_GOALS} value={selectedGoal} onChange={(v: any) => updateSettings({ selectedGoal: v })} isDarkMode={isDarkMode} />
                <Dropdown label="Rasio Aspek" icon={Monitor} options={ASPECT_RATIOS} value={aspectRatio} onChange={(v: any) => updateSettings({ aspectRatio: v })} isDarkMode={isDarkMode} />
             </div>

             <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                   <label className={`block text-xs font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>INSTRUKSI TAMBAHAN (OPTIONAL)</span>
                      {isProcessing && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                   </label>
                   <div className="relative">
                      <textarea
                        value={manualPrompt}
                        onChange={(e) => updateSettings({ manualPrompt: e.target.value })}
                        placeholder="Contoh: Tambahkan maskot kelinci, buat suasana futuristik..."
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 h-24 resize-none transition-all ${
                            isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-900/50' 
                            : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-indigo-100'
                        }`}
                      />
                      <button 
                        onClick={activateGeminiMagic}
                        disabled={isProcessing}
                        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
                            isDarkMode ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        title="AI Magic - Sempurnakan Prompt"
                      >
                         <Wand2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                       <BarChart3 size={16} className="text-emerald-500" />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Resolusi Output</span>
                    </div>
                    <select 
                      value={imageSize} 
                      onChange={(e) => updateSettings({ imageSize: e.target.value })}
                      className="bg-transparent text-xs font-bold text-slate-700 dark:text-white outline-none"
                    >
                       <option value="1K">1K (Fast)</option>
                       <option value="2K">2K (Detail)</option>
                       <option value="4K">4K (Ultra)</option>
                    </select>
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-7 space-y-6">
           <div className={`p-6 rounded-2xl shadow-xl border h-full flex flex-col relative overflow-hidden transition-all duration-700 ${
              isGeneratingImage 
              ? 'bg-slate-100 dark:bg-slate-800' 
              : resultImage ? 'bg-black border-slate-800' : `${cardBg} ${cardBorder}`
           }`}>
              
              {isGeneratingImage ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center z-10">
                   <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse backdrop-blur-sm"></div>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-bold text-indigo-500 animate-pulse">Meracik Infografis...</h4>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">AI sedang menganalisis data dan mendesain tata letak visual terbaik untuk Anda.</p>
                   </div>
                </div>
              ) : resultImage ? (
                <div className="flex-1 flex flex-col animate-fade-in group cursor-pointer" onClick={() => setViewImage(resultImage)}>
                   <div className="relative flex-1 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden shadow-inner">
                      <img src={resultImage} alt="Infografis Result" className="max-w-full max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div className="p-4 bg-black/60 rounded-full text-white backdrop-blur shadow-2xl border border-white/20 transform scale-90 group-hover:scale-100 transition-all">
                            <ZoomIn size={32} />
                         </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                         <a href={resultImage} download={`infografis-${Date.now()}.png`} className="px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-slate-100 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Download size={14} /> Simpan Gambar
                         </a>
                      </div>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleGenerateImage(); }}
                     className="mt-4 w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                   >
                     <RefreshCw size={18} /> Regenerasi Desain
                   </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[400px]">
                   <BarChart3 size={64} className="mb-4" />
                   <p className="text-lg font-medium">Hasil Desain Muncul Di Sini</p>
                   <p className="text-xs">Konfigurasi data Anda dan klik tombol Generate.</p>
                </div>
              )}

              {genError && (
                 <div className="absolute inset-0 bg-red-950/20 backdrop-blur-sm flex items-center justify-center p-6 z-20">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl text-center max-w-sm border-2 border-red-500">
                       <h4 className="text-red-500 font-black text-xl mb-2">OOPS! ADA MASALAH</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">{genError}</p>
                       <button onClick={handleGenerateImage} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                          <RefreshCw size={16} /> Coba Sekali Lagi
                       </button>
                    </div>
                 </div>
              )}
           </div>

           {!resultImage && !isGeneratingImage && (
             <div className="animate-fade-in-up">
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || isProcessing}
                  className="w-full py-5 bg-gradient-to-r from-rose-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-900/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  <Sparkles size={24} className="group-hover:animate-spin" />
                  GENERATE INFOGRAFIS
                </button>
             </div>
           )}

           <div className={`p-6 rounded-2xl border ${cardBg} ${cardBorder} shadow-sm animate-fade-in`}>
              <div className="flex justify-between items-center mb-4">
                 <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Prompt Metadata (Auto-Generated)</h4>
                 <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {['gemini', 'midjourney', 'dalle'].map(f => (
                       <button 
                         key={f} 
                         onClick={() => updateSettings({ promptFormat: f })}
                         className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase transition-all ${promptFormat === f ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
                       >
                          {f}
                       </button>
                    ))}
                 </div>
              </div>
              <div className={`relative p-4 rounded-xl text-xs font-mono border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                 <div className="pr-10 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {generatedPrompt || 'Menunggu data...'}
                 </div>
                 <button 
                   onClick={handleCopy}
                   className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-900'}`}
                   title="Salin Prompt"
                 >
                    <Copy size={16} />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-fade-in flex items-center gap-2 border border-white/10">
           <Check size={18} className="text-emerald-500" /> Prompt Berhasil Disalin!
        </div>
      )}
    </div>
  );
};
