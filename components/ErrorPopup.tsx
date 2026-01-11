
import React from 'react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
  onRetry: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose, onRetry }) => {
  const isQuotaError = message.includes("429") || message.toLowerCase().includes("quota") || message.includes("limit");
  const isNoImageError = message.includes("Tidak ada gambar") || message.includes("No image");
  
  let slangTitle = "Yah, Error Nih! 🤯";
  let slangMessage = `Ada masalah teknis nih kak: "${message}". Biasalah, namanya juga sistem. Coba lagi aja kak!`;

  if (isQuotaError) {
    slangTitle = "Kuota API Habis! 🪫";
    slangMessage = "Waduh, sepertinya API Key kamu (atau sistem) sudah mencapai batas limit Free Tier nih. Google membatasi jumlah gambar harian untuk akun gratis.";
  } else if (isNoImageError) {
    slangTitle = "Waduh, Gagal Bestie! 🙈";
    slangMessage = "AI-nya lagi tantrum nih, gambarnya gak mau keluar. Mungkin server lagi padet atau dia bingung sama prompt kamu. Jangan nyerah, gass coba lagi dong! 🚀";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border-2 border-red-100 dark:border-red-900/50 transform scale-100 transition-transform text-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
            <div className={`w-20 h-20 ${isQuotaError ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-red-50 dark:bg-red-900/30'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                <span className="text-4xl">{isQuotaError ? '⏳' : '😤'}</span>
            </div>
            <h3 className={`text-xl font-extrabold ${isQuotaError ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'} mb-2 tracking-tight`}>
            {slangTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-2">
            {slangMessage}
            </p>

            {isQuotaError && (
              <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-left">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">Tips Solusi:</p>
                <ul className="text-[10px] text-amber-600 dark:text-amber-500 list-disc ml-4 space-y-1">
                  <li>Tunggu 1-5 menit lalu coba lagi.</li>
                  <li>Tambah API Key baru di menu <b>Settings {" > "} API Vault</b>.</li>
                  <li>Pastikan kunci Anda aktif (Tanda centang hijau).</li>
                </ul>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
            <button 
                onClick={onClose}
                className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
                Tutup
            </button>
            <button 
                onClick={onRetry}
                className={`flex-1 px-5 py-3 text-sm font-bold text-white ${isQuotaError ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/30'} rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2`}
            >
                <span>🔄</span> Coba Lagi
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};
