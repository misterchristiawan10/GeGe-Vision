
import React, { useState } from 'react';
import { ModuleDefinition, ModuleId } from '../../types';
import { 
    ArrowRight, Camera, Clapperboard, Landmark, Video, Sun, ShoppingBag, 
    Paintbrush2, BarChart3, SearchCode, Theater, HeartHandshake, 
    CandlestickChart, AudioWaveform, Zap, Bot, Edit, FileAudio, LayoutTemplate,
    Coffee, Maximize, Hammer, Plane
} from 'lucide-react';

interface HomeProps {
  onNavigate: (id: ModuleId) => void;
}

export const MODULES: ModuleDefinition[] = [
  {
    id: 'world-tour',
    title: 'GeGe Traveling',
    description: 'Keliling dunia tanpa paspor! Ubah fotomu seolah sedang liburan di landmark ikonik dunia dengan penyesuaian outfit otomatis.',
    icon: Plane,
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'pinsta-product',
    title: 'GeGe Affiliate',
    description: 'Tingkatkan omzet jualan dengan visual kelas atas! Sulap foto produk biasa jadi estetik dan buat poster promo instan.',
    icon: ShoppingBag,
    gradient: 'from-violet-500 to-indigo-600'
  },
  {
    id: 'content-creator',
    title: 'GeGe Analisa',
    description: 'Upload gambarmu, biar AI kasih ide prompt, caption medsos, dan ide konten yang nendang.',
    icon: SearchCode,
    gradient: 'from-sky-500 to-indigo-600'
  },
  {
    id: 'cosplay-fusion',
    title: 'GeGe Cosplay',
    description: 'Wujudkan impianmu jadi karakter favorit! Cukup upload foto, AI kami akan urus detail kostumnya.',
    icon: Theater,
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'virtual-photoshoot',
    title: 'GeGe Foto Studio',
    description: 'Selfie-mu bisa jadi foto studio keren! Coba berbagai konsep profesional tanpa perlu ke studio beneran.',
    icon: Camera,
    gradient: 'from-indigo-500 to-violet-600'
  },
  {
    id: 'infografis',
    title: 'GeGe Infografis',
    description: 'Punya data tapi bingung cara nampilinnya? Biar AI yang bikinin infografis keren & mudah dibaca.',
    icon: BarChart3,
    gradient: 'from-rose-400 to-red-500'
  },
  {
    id: 'karikatur',
    title: 'GeGe Karikatur',
    description: 'Bikin fotomu jadi karikatur lucu dan artistik dalam sekejap. Seru buat profil atau hadiah!',
    icon: Paintbrush2,
    gradient: 'from-lime-500 to-green-600'
  },
  {
    id: 'smart-panda-studio',
    title: 'GeGe Nusantara',
    description: 'Kenakan pakaian adat dari Sabang sampai Merauke secara virtual. Cintai warisan budaya kita!',
    icon: Landmark,
    gradient: 'from-red-500 to-orange-600'
  },
  {
    id: 'rebel-fx',
    title: 'GeGe Trading',
    description: 'Asisten trading pribadimu! Analisa pasar, ngobrol bareng AI Astra, dan dapatkan sinyal potensial.',
    icon: CandlestickChart,
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'prewed-virtual',
    title: 'GeGe Prewedding',
    description: 'Wujudkan foto prewedding mewah tanpa kuras kantong! Upload foto pasangan, AI akan urus sisanya.',
    icon: HeartHandshake,
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    id: 'story-board',
    title: 'GeGe Storyboard',
    description: 'Punya ide cerita? Biar AI yang bikinin storyboard visualnya dengan karakter yang konsisten.',
    icon: Clapperboard,
    gradient: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'bikini-photoshoot',
    title: 'GeGe Summer Mode',
    description: 'Buat foto musim panas ala selebgram! Dapatkan potret bikini & swimwear super realistis.',
    icon: Sun,
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'vidgen',
    title: 'GeGe VidGen (VEO3)',
    description: 'Dari tulisan jadi video! Hidupkan imajinasimu jadi klip sinematik dengan kekuatan Google VEO 3.',
    icon: Video,
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'voice-over',
    title: 'GeGe Voice Pro',
    description: 'Butuh pengisi suara? Tulis aja naskahnya, AI kami akan membacakannya dengan suara natural.',
    icon: AudioWaveform,
    gradient: 'from-teal-400 to-sky-500'
  },
  {
    id: 'mp4-to-mp3',
    title: 'GeGe Audio Extractor',
    description: 'Ambil suara dari video apa saja! Ekstrak MP4 menjadi MP3 berkualitas tinggi dalam sekejap.',
    icon: FileAudio,
    gradient: 'from-orange-400 to-red-500'
  },
  {
    id: 'thumbnail-maker',
    title: 'GeGe Thumbnail',
    description: 'Buat thumbnail video yang menggoda klik! Desain catchy dan visual kontras tinggi untuk YouTube.',
    icon: LayoutTemplate,
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'asmr-visual',
    title: 'GeGe ASMR Studio',
    description: 'Ciptakan visual relaksasi: hujan di jendela, api unggun, hingga aliran sungai yang tenang.',
    icon: Coffee,
    gradient: 'from-indigo-600 to-blue-700'
  },
  {
    id: 'image-resizer',
    title: 'GeGe Resizer',
    description: 'Perkecil ukuran file gambar tanpa kehilangan kualitas untuk optimasi web dan upload cepat.',
    icon: Maximize,
    gradient: 'from-emerald-400 to-green-600'
  },
  {
    id: 'renovation-timelapse',
    title: 'GeGe Renovation',
    description: 'Visualisasikan tahap renovasi ruanganmu dari kondisi awal hingga hasil akhir mewah.',
    icon: Hammer,
    gradient: 'from-orange-500 to-yellow-600'
  },
];

const ModuleCard: React.FC<{ module: ModuleDefinition, onNavigate: (id: ModuleId) => void, isFeatured?: boolean }> = ({ module, onNavigate, isFeatured }) => {
    const Icon = module.icon;
    return (
        <div 
            onClick={() => onNavigate(module.id)}
            className="bg-white dark:bg-dark-card/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm cursor-pointer group transition-all duration-300 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                    <Icon size={24}/>
                </div>
                {isFeatured && (
                    <div className="text-[10px] font-black bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">Terpopuler</div>
                )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg group-hover:text-violet-500 transition-colors">{module.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{module.description}</p>
        </div>
    );
};

export const HomeModule: React.FC<HomeProps> = ({ onNavigate }) => {
    const [showAll, setShowAll] = useState(false);
    const FEATURED_IDS: ModuleId[] = ['world-tour', 'smart-panda-studio', 'vidgen'];
    const featuredModules = MODULES.filter(m => FEATURED_IDS.includes(m.id));
    const otherModules = MODULES.filter(m => !FEATURED_IDS.includes(m.id));

    return (
        <div className="space-y-16 animate-fade-in pb-10">
            {/* Hero Section */}
            <section className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
                
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full text-xs font-bold text-violet-400 border border-violet-500/20">
                           <Zap size={14} className="animate-pulse" /> TERBARU: GEGE VISION V1.2
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95]">
                            Gold, Gospel,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-yellow-400">GEGE.</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                            Ekosistem AI kreatif terlengkap untuk masa depan digital Anda. Akselerasi bisnis dan karya tanpa batas.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                data-tour-id="hero-cta"
                                onClick={() => onNavigate('world-tour')}
                                className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                            >
                                Mulai Berkarya <ArrowRight size={20}/>
                            </button>
                            <button 
                                onClick={() => setShowAll(true)}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition-all border border-slate-700"
                            >
                                Lihat Semua Fitur
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                        <div className="relative w-80 h-80">
                            <div className="absolute inset-0 bg-violet-600/20 rounded-[3rem] animate-[spin_15s_linear_infinite]"></div>
                            <div className="absolute inset-4 bg-slate-800 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/5 overflow-hidden">
                                <div className="w-40 h-40 relative flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[30%] shadow-2xl">
                                    <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                                        <path 
                                          d="M45,35 C40,35 35,40 35,50 C35,60 40,65 45,65 C50,65 52,62 52,58 L52,50 L45,50 M55,65 C60,65 65,60 65,50 C65,40 60,35 55,35 C50,35 48,38 48,42 L48,50 L55,50" 
                                          fill="none" 
                                          stroke="url(#goldGradientHero)" 
                                          strokeWidth="9" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"
                                        />
                                        <defs>
                                          <linearGradient id="goldGradientHero" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fbbf24" />
                                            <stop offset="50%" stopColor="#fef3c7" />
                                            <stop offset="100%" stopColor="#d97706" />
                                          </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Featured Section */}
            <section className="space-y-8" id="featured-tools" data-tour-id="featured-tools">
                <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">GeGe Picks</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Gold, Gospel, GeGe: Pilihan terbaik untuk produktivitas Anda</p>
                    </div>
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-xl"
                    >
                        {showAll ? 'TUTUP SEMUA' : 'LIHAT SEMUA'}
                    </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredModules.map(module => (
                        <ModuleCard key={module.id} module={module} onNavigate={onNavigate} isFeatured />
                    ))}
                </div>
            </section>

            {showAll && (
                <section className="space-y-8 animate-fade-in-up">
                    <div className="flex flex-col items-center justify-center text-center space-y-2 mb-10">
                        <div className="w-12 h-1.5 bg-violet-500 rounded-full mb-2"></div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">GEGE UNIVERSE</h2>
                        <p className="text-sm text-gray-500">Jelajahi setiap kemungkinan dengan asisten AI kami</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherModules.map(module => (
                            <ModuleCard key={module.id} module={module} onNavigate={onNavigate} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
