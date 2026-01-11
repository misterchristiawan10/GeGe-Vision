

import React, { useState, useEffect } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { generateCreativeImage } from '../../services/geminiService';
import { RotateCcw, RotateCw } from 'lucide-react';

// --- PREWEDDING SPECIFIC CONSTANTS ---

const THEMES = [
  "✨ Auto (Recommended)",
  "Korean Minimalist Studio (Clean & Soft)",
  "Elegant Classic (Timeless & Luxury)",
  "Rustic Bohemian (Nature & Earthy)",
  "Cinematic Street Style (Candid & Urban)",
  "Fairytale Fantasy (Dreamy & Magical)",
  "Vintage Retro (Film Grain & Nostalgic)",
  "Traditional Modern Fusion (Cultural Blend)",
  "Dark & Moody (Dramatic & Intense)",
  "Beach Sunset (Golden Hour & Airy)"
];

const OUTFITS = [
  "✨ Auto (Matches Theme)",
  "Bridal Gown & Formal Suit (Classic White/Black)",
  "Casual Matching Earth Tones (Beige/Brown/Sage)",
  "Smart Casual (Blazer & Dress)",
  "Black Formal (Elegant Evening Wear)",
  "Traditional Kebaya & Batik (Indonesian Style)",
  "Hanbok Modern (Korean Style)",
  "Kimono (Japanese Style)",
  "Streetwear (Hypebeast)",
];

const LOCATIONS = [
  "Studio Foto Minimalis",
  "Pantai saat Matahari Terbenam",
  "Hutan Pinus yang Sejuk",
  "Puncak Gunung dengan Pemandangan",
  "Taman Bunga Mekar",
  "Jalanan Kota Malam Hari (Neon Lights)",
  "Kafe Estetik dengan Interior Kayu",
  "Bangunan Tua Bersejarah",
  "Di atas Kapal Yacht Mewah",
  "Padang Rumput Savana Luas"
];

const POSES = [
  "✨ Auto (AI Pose)",
  "Berpelukan dari belakang",
  "Saling menatap mesra",
  "Bergandengan tangan sambil berjalan",
  "Duduk berdampingan di bangku taman",
  "Pria mencium kening wanita",
  "Pose candid tertawa bersama",
  "Berdiri saling membelakangi dengan gaya",
  "Pria menggendong wanita (piggyback)",
  "Dansa romantis"
];

interface SettingsState {
    theme: string;
    outfit: string;
    location: string;
    pose: string;
}

interface PrewedVirtualModuleProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

export const PrewedVirtualModule: React.FC<PrewedVirtualModuleProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    theme: THEMES[0],
    outfit: OUTFITS[0],
    location: LOCATIONS[0],
    pose: POSES[0],
  });
  
  const [promptPrefix, setPromptPrefix] = useState('');

  // --- Settings History ---
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    const newHistory = [...history.slice(0, historyIndex + 1), updated];
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
    if (initialState?.history && initialState.history.length > 0) {
        setHistory(initialState.history);
        const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
        setHistoryIndex(newIndex);
        setSettingsState(initialState.history[newIndex]);
    } else if (initialState) {
        const loadedSettings = { ...settings, ...initialState };
        setSettingsState(loadedSettings);
        setHistory([loadedSettings]);
        setHistoryIndex(0);
    } else if (history.length === 0) {
        setHistory([settings]);
        setHistoryIndex(0);
    }
  }, [initialState]);

  useEffect(() => {
    if (history.length > 0) {
      onStateChange?.({
        history,
        historyIndex,
        generator: initialState?.generator
      });
    }
  }, [history, historyIndex]);


  useEffect(() => {
    const { theme, outfit, location, pose } = settings;
    const realismHeader = `
      [SYSTEM INSTRUCTION: HYPER-REALISTIC PREWEDDING PHOTOGRAPHY]
      You are a world-class prewedding photographer. Your output MUST be indistinguishable from a real photo shot on a high-end camera (e.g., Sony A7R V with 85mm G-Master lens).
      
      **MANDATORY RULES:**
      1.  **PHOTO-REALISM:** 8K UHD, Crystal Clear, Ultra-Sharp. Visible skin texture (pores, vellus hair), realistic fabric textures.
      2.  **IDENTITY PRESERVATION:** The faces of the couple MUST be an EXACT, 100% IDENTICAL copy of the uploaded reference faces. Do not alter their facial structure, ethnicity, or features.
      3.  **NO CGI/3D LOOK:** The result must NOT look like a 3D render, video game character, or plastic doll. Avoid overly smooth skin.
      
      **NEGATIVE PROMPT (FORBIDDEN):**
      (3d render, cgi, cartoon, anime, drawing), (plastic skin, smooth skin), (blurry, hazy, low quality).
    `;

    const themePrompt = theme === THEMES[0] ? 'A beautiful and romantic prewedding photoshoot.' : `Prewedding photoshoot with a ${theme} theme.`;
    const outfitPrompt = outfit === OUTFITS[0] ? 'The couple wears outfits that perfectly match the theme.' : `The couple is wearing: ${outfit}.`;
    const locationPrompt = `The location is ${location}.`;
    const posePrompt = pose === POSES[0] ? 'Their pose is natural, romantic, and candid, chosen by AI to fit the scene.' : `The couple's pose is: ${pose}.`;

    const fullPrompt = `
      ${realismHeader}
      
      **SCENARIO:**
      ${themePrompt}
      
      **DETAILS:**
      - **Couple:** A man and a woman, based on the uploaded reference photos.
      - **Outfit:** ${outfitPrompt}
      - **Location:** ${locationPrompt}
      - **Pose & Interaction:** ${posePrompt} They show genuine affection and chemistry.
      
      **Final Output:** A masterpiece prewedding photograph, full of emotion and stunning visual quality.
    `;
    setPromptPrefix(fullPrompt);
  }, [settings]);
  
  const renderDropdown = (label: string, value: string, onChange: (val: string) => void, options: string[]) => (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-500 uppercase">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const { theme, outfit, location, pose } = settings;

  const extraControls = (
    <div className="space-y-4">
      <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-rose-500 uppercase">Pengaturan Prewedding</h3>
            <div className="flex items-center gap-2">
                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-3">
            {renderDropdown("Tema Foto", theme, (v) => updateSettings({ theme: v }), THEMES)}
            {renderDropdown("Pakaian / Outfit", outfit, (v) => updateSettings({ outfit: v }), OUTFITS)}
            {renderDropdown("Lokasi", location, (v) => updateSettings({ location: v }), LOCATIONS)}
            {renderDropdown("Pose Pasangan", pose, (v) => updateSettings({ pose: v }), POSES)}
         </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="prewed-virtual"
      title="GeGe Prewed"
      description="Wujudkan foto prewedding impian di lokasi mana pun, tanpa perlu keluar biaya mahal. Romantis & praktis!"
      promptPrefix={promptPrefix}
      requireImage={true} // Couple photos are required.
      mainImageLabel="Wajah Pria (Wajib)"
      allowAdditionalFaceImage={true}
      secondFaceLabel="Wajah Wanita (Wajib)"
      extraControls={extraControls}
      batchModeAvailable={true}
      defaultAspectRatio="3:4"
      customPromptLabel="Prompt Prewedding (Dihasilkan Otomatis)"
      initialState={initialState?.generator}
      onStateChange={(genState) => onStateChange?.({
          history,
          historyIndex,
          generator: genState,
      })}
    />
  );
};
