
import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Upload, Download, Trash2, Sliders, Image as ImageIcon, Check, Loader2, Info, AlertCircle } from 'lucide-react';

interface ProcessedImage {
    id: string;
    originalName: string;
    originalSize: string;
    processedSize: string;
    processedUrl: string;
    width: number;
    height: number;
}

interface ImageResizerProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

export const ImageResizerModule: React.FC<ImageResizerProps> = ({ initialState, onStateChange }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<ProcessedImage[]>([]);
    const [quality, setQuality] = useState(80);
    const [scale, setScale] = useState(100); // percentage
    const [targetFormat, setTargetFormat] = useState('image/jpeg');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialState && initialState.history) {
            setHistory(initialState.history);
        }
    }, [initialState]);

    useEffect(() => {
        if (history.length > 0 || (initialState && initialState.history)) {
            onStateChange?.({ history });
        }
    }, [history]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
        // Reset value so the same file can be uploaded again
        e.target.value = '';
    };

    const processImage = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError("Hanya file gambar yang didukung.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onerror = () => {
                setError("Gagal membaca file.");
                setIsProcessing(false);
            };

            reader.onload = (event) => {
                const img = new Image();
                
                img.onerror = () => {
                    setError("Gagal memuat gambar. File mungkin rusak.");
                    setIsProcessing(false);
                };

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        setError("Browser tidak mendukung pengolahan gambar.");
                        setIsProcessing(false);
                        return;
                    }

                    // Calculate new dimensions
                    const newWidth = Math.max(1, Math.round(img.width * (scale / 100)));
                    const newHeight = Math.max(1, Math.round(img.height * (scale / 100)));

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const newProcessed: ProcessedImage = {
                                id: Math.random().toString(36).substr(2, 9),
                                originalName: file.name,
                                originalSize: formatSize(file.size),
                                processedSize: formatSize(blob.size),
                                processedUrl: url,
                                width: newWidth,
                                height: newHeight
                            };
                            setHistory(prev => [newProcessed, ...prev]);
                            setIsProcessing(false);
                        } else {
                            setError("Gagal mengonversi gambar.");
                            setIsProcessing(false);
                        }
                    }, targetFormat, quality / 100);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan sistem saat memproses.");
            setIsProcessing(false);
        }
    };

    const removeImage = (id: string) => {
        setHistory(prev => {
            const item = prev.find(img => img.id === id);
            if (item) URL.revokeObjectURL(item.processedUrl);
            return prev.filter(img => img.id !== id);
        });
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                    <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                        <Maximize className="text-white" size={28} />
                    </div>
                    GeGe Image Resizer
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Optimalkan aset visual Anda. Perkecil ukuran file gambar untuk kecepatan loading web yang lebih baik tanpa ribet.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Controls Sidebar */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <Sliders size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">Pengaturan</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Kualitas ({quality}%)</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Small File</span>
                                </div>
                                <input 
                                    type="range" min="10" max="100" 
                                    value={quality} 
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Skala Dimensi ({scale}%)</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Resize</span>
                                </div>
                                <input 
                                    type="range" min="10" max="100" 
                                    value={scale} 
                                    onChange={(e) => setScale(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Format Output</label>
                                <select 
                                    value={targetFormat}
                                    onChange={(e) => setTargetFormat(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
                                >
                                    <option value="image/jpeg">JPEG (Paling Kecil)</option>
                                    <option value="image/png">PNG (Transparansi)</option>
                                    <option value="image/webp">WebP (Modern)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex gap-3">
                        <Info size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            Proses ini dilakukan 100% di browser Anda secara lokal. Privasi terjamin karena data tidak pernah keluar dari perangkat Anda.
                        </p>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="md:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isProcessing ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {isProcessing ? (
                                    <Loader2 className="text-emerald-500 animate-spin" size={40} />
                                ) : (
                                    <Upload className="text-gray-400 group-hover:text-emerald-500 transition-colors" size={40} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isProcessing ? 'Memproses Gambar...' : 'Klik untuk Unggah Gambar'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pastikan setting di samping sudah sesuai kebutuhan Anda.</p>
                            </div>

                            <div className="w-full max-w-sm">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    disabled={isProcessing}
                                    id="image-resizer-input"
                                    className="hidden" 
                                />
                                <label 
                                    htmlFor="image-resizer-input"
                                    className={`block w-full py-4 px-6 rounded-2xl font-black text-center transition-all cursor-pointer shadow-lg active:scale-[0.98] ${isProcessing ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-wait' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/20'}`}
                                >
                                    {isProcessing ? 'MOHON TUNGGU...' : 'PILIH FILE GAMBAR'}
                                </label>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl animate-fade-in border border-red-100 dark:border-red-900/30">
                            <AlertCircle size={20} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    {/* Results List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <ImageIcon size={18} className="text-emerald-500" /> Hasil Optimasi
                            </h3>
                            {history.length > 0 && (
                                <button onClick={() => setHistory([])} className="text-xs text-red-500 font-bold hover:underline">HAPUS SEMUA</button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="py-16 text-center bg-gray-50/50 dark:bg-dark-card/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-gray-400 text-sm italic">Belum ada gambar yang diproses.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {history.map((img) => (
                                    <div key={img.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                            <img src={img.processedUrl} className="w-full h-full object-cover" alt="Thumb" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={img.originalName}>{img.originalName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-gray-400 line-through">{img.originalSize}</span>
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Check size={10} /> {img.processedSize}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono hidden sm:inline">{img.width}x{img.height}px</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={img.processedUrl} 
                                                download={`optimized-${img.originalName}`}
                                                className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                                title="Unduh"
                                            >
                                                <Download size={20} />
                                            </a>
                                            <button 
                                                onClick={() => removeImage(img.id)}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
