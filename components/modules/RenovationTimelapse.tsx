
import React, { useState, useEffect, useRef } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { generateCreativeImage, generateRenovationStory } from '../../services/geminiService';
import { 
    Layers, ZoomIn, Download, X, Copy, Check, Sparkles, Loader2, Play, Film,
    Hammer, MapPin, ArrowRight, ClipboardList, PenTool, LayoutTemplate
} from 'lucide-react';

interface RenovationStage {
    id: number;
    url: string | null;
    progress: number;
    label: string;
    loading: boolean;
    skipped?: boolean;
}

interface StoryStructure {
    firstFramePrompt: string;
    timelapseSteps: string[];
}

interface SettingsState {
    mainObject: string;
    initialCondition: string;
    location: string;
    finalResult: string;
    sceneCount: number;
    generationMode: 'all' | 'first_last' | 'first_only';
    story: StoryStructure | null;
}

interface RenovationTimelapseProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const SCENE_OPTIONS = [
    { value: 3, label: '3 Scene (Short)' },
    { value: 5, label: '5 Scene (Standard)' },
    { value: 7, label: '7 Scene (Extended)' },
    { value: 10, label: '10 Scene (Long)' },
    { value: 12, label: '12 Scene (Cinematic)' },
];

const GEN_MODES = [
    { value: 'all', label: 'Semua Scene (Full Timeline)' },
    { value: 'first_last', label: 'Awal & Akhir Saja (Before-After)' },
    { value: 'first_only', label: 'Hanya Gambar Awal (Preview)' },
];

export const RenovationTimelapseModule: React.FC<RenovationTimelapseProps> = ({ initialState, onStateChange }) => {
    const [settings, setSettingsState] = useState<SettingsState>({
        mainObject: 'rumah minimalis 2 lantai',
        initialCondition: 'kotor dan penuh rumput liar',
        location: 'perumahan',
        finalResult: 'menjadi bersih, cat baru warna putih',
        sceneCount: 5,
        generationMode: 'all',
        story: null
    });

    const [stages, setStages] = useState<RenovationStage[]>([]);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);
    const isHydrated = useRef(false);

    // Initial state loading
    useEffect(() => {
        if (initialState && !isHydrated.current) {
            setSettingsState(initialState.settings || settings);
            setStages(initialState.stages || []);
            isHydrated.current = true;
        }
    }, [initialState]);

    // Save state
    useEffect(() => {
        if (isHydrated.current) {
            onStateChange?.({ settings, stages });
        }
    }, [settings, stages]);

    const updateSettings = (newSettings: Partial<SettingsState>) => {
        setSettingsState(prev => ({ ...prev, ...newSettings }));
    };

    const handleCreateStory = async () => {
        if (!settings.mainObject || !settings.initialCondition) return;
        setIsGeneratingStory(true);
        try {
            const story = await generateRenovationStory(
                settings.mainObject,
                settings.initialCondition,
                settings.location,
                settings.finalResult,
                settings.sceneCount
            );
            updateSettings({ story });
        } catch (error) {
            console.error(error);
            alert("Gagal membuat struktur cerita. Coba lagi.");
        } finally {
            setIsGeneratingStory(false);
        }
    };

    const handleCopy = (text: string, index: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCustomGenerate = async (
        prompt: string, 
        ar: string, 
        size: string, 
        isBatch: boolean, 
        count: number,
        baseImage: File | null
    ) => {
        const basePrompt = settings.story ? settings.story.firstFramePrompt : prompt;
        const steps = settings.story ? settings.story.timelapseSteps : ["Mid-renovation", "Final result"];
        const totalCount = steps.length + 1; // First frame + steps

        setIsGeneratingImages(true);
        const newStages: RenovationStage[] = [];
        
        // Initialize Stages UI
        for (let i = 0; i < totalCount; i++) {
            let label = `Step ${i}`;
            if (i === 0) label = "Kondisi Awal (Original)";
            else if (i === totalCount - 1) label = "Hasil Akhir (Final)";
            else label = `Proses Renovasi ${i}`;

            // Check skip logic
            let shouldSkip = false;
            if (settings.generationMode === 'first_only' && i > 0) shouldSkip = true;
            if (settings.generationMode === 'first_last' && i > 0 && i < totalCount - 1) shouldSkip = true;

            newStages.push({
                id: Date.now() + i,
                url: null,
                progress: 0,
                label,
                loading: !shouldSkip,
                skipped: shouldSkip
            });
        }
        setStages(newStages);

        try {
            let previousImageFile: File | null = baseImage;
            
            // Generate First Frame (Index 0)
            // Always generate first frame unless explicitly skipped (which shouldn't happen logic wise usually)
            const firstFrameEnhancedPrompt = `
                [ARCHITECTURAL PHOTOGRAPHY: BEFORE STATE]
                ${basePrompt}
                Technique: Wide angle shot, realistic lighting, highly detailed textures (dust, cracks, debris).
                Quality: 8K, Photorealistic, Raw Photo.
            `;
            
            // FIX: Pass 'ar' (aspect ratio from user selection) instead of hardcoded "16:9"
            const firstRes = await generateCreativeImage(firstFrameEnhancedPrompt, baseImage, ar, size, null, null, false);
            
            // Helper to get file from URL for next steps
            const fetchImage = async (url: string) => {
                const res = await fetch(url);
                const blob = await res.blob();
                return new File([blob], "prev.png", { type: "image/png" });
            };

            // Update UI for First Frame
            setStages(prev => prev.map((s, idx) => idx === 0 ? { ...s, url: firstRes, loading: false } : s));
            previousImageFile = await fetchImage(firstRes);

            // Loop for steps (Index 1 to End)
            for (let i = 0; i < steps.length; i++) {
                const globalIndex = i + 1;
                const isFinal = i === steps.length - 1;
                
                // Check if this step should be generated based on mode
                let shouldGen = true;
                if (settings.generationMode === 'first_only') shouldGen = false;
                if (settings.generationMode === 'first_last' && !isFinal) shouldGen = false;

                if (!shouldGen) {
                    continue; // Skip API call
                }

                // Use strictly specific prompt structure
                const stepPrompt = `
                ${steps[i]}
                STRICT VISUAL RULES:
                1. KEEP same camera angle as previous image.
                2. SHOW PROGRESS based on the prompt description.
                3. High fidelity, 8K resolution.
                `;

                // If we skipped intermediate steps, 'previousImageFile' is still the First Frame.
                // This is good for 'First & Last' comparison to keep the exact same angle/base.
                // FIX: Pass 'ar' (aspect ratio from user selection) instead of hardcoded "16:9"
                const nextRes = await generateCreativeImage(stepPrompt, previousImageFile, ar, size, null, null, false);
                
                setStages(prev => prev.map((s, idx) => idx === globalIndex ? { ...s, url: nextRes, loading: false } : s));
                
                // Update reference ONLY if we are in 'all' mode to chain evolution.
                // If 'first_last', we might want to keep the first frame as ref to ensure the final frame aligns with the start.
                if (settings.generationMode === 'all') {
                    previousImageFile = await fetchImage(nextRes);
                }
            }

        } catch (error) {
            console.error("Generation failed", error);
            setStages(prev => prev.map(s => ({ ...s, loading: false }))); 
        }
        
        setIsGeneratingImages(false);
        return "PROCESSING"; 
    };

    const extraControls = (
        <div className="space-y-6 font-sans">
            {/* INPUT SECTION */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                    <Hammer className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-gray-800 dark:text-white">Konfigurasi Renovasi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <PenTool size={10} /> Objek Utama
                        </label>
                        <input 
                            type="text" 
                            value={settings.mainObject}
                            onChange={(e) => updateSettings({ mainObject: e.target.value })}
                            placeholder="Contoh: Rumah tua, Kamar tidur..."
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <MapPin size={10} /> Lokasi / Latar
                        </label>
                        <input 
                            type="text"
                            value={settings.location}
                            onChange={(e) => updateSettings({ location: e.target.value })}
                            placeholder="Contoh: Perumahan, Pinggir jalan..."
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Kondisi Awal (Before)</label>
                    <textarea 
                        value={settings.initialCondition}
                        onChange={(e) => updateSettings({ initialCondition: e.target.value })}
                        placeholder="Deskripsikan kerusakan atau kondisi awal..."
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 outline-none h-20 resize-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Hasil Akhir (After)</label>
                    <textarea 
                        value={settings.finalResult}
                        onChange={(e) => updateSettings({ finalResult: e.target.value })}
                        placeholder="Deskripsikan hasil renovasi yang diinginkan..."
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 outline-none h-20 resize-none"
                    />
                </div>

                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Film size={10} /> Total Scene
                        </label>
                        <select 
                            value={settings.sceneCount}
                            onChange={(e) => updateSettings({ sceneCount: parseInt(e.target.value) })}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                        >
                            {SCENE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleCreateStory}
                        disabled={isGeneratingStory}
                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 h-[46px]"
                    >
                        {isGeneratingStory ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-yellow-300" />}
                        {isGeneratingStory ? 'Menyusun Rencana...' : 'Buat Struktur Renovasi'}
                    </button>
                </div>
            </div>

            {/* OUTPUT SECTION */}
            {settings.story && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex items-center gap-2 px-2">
                        <ClipboardList size={18} className="text-emerald-500" />
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Blueprints & Prompts</h4>
                    </div>

                    {/* Mode Selector */}
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800">
                        <label className="text-[10px] font-bold text-violet-600 dark:text-violet-300 uppercase flex items-center gap-1 mb-2">
                            <LayoutTemplate size={12}/> Output Mode (Pilih Output Gambar)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {GEN_MODES.map(mode => (
                                <button
                                    key={mode.value}
                                    onClick={() => updateSettings({ generationMode: mode.value as any })}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                        settings.generationMode === mode.value
                                        ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400'
                                    }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* First Frame Box */}
                    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Prompt Gambar Awal</span>
                            <button 
                                onClick={() => handleCopy(settings.story!.firstFramePrompt, 'first')}
                                className="text-[10px] bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 transition-all flex items-center gap-1"
                            >
                                {copiedIndex === 'first' ? <Check size={10} className="text-green-500"/> : <Copy size={10}/>} Salin
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-mono">
                                {settings.story.firstFramePrompt}
                            </p>
                        </div>
                    </div>

                    {/* Timelapse Steps */}
                    <div className="space-y-3">
                        {settings.story.timelapseSteps.map((step, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm group hover:border-violet-300 dark:hover:border-violet-800 transition-colors">
                                <div className="p-3 flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                                        {step}
                                    </p>
                                    <button 
                                        onClick={() => handleCopy(step, idx)}
                                        className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Salin Prompt Scene Ini"
                                    >
                                        {copiedIndex === idx ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(settings.story, null, 2)], {type: "application/json"});
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = "renovation_structure.json";
                            link.click();
                        }}
                        className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Download size={16} /> Unduh Struktur JSON
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <GeneratorModule 
                moduleId="renovation-timelapse"
                title="GeGe Renovation (Structure Mode)"
                description="Rancang alur transformasi renovasi Anda. Buat struktur cerita dari kondisi awal hingga hasil akhir yang memukau."
                promptPrefix=""
                requireImage={false}
                mainImageLabel="Foto Ruangan Asli (Opsional)"
                allowReferenceImage={false}
                extraControls={extraControls}
                batchModeAvailable={false}
                defaultAspectRatio="16:9"
                customGenerateHandler={handleCustomGenerate}
                initialState={initialState?.generator}
                onStateChange={(genState) => {
                    onStateChange?.({ settings, stages, generator: genState });
                }}
            />

            {stages.length > 0 && (
                <div className="space-y-6 animate-fade-in border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers className="text-violet-600" size={24} />
                            Visualisasi Timeline
                        </h3>
                        {isGeneratingImages && (
                            <div className="flex items-center gap-2 text-xs text-violet-500 font-bold animate-pulse">
                                <Loader2 className="animate-spin" size={14} /> RENDERING FRAMES...
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stages.map((stage, idx) => (
                            <div key={stage.id} className={`group relative bg-white dark:bg-dark-card rounded-2xl border ${stage.skipped ? 'border-dashed border-gray-300 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'} overflow-hidden shadow-sm hover:shadow-lg transition-all`}>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden relative">
                                    {stage.loading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="text-violet-600 animate-spin" size={32} />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                                                PROCESSING...
                                            </span>
                                        </div>
                                    ) : stage.url ? (
                                        <>
                                            <img 
                                                src={stage.url} 
                                                alt={stage.label} 
                                                className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                                                onClick={() => setViewImage(stage.url)}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button onClick={() => setViewImage(stage.url)} className="p-2 bg-white/20 backdrop-blur rounded-full text-white"><ZoomIn size={20}/></button>
                                            </div>
                                        </>
                                    ) : stage.skipped ? (
                                        <span className="text-xs text-gray-400 font-medium italic">Dilewati (Setting Mode)</span>
                                    ) : (
                                        <span className="text-xs text-gray-400">Menunggu antrian...</span>
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{stage.label}</p>
                                    </div>
                                    {!stage.loading && stage.url && (
                                        <div className="flex gap-1">
                                            <a 
                                                href={stage.url} 
                                                download={`renov-frame-${idx}.png`}
                                                className="p-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded hover:bg-violet-200 transition-all"
                                            >
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {viewImage && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
                    onClick={() => setViewImage(null)}
                >
                    <button 
                        onClick={() => setViewImage(null)} 
                        className="fixed top-6 right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X size={32}/>
                    </button>
                    <div className="max-w-7xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
                        <img src={viewImage} className="w-full h-full object-contain rounded-lg shadow-2xl" alt="Full view" />
                    </div>
                </div>
            )}
        </div>
    );
};
