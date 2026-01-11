
import React, { useState, useEffect, useRef } from 'react';
import { generateCreativeImage, generateInfographicPrompt, generateRandomPrompt, refineUserPrompt, analyzeImagePrompt, generateSocialCaption } from '../services/geminiService';
import { ModuleId } from '../types';
import { ErrorPopup } from './ErrorPopup';
import { ZoomIn, X, Download, RotateCcw, RotateCw, History, Image as ImageIcon } from 'lucide-react';

interface GeneratorModuleProps {
  moduleId: ModuleId;
  title: string;
  description: string;
  promptPrefix: string;
  requireImage: boolean;
  extraControls?: React.ReactNode;
  onExtraControlChange?: (key: string, value: any) => void;
  defaultAspectRatio?: string;
  customPromptLabel?: string;
  isInfographic?: boolean;
  allowReferenceImage?: boolean;
  referenceImageLabel?: string;
  allowAdditionalFaceImage?: boolean;
  secondFaceLabel?: string;
  mainImageLabel?: string; 
  batchModeAvailable?: boolean;
  initialRefImage?: File | null;
  
  showNames?: boolean;
  name1?: string;
  onName1Change?: (val: string) => void;
  name2?: string;
  onName2Change?: (val: string) => void;

  customPromptGenerator?: () => Promise<string | undefined>;
  renderCustomResultActions?: (imageUrl: string) => React.ReactNode;
  customGenerateHandler?: (
    prompt: string, 
    aspectRatio: string, 
    imageSize: string, 
    isBatch: boolean, 
    batchCount: number,
    baseImage: File | null,
    refImage: File | null,
    faceImage2: File | null
  ) => Promise<string | string[]>;
  
  // Persistence props
  initialState?: any;
  onStateChange?: (state: any) => void;
}

interface ResultHistoryState {
  prompt: string;
  generatedImage: string | null;
  batchResults?: string[] | null;
  timestamp: number;
}

interface SettingsState {
    prompt: string;
    aspectRatio: string;
    imageSize: string;
    isBatchMode: boolean;
    batchCount: number;
}

export const GeneratorModule: React.FC<GeneratorModuleProps> = (props) => {
    const { 
        moduleId, title, description, promptPrefix, requireImage, extraControls, 
        defaultAspectRatio = "1:1", customPromptLabel, isInfographic,
        allowReferenceImage = false, referenceImageLabel = "Referensi Gaya",
        allowAdditionalFaceImage = false, secondFaceLabel = "Wajah Kedua",
        mainImageLabel = "Subjek 1",
        batchModeAvailable = false,
        initialRefImage,
        showNames = false,
        name1 = "", onName1Change,
        name2 = "", onName2Change,
        customPromptGenerator,
        renderCustomResultActions,
        customGenerateHandler,
        initialState,
        onStateChange
    } = props;

  const [image, setImage] = useState<File | null>(null);
  const [refImage, setRefImage] = useState<File | null>(initialRefImage || null);
  const [faceImage2, setFaceImage2] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedPrompt, setAnalyzedPrompt] = useState('');
  const [socialCaptions, setSocialCaptions] = useState<Record<string, string>>({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [resultHistory, setResultHistory] = useState<ResultHistoryState[]>([]);

  // --- SETTINGS STATE ---
  const [settings, setSettingsState] = useState<SettingsState>({
    prompt: '',
    aspectRatio: defaultAspectRatio,
    imageSize: "1K",
    isBatchMode: false,
    batchCount: 5,
  });

  const [settingsHistory, setSettingsHistory] = useState<SettingsState[]>([{
    prompt: '',
    aspectRatio: defaultAspectRatio,
    imageSize: "1K",
    isBatchMode: false,
    batchCount: 5,
  }]);
  const [settingsHistoryIndex, setSettingsHistoryIndex] = useState(0);

  const isHydrated = useRef(false);

  useEffect(() => {
    if (initialRefImage) setRefImage(initialRefImage);
  }, [initialRefImage]);
  
  useEffect(() => {
    isHydrated.current = false;
  }, [moduleId]);

  useEffect(() => {
    if (initialState && !isHydrated.current) {
        setGeneratedImage(initialState.generatedImage || null);
        setBatchResults(initialState.batchResults || []);
        setResultHistory(initialState.resultHistory || []);
        setAnalyzedPrompt(initialState.analyzedPrompt || '');
        setSocialCaptions(initialState.socialCaptions || {});
        
        if (initialState.settingsHistory && initialState.settingsHistory.length > 0) {
            setSettingsHistory(initialState.settingsHistory);
            const newIndex = initialState.settingsHistoryIndex ?? initialState.settingsHistory.length - 1;
            setSettingsHistoryIndex(newIndex);
            setSettingsState(initialState.settingsHistory[newIndex]);
        }
        isHydrated.current = true;
    } else if (!initialState && !isHydrated.current) {
        isHydrated.current = true;
    }
  }, [initialState, moduleId]);
  
  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({
            generatedImage,
            batchResults,
            resultHistory,
            analyzedPrompt,
            socialCaptions,
            settingsHistory,
            settingsHistoryIndex,
        });
    }
  }, [
    generatedImage, batchResults, resultHistory, analyzedPrompt, socialCaptions,
    settingsHistory, settingsHistoryIndex
  ]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);

    const newHistory = [...settingsHistory.slice(0, settingsHistoryIndex + 1), updated].slice(-20);
    setSettingsHistory(newHistory);
    setSettingsHistoryIndex(newHistory.length - 1);
  };
  
  const handleUndoSettings = () => {
    if (settingsHistoryIndex > 0) {
      const newIndex = settingsHistoryIndex - 1;
      setSettingsState(settingsHistory[newIndex]);
      setSettingsHistoryIndex(newIndex);
    }
  };

  const handleRedoSettings = () => {
    if (settingsHistoryIndex < settingsHistory.length - 1) {
      const newIndex = settingsHistoryIndex + 1;
      setSettingsState(settingsHistory[newIndex]);
      setSettingsHistoryIndex(newIndex);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const saveToResultHistory = (newState: Omit<ResultHistoryState, 'timestamp'>) => {
    const historyEntry = { ...newState, timestamp: Date.now() };
    setResultHistory(prev => [historyEntry, ...prev].slice(0, 15));
  };

  // Improved Download Handler
  const handleDownload = async (imageUrl: string | null, filename: string) => {
    if (!imageUrl) return;
    try {
      // Convert base64/url to blob
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
    } catch (e) {
      console.error("Download failed, falling back to direct link", e);
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

    const LOADING_MESSAGES = [
      "Menginisialisasi mesin AI...",
      "Menganalisis pola visual...",
      "Memimpikan konsep...",
      "Mencampur warna digital...",
      "Membuat sketsa komposisi...",
      "Menambahkan detail rumit...",
      "Menyesuaikan pencahayaan & bayangan...",
      "Menyempurnakan mahakarya...",
      "Menerapkan keajaiban terakhir...",
      "Menyelesaikan detail halus..."
    ];

    const QUICK_EDITS = [
      "Jadikan Sinematik",
      "Ubah ke Anime",
      "Efek Hitam Putih",
      "Suasana Malam",
      "Tingkatkan Detail",
      "Ubah Latar ke Alam"
    ];

    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [progress, setProgress] = useState(0);

    const handleGiveIdea = async () => {
        setTextLoading(true);
        try {
        const idea = await generateRandomPrompt();
        updateSettings({ prompt: idea });
        } catch (e) {
        console.error(e);
        } finally {
        setTextLoading(false);
        }
    };

    const handleRefinePrompt = async () => {
        if (!settings.prompt.trim()) return;
        setTextLoading(true);
        try {
        const refined = await refineUserPrompt(settings.prompt);
        updateSettings({ prompt: refined });
        } catch (e) {
        console.error(e);
        } finally {
        setTextLoading(false);
        }
    };

    const handleCustomPromptGen = async () => {
        if (!customPromptGenerator) return;
        setTextLoading(true);
        try {
        const generated = await customPromptGenerator();
        if (generated) {
            updateSettings({ prompt: generated });
        }
        } catch (e) {
        console.error(e);
        } finally {
        setTextLoading(false);
        }
    };

    const handleAnalyzePrompt = async () => {
        if (!generatedImage) return;
        setAnalysisLoading(true);
        try {
        const result = await analyzeImagePrompt(generatedImage);
        setAnalyzedPrompt(result);
        } catch (e) {
        console.error(e);
        } finally {
        setAnalysisLoading(false);
        }
    };

    const handleSocialCaption = async (platform: string) => {
        if (!generatedImage) return;
        setAnalysisLoading(true);
        try {
        const result = await generateSocialCaption(generatedImage, platform);
        setSocialCaptions(prev => ({...prev, [platform]: result}));
        } catch (e) {
        console.error(e);
        } finally {
        setAnalysisLoading(false);
        }
    };

    const startLoadingFlow = (targetSize: string, isBatch = false) => {
        setLoading(true);
        setError(null);
        setProgress(0);
        setAnalyzedPrompt('');
        setSocialCaptions({});
        
        if (isBatch) {
        setLoadingMessage("Mempersiapkan batch generation...");
        } else if (targetSize === "4K") {
        setLoadingMessage("Merender Ultra HD 4K (Mohon bersabar, ini butuh waktu)...");
        } else {
        setLoadingMessage(LOADING_MESSAGES[0]);
        }
        
        const isUltra = targetSize === "4K";
        const isHighRes = targetSize === "2K";
        const updateSpeed = isBatch ? 1000 : isUltra ? 800 : isHighRes ? 400 : 200; 

        const progressInterval = setInterval(() => {
        setProgress((prev) => {
            const increment = prev < 30 ? 5 : prev < 60 ? 2 : prev < 80 ? 1 : 0.2;
            const next = prev + increment;
            return next > 95 ? 95 : next;
        });
        }, updateSpeed);

        const messageInterval = setInterval(() => {
        setLoadingMessage((prev) => {
            if (isUltra && Math.random() > 0.7) return "Memproses detail resolusi tinggi...";
            if (isBatch) return prev;
            const currentIndex = LOADING_MESSAGES.indexOf(prev);
            const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
            return LOADING_MESSAGES[nextIndex];
        });
        }, 2500);

        return { progressInterval, messageInterval };
    };

    const handleGenerate = async () => {
        if (requireImage && !image && !customGenerateHandler) {
        setError("Silakan unggah gambar utama terlebih dahulu.");
        return;
        }

        const { progressInterval, messageInterval } = startLoadingFlow(settings.imageSize, settings.isBatchMode);

        try {
        let finalPrompt = promptPrefix;
        
        if (isInfographic) {
            setLoadingMessage("Menganalisis struktur data...");
            finalPrompt = await generateInfographicPrompt(settings.prompt);
            setLoadingMessage("Mendesain tata letak infografis...");
        } else {
            finalPrompt = `${promptPrefix} ${settings.prompt}`;
        }

        if (customGenerateHandler) {
            const result = await customGenerateHandler(
                settings.prompt, 
                settings.aspectRatio, 
                settings.imageSize, 
                settings.isBatchMode, 
                settings.batchCount,
                image,
                refImage,
                faceImage2
            );
            
            if (Array.isArray(result)) {
                setBatchResults(result);
                setGeneratedImage(result[0]);
                saveToResultHistory({ prompt: settings.prompt, generatedImage: result[0], batchResults: result });
            } else if (result !== "PROCESSING") {
                setGeneratedImage(result);
                setBatchResults([]);
                saveToResultHistory({ prompt: settings.prompt, generatedImage: result, batchResults: null });
            }
            
        } else {
            if (settings.isBatchMode && batchModeAvailable) {
                const results: string[] = [];
                setBatchResults([]); 

                for (let i = 0; i < settings.batchCount; i++) {
                setLoadingMessage(`Mengenerate gambar ${i + 1} dari ${settings.batchCount} (Pose Acak)...`);
                const batchVariationPrompt = `${finalPrompt} \n\n[VARIASI BATCH #${i + 1}: Hasilkan variasi pose, sudut pandang, dan ekspresi yang unik dan berbeda dari biasanya. Acak gaya pose agar dinamis.]`;

                try {
                    const result = await generateCreativeImage(batchVariationPrompt, image, settings.aspectRatio, settings.imageSize, refImage, faceImage2);
                    results.push(result);
                    setBatchResults([...results]); 
                } catch (err) {
                    console.error(`Batch ${i+1} failed`, err);
                }
                }
                
                if (results.length === 0) throw new Error("Gagal mengenerate batch.");
                
                setGeneratedImage(results[0]); 
                saveToResultHistory({ prompt: settings.prompt, generatedImage: results[0], batchResults: results });

            } else {
                const result = await generateCreativeImage(finalPrompt, image, settings.aspectRatio, settings.imageSize, refImage, faceImage2);
                setGeneratedImage(result);
                setBatchResults([]); 
                
                saveToResultHistory({ prompt: settings.prompt, generatedImage: result, batchResults: null });
            }
        }
        
        setProgress(100);
        setLoadingMessage("Menyelesaikan...");
        await new Promise(resolve => setTimeout(resolve, 600));

        } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal membuat gambar. Silakan coba lagi.");
        setProgress(0);
        } finally {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setLoading(false);
        }
    };

    const handleQuickEdit = async (editInstruction: string) => {
        if (!generatedImage) return;

        const { progressInterval, messageInterval } = startLoadingFlow(settings.imageSize);
        setLoadingMessage("Menerapkan pengeditan...");

        try {
        const res = await fetch(generatedImage);
        const blob = await res.blob();
        const previousResultFile = new File([blob], "edit_source.png", { type: "image/png" });

        const finalPrompt = `Edit gambar ini: ${editInstruction}. Pertahankan komposisi utama, tapi terapkan perubahan gaya/objek yang diminta dengan kuat. Resolusi tinggi.`;

        const result = await generateCreativeImage(
            finalPrompt, previousResultFile, settings.aspectRatio, settings.imageSize, null, null
        );
        
        setProgress(100);
        setLoadingMessage("Menyelesaikan edit...");
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setGeneratedImage(result);
        setBatchResults([]); 
        setEditPrompt('');

        saveToResultHistory({ prompt: `Edit: ${editInstruction}`, generatedImage: result });

        } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal mengedit gambar.");
        setProgress(0);
        } finally {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setLoading(false);
        }
    };

    const renderUploadBox = (
        label: string, 
        fileState: File | null, 
        setter: React.Dispatch<React.SetStateAction<File | null>>, 
        id: string,
        required: boolean = false,
        nameValue?: string,
        onNameChange?: (val: string) => void
    ) => (
        <div className="space-y-2 h-full flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col justify-center items-center relative min-h-[160px]">
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setter)} 
                className="hidden" 
                id={id} 
            />
            <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                {fileState ? (
                <>
                    <div className="relative w-full h-32 md:h-40">
                    <img src={URL.createObjectURL(fileState)} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-sm" />
                    <button 
                        onClick={(e) => {
                        e.preventDefault();
                        setter(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                    >
                        <X size={14} />
                    </button>
                    </div>
                    <span className="text-xs text-primary-600 font-medium">Ganti Gambar</span>
                </>
                ) : (
                <>
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                    {required ? '📤' : '➕'}
                    </div>
                    <span className="text-xs text-gray-500">Unggah</span>
                </>
                )}
            </label>
            </div>
            
            {showNames && onNameChange && (
            <input 
                type="text" 
                value={nameValue} 
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={`Nama ${label.toLowerCase().replace('*', '')}`}
                className="w-full text-center text-sm border-b border-gray-200 dark:border-gray-700 bg-transparent py-1 focus:border-primary-500 outline-none transition-colors text-gray-800 dark:text-gray-200"
            />
            )}
        </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
        {error && (
            <ErrorPopup 
            message={error} 
            onClose={() => setError(null)} 
            onRetry={handleGenerate} 
            />
        )}

        {/* LIGHTBOX MODAL */}
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
            
            <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={viewImage} 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                    alt="Full Preview" 
                />
                <div className="mt-4 flex gap-4">
                    <button 
                        onClick={() => handleDownload(viewImage, `gege-creation-hd-${Date.now()}.png`)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download size={20}/> Unduh HD
                    </button>
                </div>
            </div>
            </div>
        )}

        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            
            {/* 
                @google/genai-api:fix - Kolom upload utama selalu muncul jika requireImage=true, 
                tanpa dipengaruhi oleh customGenerateHandler. Ini memastikan kolom Foto Keluarga tidak hilang.
            */}
            {(!isInfographic && (requireImage || !customGenerateHandler)) && (
                <div className={`grid gap-4 ${
                (allowReferenceImage && allowAdditionalFaceImage) 
                    ? 'grid-cols-1 sm:grid-cols-3' 
                    : (allowReferenceImage || allowAdditionalFaceImage) 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1'
                }`}>
                {renderUploadBox(mainImageLabel, image, setImage, `${moduleId}-file-upload`, requireImage, name1, onName1Change)}
                {allowAdditionalFaceImage && renderUploadBox(secondFaceLabel, faceImage2, setFaceImage2, `${moduleId}-face-upload-2`, false, name2, onName2Change)}
                {allowReferenceImage && renderUploadBox(referenceImageLabel, refImage, setRefImage, `${moduleId}-ref-upload`, false)}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Rasio Aspek</label>
                <select 
                    value={settings.aspectRatio} 
                    onChange={(e) => updateSettings({ aspectRatio: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm dark:text-white"
                >
                    <option value="1:1">1:1 (Kotak)</option>
                    <option value="9:16">9:16 (Potret)</option>
                    <option value="16:9">16:9 (Lanskap)</option>
                    <option value="4:3">4:3</option>
                    <option value="3:4">3:4</option>
                </select>
                </div>
                <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Resolusi</label>
                <select 
                    value={settings.imageSize} 
                    onChange={(e) => updateSettings({ imageSize: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 text-sm dark:text-white"
                >
                    <option value="1K">1K (Standar - Cepat ⚡)</option>
                    <option value="2K">2K (Detail Tinggi - ~30dtk)</option>
                    <option value="4K">4K (Ultra HD - ~1-2 menit)</option>
                </select>
                </div>
            </div>
            
            {extraControls}

            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {customPromptLabel || "Detail Prompt Tambahan"}
                </label>
                
                {!isInfographic && (
                    <div className="flex gap-2">
                    {customPromptGenerator && (
                        <button 
                            onClick={handleCustomPromptGen}
                            disabled={textLoading}
                            className="px-3 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                            {textLoading ? '...' : '📝 Generate Deskripsi'}
                        </button>
                    )}

                    <button 
                        onClick={handleGiveIdea}
                        disabled={textLoading}
                        className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-full transition-colors flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                    >
                        {textLoading ? '...' : '💡 Beri saya ide'}
                    </button>
                    <button 
                        onClick={handleRefinePrompt}
                        disabled={textLoading || !settings.prompt}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800 disabled:opacity-50"
                    >
                        {textLoading ? '...' : '✨ Detailkan prompt'}
                    </button>
                    </div>
                )}
                </div>
                
                <div className="relative">
                <textarea
                    value={settings.prompt}
                    onChange={(e) => updateSettings({ prompt: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white pr-10"
                    rows={3}
                    placeholder={isInfographic ? "Masukkan poin data Anda di sini..." : "Contoh: Gaya neon futuristik, pencahayaan matahari terbenam..."}
                />
                {textLoading && (
                    <div className="absolute right-3 bottom-3 animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                )}
                </div>
            </div>

            <div className="space-y-4">
                {batchModeAvailable && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer duration-300 ease-in-out ${settings.isBatchMode ? 'bg-green-500' : 'bg-red-500'}`} onClick={() => updateSettings({ isBatchMode: !settings.isBatchMode })}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.isBatchMode ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">Mode Batch (Banyak Gambar)</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Pose akan diacak otomatis untuk tiap gambar.</span>
                        </div>
                    </div>
                    {settings.isBatchMode && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Jumlah (Max 15):</label>
                            <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-0.5">
                            <button 
                                onClick={() => updateSettings({ batchCount: Math.max(1, settings.batchCount - 1) })}
                                disabled={settings.batchCount <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors font-bold text-lg"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">
                                {settings.batchCount}
                            </span>
                            <button 
                                onClick={() => updateSettings({ batchCount: Math.min(15, settings.batchCount + 1) })}
                                disabled={settings.batchCount >= 15}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors font-bold text-lg"
                            >
                                +
                            </button>
                            </div>
                        </div>
                    )}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                    onClick={handleUndoSettings}
                    disabled={settingsHistoryIndex <= 0 || loading}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Urungkan Pengaturan"
                    >
                    <RotateCcw size={18} />
                    <span className="hidden sm:inline text-xs">Undo</span>
                    </button>

                    <button
                    onClick={handleRedoSettings}
                    disabled={settingsHistoryIndex >= settingsHistory.length - 1 || loading}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Ulangi Pengaturan"
                    >
                    <RotateCw size={18} />
                    <span className="hidden sm:inline text-xs">Redo</span>
                    </button>

                    <button
                    onClick={handleGenerate}
                    disabled={loading || (requireImage && !image && !customGenerateHandler)}
                    className={`flex-1 relative overflow-hidden group py-4 font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.99] duration-300
                        ${loading 
                        ? 'bg-white dark:bg-dark-card border border-primary-200 dark:border-primary-900 cursor-wait shadow-none' 
                        : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-primary-500/30'
                        }`}
                    >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </div>
                            <span className="text-sm font-medium tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 animate-pulse">
                                {loadingMessage}
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-800">
                            <div 
                            className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${progress}%` }} 
                            />
                        </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-2">
                        <span>{settings.isBatchMode ? `Buat ${settings.batchCount} Variasi` : title.toUpperCase().includes('COSPLAY') ? 'GENERATE COSPLAY' : 'Buat Keajaiban'}</span>
                        <span>✨</span>
                        </div>
                    )}
                    </button>
                </div>
            </div>
            </div>

            <div className="flex flex-col gap-6">
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 min-h-[400px] border border-gray-200 dark:border-gray-700 relative overflow-hidden group ${!generatedImage && !batchResults.length ? 'flex items-center justify-center' : ''}`}>
                {batchResults.length > 0 && settings.isBatchMode ? (
                <div className="w-full h-full animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Hasil Batch ({batchResults.length} Gambar)</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-max">
                        {batchResults.map((imgSrc, idx) => (
                            <div key={idx} className="relative group/item rounded-lg overflow-hidden shadow-md cursor-pointer" onClick={() => setViewImage(imgSrc)}>
                            <img src={imgSrc} alt={`Result ${idx}`} className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                                <ZoomIn className="text-white drop-shadow-md" />
                            </div>
                            </div>
                        ))}
                        {loading && batchResults.length < settings.batchCount && (
                            <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg h-40 animate-pulse">
                            <span className="text-xs text-gray-500">Memproses...</span>
                            </div>
                        )}
                    </div>
                </div>
                ) : generatedImage ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in group/main">
                    <img 
                    src={generatedImage} 
                    alt="Generated Art" 
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-2xl cursor-pointer"
                    onClick={() => setViewImage(generatedImage)}
                    />
                    <button 
                    onClick={() => setViewImage(generatedImage)}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/main:opacity-100 transition-opacity hover:bg-black/70"
                    >
                    <ZoomIn size={20} />
                    </button>
                </div>
                ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 w-full h-full flex items-center justify-center">
                    {loading ? (
                    <div className="relative flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute inset-2 border-2 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-[spin_2s_linear_infinite]"></div>
                            <div className="absolute inset-5 bg-gradient-to-br from-primary-500/20 to-indigo-500/20 rounded-full animate-pulse backdrop-blur-sm"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-500 text-xs font-mono">AI</div>
                        </div>
                        <p className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-gray-500 animate-pulse">Memproses</p>
                    </div>
                    ) : (
                    <div className="opacity-50">
                        <ImageIcon size={64} className="mx-auto mb-3" />
                        <p>Visual akan muncul di sini</p>
                    </div>
                    )}
                </div>
                )}
            </div>

            {generatedImage && !loading && !settings.isBatchMode && (
                <div className="flex flex-col gap-6 animate-fade-in-up">
                <div className="flex flex-col items-center gap-4">
                    {renderCustomResultActions && (
                    <div className="w-full">
                        {renderCustomResultActions(generatedImage)}
                    </div>
                    )}
                    <div className="flex gap-4">
                        <button 
                        onClick={() => setViewImage(generatedImage)}
                        className="px-6 py-2.5 bg-gray-800 text-white rounded-full font-medium shadow-lg hover:bg-gray-900 transition-all flex items-center gap-2"
                        >
                        <ZoomIn size={18} /> Lihat Full
                        </button>
                        <button 
                        onClick={() => handleDownload(generatedImage, `gege-creation-${Date.now()}.png`)}
                        className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full font-medium shadow-xl hover:scale-105 transition-transform flex items-center gap-2 border border-gray-200 dark:border-gray-600"
                        >
                        <span>Unduh Hasil HD</span>
                        <Download size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎨</span>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Edit Cepat & Variasi</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                    {QUICK_EDITS.map((edit) => (
                        <button
                        key={edit}
                        onClick={() => handleQuickEdit(edit)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700 rounded-full transition-all shadow-sm"
                        >
                        {edit}
                        </button>
                    ))}
                    </div>

                    <div className="flex gap-2">
                    <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Ketik instruksi edit... (cth: ubah rambut jadi merah)"
                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickEdit(editPrompt)}
                    />
                    <button
                        onClick={() => handleQuickEdit(editPrompt)}
                        disabled={!editPrompt.trim()}
                        className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        Terapkan
                    </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                        <span className="text-xl">🚀</span>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Studio Konten & Sosial Media</h3>
                    </div>

                    <div className="space-y-2">
                        <button 
                            onClick={handleAnalyzePrompt}
                            disabled={analysisLoading}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            {analysisLoading ? 'Menganalisis...' : '🔍 Analisis Prompt (Reverse Engineering)'}
                        </button>
                        {analyzedPrompt && (
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-300 font-mono relative group">
                                {analyzedPrompt}
                                <button 
                                    onClick={() => navigator.clipboard.writeText(analyzedPrompt)}
                                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Salin"
                                >
                                    📋
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['Instagram', 'Threads', 'TikTok'].map(platform => (
                            <div key={platform} className="space-y-2">
                                <button
                                    onClick={() => handleSocialCaption(platform)}
                                    disabled={analysisLoading}
                                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                                        platform === 'Instagram' ? 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/20 dark:border-pink-800' :
                                        platform === 'TikTok' ? 'bg-gray-800 text-white border-gray-700 hover:bg-black' :
                                        'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    Buat {platform}
                                </button>
                                {socialCaptions[platform] && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 h-64 min-h-[250px] overflow-y-auto text-xs whitespace-pre-wrap relative group">
                                        {socialCaptions[platform]}
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(socialCaptions[platform])}
                                            className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Salin"
                                        >
                                            📋
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            )}

            {resultHistory.filter(h => h.generatedImage).length > 0 && (
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-700 mt-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <History className="text-gray-500" size={18} />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Riwayat Sesi Ini</h3>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {resultHistory.filter(h => h.generatedImage).map((item, idx) => (
                        <div 
                            key={idx} 
                            className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square cursor-pointer bg-gray-100 dark:bg-gray-800"
                        >
                            <img src={item.generatedImage!} alt="History" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button 
                                onClick={(e) => { e.stopPropagation(); setViewImage(item.generatedImage); }}
                                className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40"
                                >
                                <ZoomIn size={16} />
                                </button>
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
