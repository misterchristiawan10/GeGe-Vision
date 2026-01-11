import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Trash2, MapPin, 
  User, Settings, Layers, Wand2, 
  Image as ImageIcon, ZoomIn, Check, RefreshCw, Sparkles, Download, X,
  Palette, Aperture, Copy, Film, Ratio, Monitor, PenTool, MessageSquare,
  RotateCcw, RotateCw, History
} from 'lucide-react';
import { generateCreativeImage, fileToBase64 } from '../../services/geminiService';
import { ErrorPopup } from '../ErrorPopup';

// --- CONSTANTS ---
const DATA_REGIONS: Record<string, string[]> = {
  "Pulau Sumatera": [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", 
    "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung"
  ],
  "Pulau Jawa": [
    "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "Yogyakarta", 
    "Jawa Timur", "Madura"
  ],
  "Pulau Bali": ["Bali"],
  "Pulau Nusa Tenggara": ["Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  "Pulau Kalimantan": [
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", 
    "Kalimantan Timur", "Kalimantan Utara"
  ],
  "Pulau Sulawesi": [
    "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", 
    "Sulawesi Selatan", "Sulawesi Tenggara"
  ],
  "Kepulauan Maluku": ["Maluku", "Maluku Utara"],
  "Pulau Papua": [
    "Papua", "Papua Barat", "Papua Pegunungan", "Papua Selatan", 
    "Papua Tengah", "Papua Barat Daya"
  ]
};

const getAttireDetails = (province: string) => {
  const mapping: Record<string, string> = {
    "Aceh": "Ulee Balang traditional attire, luxurious songket, intricate gold headpiece (Sunting), majestic and polite",
    "Sumatera Utara": "Traditional Ulos Batak cloth, Sortali headband (red/black geometric patterns), distinctive tribal elegance",
    "Sumatera Barat": "Minangkabau Bundo Kanduang attire, iconic horn-shaped headdress (Tingkuluak), rich gold-threaded songket balapak",
    "Riau": "Malay traditional Baju Kurung Cekak Musang, woven Songket, majestic yellow or green royalty colors",
    "Kepulauan Riau": "Kebaya Labuh and Teluk Belanga, flowy fabric, rich colors, malay coastal influence",
    "Jambi": "Baju Kurung Tanggung, gold thread embroidery, intricate headdress, melayu jambi style",
    "Sumatera Selatan": "Aesan Gede or Aesan Paksangkong (Palembang style), massive gold Siger crown, heavy gold jewelry, red and gold songket",
    "Bangka Belitung": "Baju Seting and Kain Cual, bright colors, blend of malay and chinese influence",
    "Bengkulu": "Batik Besurek (calligraphy motifs), velvet traditional vest, gold accents",
    "Lampung": "Lampung traditional attire with Tapis woven cloth, large gold Siger (horned crown) for women",
    
    "DKI Jakarta": "Betawi traditional attire, Kebaya Encim with bright floral embroidery for women, Sadariah/Pangsi with sarong for men",
    "Jawa Barat": "Sundanese Kebaya (simple & elegant), Sinjang Batik, Siger Sunda crown (white/silver) for formal/bride style",
    "Banten": "Pangsi Banten or Kebaya with distinct Banten Batik patterns (Debus influence)",
    "Jawa Tengah": "Javanese Kebaya (Velvet/Bludru) or Batik Solo/Jogja, Paes makeup style, hair bun (Sanggul), elegant and aristocratic",
    "Yogyakarta": "Yogya classic Kraton attire, Kebaya Kutu Baru, Batik Parang or Kawung, distinct sanggul tekuk",
    "Jawa Timur": "East Javanese Kebaya, brighter colors, or Pesa'an Madura style influences",
    "Madura": "Pesa'an attire, loose black pants/shirt, red-white striped inner shirt, Odheng headwear, bold and brave look",
    
    "Bali": "Payas Agung (Royal) or Payas Madya, intricate gold jewelry, Kamen cloth wrapped tightly, Frangipani flower accents in hair",
    
    "Nusa Tenggara Barat": "Sasak Lambung attire (black velvet with gold), woven songket sash, distinct ikat patterns",
    "Nusa Tenggara Timur": "Tenun Ikat NTT, heavy woven cloth with distinct tribal geometric patterns, simpler natural accessories",
    
    "Kalimantan Barat": "King Baba/King Bibinge (Dayak), bark/fabric vest, intricate beadwork, hornbill feather headdress",
    "Kalimantan Tengah": "Dayak Ngaju attire, Sangkarut vest, bold tribal patterns, vibrant colors",
    "Kalimantan Selatan": "Banjar Baamar Galung Pancar Matahari, shimmering fabrics, heavy gold ornamentation (Gajah Gamuling)",
    "Kalimantan Timur": "Dayak Kustim or Sapei Sapaq, fine beadwork (manik-manik), hornbill feather accents, shield accessories",
    "Kalimantan Utara": "Dayak attire distinct to North, similar to Kaltim with specific tribal motifs and beads",
    
    "Sulawesi Utara": "Minahasa Bajang or Baniang, white/red colors, distinct embroidery on chest",
    "Gorontalo": "Biliu or Makuta attire, distinctive tall headgear with gold chains, colorful silk",
    "Sulawesi Tengah": "Baju Nggembe or Koje, bark cloth origins or woven silk, gemstone accessories",
    "Sulawesi Barat": "Pattuqduq Towaine (Mandar), raw silk Sarong, heavy gold jewelry, elegant bun",
    "Sulawesi Selatan": "Baju Bodo (Bugis/Makassar), sheer loose blouse, boxy shape, bright vibrant colors (Red/Green/Purple), Sarung Sutra",
    "Sulawesi Tenggara": "Babu Nggawi or Tolaki attire, woven silver/gold thread, metallic sheen",
    
    "Maluku": "Baju Cele (red checkered/plaid pattern), Kebaya Nona Rok, joyful colors, Lenso handkerchief",
    "Maluku Utara": "Manteren Lamo or royal sultanate attire, velvet and gold embroidery, majestic look",
    
    "Papua": "Traditional grassy skirt (Rumbai), Noken bag, face painting, cassowary feather headdress, tribal accessories",
    "Papua Barat": "Ewer attire, natural fibers, tribal motifs, nature-based ornaments",
    "Papua Pegunungan": "Koteka/Yokal style (tribal), natural earth pigments, authentic highland look",
    "Papua Selatan": "Asmat style decorations, fiber weaving, intricate patterns",
    "Papua Tengah": "Mee or Dani tribe influences, natural materials, mud/clay paint",
    "Papua Barat Daya": "Bird of paradise feather accents, woven bark cloth"
  };
  
  return mapping[province] || "Traditional Indonesian Cultural Attire, detailed fabric patterns";
};

const getRegionalDetails = (island: string, province: string) => {
  const attireDesc = getAttireDetails(province);
  
  let house = "";
  let makeup = "";
  let props: string[] = [];

  switch (island) {
    case "Pulau Sumatera":
      house = "Rumah Gadang (Minangkabau style) or Rumah Bolon architecture, traditional wooden house on stilts with curved roof";
      makeup = "Bold traditional makeup, focus on strong eyebrows and red lips, suitable for Siger or heavy headpieces";
      props = ["Kotak Sirih", "Selendang", "Keris", "Suntiang Emas"];
      break;
    case "Pulau Jawa":
      house = "Rumah Joglo with wooden Pendopo pillars, intricate Javanese wood carving";
      makeup = "Javanese Paes style (velvet smooth), elegant and refined, focus on eyes and smooth complexion";
      props = ["Keris", "Bunga Melati", "Payung Geulis", "Batik Tulis"];
      break;
    case "Pulau Bali":
      house = "Balinese traditional compound, Gapura Candi Bentar, stone carvings, tropical garden";
      makeup = "Balinese Tari style, vivid eyes, frangipani flower accents on ear";
      props = ["Kipas Tradisional", "Bunga Frangipani", "Cawan Emas", "Janur Kuning"];
      break;
    case "Pulau Kalimantan":
      house = "Rumah Betang (Longhouse) on high stilts, tribal wooden motifs";
      makeup = "Dayak inspired style, natural with tribal artistic accents or face painting lines";
      props = ["Tombak", "Anyaman Bambu", "Mahkota Bunga", "Perisai Dayak"];
      break;
    case "Pulau Sulawesi":
      house = "Tongkonan traditional house with boat-shaped roof structure";
      makeup = "Bold and regal makeup, gold dust accents, glowing skin";
      props = ["Keris", "Kain Sutra", "Selendang", "Badik"];
      break;
    case "Pulau Papua":
      house = "Honai round traditional hut with straw roof, natural jungle setting";
      makeup = "Tribal face painting patterns (dots/lines), earthy tones";
      props = ["Tombak", "Mahkota Bunga", "Alat Musik Tifa", "Noken"];
      break;
    case "Pulau Nusa Tenggara":
      house = "Traditional Sasak or Sumba high roof house (Rumah Musalaki)";
      makeup = "Natural warm tones, emphasizing exotic features, sun-kissed look";
      props = ["Kain Tenun", "Selendang", "Sirih Pinang"]; 
      break;
    default: 
      house = "Baileo traditional open house on stilts";
      makeup = "Fresh, natural island look";
      props = ["Selendang", "Alat Musik Petik", "Mutiara"];
  }

  return { attire: attireDesc, house, makeup, props };
};

const getBodyTypeDescription = (weightInput: string, gender: string) => {
  const w = weightInput.toLowerCase();
  if (w.includes('kurus')) return "very thin, skinny physique, visible collarbones, slender frame";
  if (w.includes('langsing')) return "slim, fit, athletic toned build, elegant figure";
  if (w.includes('standar')) return "average build, balanced proportions";
  if (w.includes('gemoy')) return "chubby, soft round features, curvy, thick thighs, soft skin texture";
  if (w.includes('obesitas')) return "obese, plus-size, heavy full figure, massive build";
  return "average build";
};

const POSES = [
  "Berdiri Formal (Tangan di Samping)", "Berdiri Anggun (Satu Tangan di Pinggang)", "Pose Menyapa (Salam Namaste/Sembah)", 
  "Duduk Santai di Kursi Antik", "Duduk Lesehan Anggun", "Pose Gerakan Tari Tradisional", 
  "Pose Memegang Properti (Kipas/Keris)", "Candid Tertawa Natural", "Pose Berjalan Elegan (Walking Shot)", 
  "Pose Menoleh ke Samping (Side Profile)", "Close Up Wajah (Beauty Portrait)", "Pose Tangan Menyentuh Dagu (Reflektif)", 
  "Bersandar pada Tiang/Dinding", "Pose Dinamis (Kain Berkibar)", "Pose Wibawa (Tangan Melipat di Dada)",
  "Melihat Jauh ke Cakrawala", "Memegang Bunga Melati", "Duduk Menyamping"
];

const BACKGROUNDS = [
  "Rumah Adat Tradisional (Kayu)", "Interior Keraton Klasik (Mewah)", "Studio Polos (Putih Bersih)", 
  "Alam Terbuka (Hutan Tropis)", "Pemandangan Pantai (Sunset)", "Sawah Terasering Hijau", 
  "Pedesaan Asri (Jalan Setapak)", "Pelataran Candi Kuno", "Nuansa Malam Berbintang",
  "Pasar Tradisional", "Halaman Pura Bali", "Air Terjun Tersembunyi"
];

const LIGHTING = [
  "Softbox Studio", "Rembrandt Lighting", "Golden Hour", "Natural Window", "Cinematic Teal/Orange",
  "High Key", "Low Key", "Dramatic Side", "Soft Diffused", "Royal Ambience", "Firelight / Obor"
];

const PROPS = [
  "Keris", "Kipas Tradisional", "Payung Geulis", "Selendang", "Tombak",
  "Bunga Melati", "Kotak Sirih", "Topeng", "Gendang Kecil", "Bunga Frangipani",
  "Kain Batik Tambahan", "Mahkota Bunga", "Tongkat Adat", "Cawan Emas", "Alat Musik Petik",
  "Noken", "Perisai", "Sirih Pinang", "Janur Kuning", "Tifa", "Badik", "Kain Tenun"
];

const MAKEUP_STYLES = [
  "✨ Otomatis (Sesuai Adat)", "Natural Flawless", "Bold Glamour", "Paes Jawa Klasik", 
  "Siger Lampung Style", "Bali Dancer Style", "Soft Korean Look", "Vintage Retro", 
  "Gothic Dark", "No Makeup Look", "Dewy Glass Skin"
];

const BG_EFFECTS = [
  "✨ Otomatis", "Bokeh (Blur Background)", "Jelas / Tajam (Deep Focus)"
];

const QUICK_EDITS = [
  "Jadikan Hitam Putih (Klasik)",
  "Suasana Malam Dramatis",
  "Efek Golden Hour",
  "Ubah ke Cinematic Style",
  "Close Up Shot",
  "Ubah Background ke Alam",
  "Tambah Efek Kabut",
  "Gaya Lukisan Minyak"
];

const ASPECT_RATIOS = [
  "1:1", "3:4", "4:3", "9:16", "16:9"
];

const RESOLUTIONS = [
  "1K", "2K", "4K"
];

interface SmartPandaStudioModuleProps {
  initialState?: any;
  onStateChange?: (state: any) => void;
}

interface GeneratedImage {
    url: string;
    timestamp: number;
}

export const SmartPandaStudioModule: React.FC<SmartPandaStudioModuleProps> = ({ initialState, onStateChange }) => {
  const isHydrated = useRef(false);
  
  const [references, setReferences] = useState([
    { id: 0, image: null as File | null, gender: 'Female', age: '25', height: '165', weight: 'Langsing (Slim/Fit)', smile: 'Slight Smile' },
    { id: 1, image: null as File | null, gender: 'Male', age: '28', height: '175', weight: 'Standar (Proporsional)', smile: 'No Smile' }
  ]);

  const [settings, setSettings] = useState({
    island: 'Pulau Jawa',
    province: 'Jawa Barat',
    background: BACKGROUNDS[0],
    pose: POSES[0],
    makeup: MAKEUP_STYLES[0],
    lighting: LIGHTING[0],
    bgEffect: BG_EFFECTS[0],
    props: [] as string[],
    isRandomMode: false,
    aspectRatio: '3:4',
    resolution: '1K'
  });

  const [settingsHistory, setSettingsHistory] = useState<any[]>([]);
  const [settingsHistoryIndex, setSettingsHistoryIndex] = useState(-1);
  const [batchConfig, setBatchConfig] = useState({ enabled: false, count: 4 });
  const [manualProp, setManualProp] = useState('');
  const [manualPrompt, setManualPrompt] = useState('');
  const [customEditPrompt, setCustomEditPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Sedang Meracik...');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load from parent
  useEffect(() => {
    if (initialState && !isHydrated.current) {
        if (initialState.settingsHistory && initialState.settingsHistory.length > 0) {
            setSettingsHistory(initialState.settingsHistory);
            const newIndex = initialState.settingsHistoryIndex ?? initialState.settingsHistory.length - 1;
            setSettingsHistoryIndex(newIndex);
            setSettings(initialState.settingsHistory[newIndex]);
        }
        setGeneratedImages(initialState.generatedImages || []);
        setBatchConfig(initialState.batchConfig || { enabled: false, count: 4 });
        setManualProp(initialState.manualProp || '');
        setManualPrompt(initialState.manualPrompt || '');
        isHydrated.current = true;
    } else if (!initialState && !isHydrated.current) {
        setSettingsHistory([settings]);
        setSettingsHistoryIndex(0);
        isHydrated.current = true;
    }
  }, [initialState]);

  // Sync back to parent
  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({
            settingsHistory,
            settingsHistoryIndex,
            generatedImages,
            batchConfig,
            manualProp,
            manualPrompt,
        });
    }
  }, [settingsHistory, settingsHistoryIndex, generatedImages, batchConfig, manualProp, manualPrompt]);

  const updateSettings = (newSettings: any) => {
    const fullNewSettings = { ...settings, ...newSettings };
    setSettings(fullNewSettings);
    
    if (isHydrated.current) {
        const newHistory = [...settingsHistory.slice(0, settingsHistoryIndex + 1), fullNewSettings].slice(-20);
        setSettingsHistory(newHistory);
        setSettingsHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndoSettings = () => {
    if (settingsHistoryIndex > 0) {
        const newIndex = settingsHistoryIndex - 1;
        setSettings(settingsHistory[newIndex]);
        setSettingsHistoryIndex(newIndex);
    }
  };

  const handleRedoSettings = () => {
    if (settingsHistoryIndex < settingsHistory.length - 1) {
        const newIndex = settingsHistoryIndex + 1;
        setSettings(settingsHistory[newIndex]);
        setSettingsHistoryIndex(newIndex);
    }
  };

  // HANDLERS
  const handleRefChange = (id: number, field: string, value: any) => {
    const newRefs = [...references];
    (newRefs[id] as any)[field] = value;
    setReferences(newRefs);
  };

  const handleImageUpload = (id: number, file: File | null) => {
    handleRefChange(id, 'image', file);
  };

  const toggleProp = (prop: string) => {
    const exists = settings.props.includes(prop);
    const newProps = exists ? settings.props.filter(p => p !== prop) : [...settings.props, prop];
    updateSettings({ ...settings, props: newProps });
  };

  const handleAutoProps = () => {
    const context = getRegionalDetails(settings.island, settings.province);
    updateSettings({ ...settings, props: context.props });
  };

  const generate = async () => {
    const activeRef = references[0];
    const secondaryRef = references[1];
    if (!activeRef.image) {
      setErrorMsg("Mohon upload foto Wajah Utama (Model 1).");
      return;
    }
    
    setErrorMsg('');
    setLoading(true);
    const runCount = batchConfig.enabled ? batchConfig.count : 1;
    const newResults: GeneratedImage[] = [];

    try {
      for (let i = 0; i < runCount; i++) {
        setLoadingMessage(batchConfig.enabled ? `Generating Batch (${i + 1}/${runCount})...` : 'Sedang Meracik...');
        const regionalContext = getRegionalDetails(settings.island, settings.province);
        const bodyTypeDesc1 = getBodyTypeDescription(activeRef.weight, activeRef.gender);
        
        let posePrompt = settings.pose;
        let bgPrompt = settings.background;
        if (settings.background.includes("Rumah Adat")) bgPrompt = `Traditional house background: ${regionalContext.house}`;
        
        let makeupPrompt = "";
        if (settings.makeup === '✨ Otomatis (Sesuai Adat)') {
           makeupPrompt = `Traditional ${settings.province} Cultural Makeup: ${regionalContext.makeup}. Highly detailed skin texture, professional application, cultural accuracy, high definition features.`;
        } else if (settings.makeup === 'Natural Flawless') {
           makeupPrompt = `Professional Natural Makeup: Flawless hydrated skin base, subtle blush, groomed eyebrows, soft neutral lip tint, high resolution skin texture.`;
        } else if (settings.makeup === 'Bold Glamour') {
           makeupPrompt = `Professional Bold Glamour: Full coverage foundation, sharp contour, defined eyebrows, bold red lipstick, dramatic eyelashes, MUA quality application.`;
        } else if (settings.makeup === 'Paes Jawa Klasik') {
           makeupPrompt = `Javanese Paes Ageng Traditional Makeup: Black Paes detailed on forehead, velvet matte skin, bold eyeliner, red lipstick, jasmine accessories, aristocratic look.`;
        } else if (settings.makeup === 'Siger Lampung Style') {
           makeupPrompt = `Lampung Traditional Makeup: Golden Siger crown matching makeup, bold eyes, defined lips, regal and majestic appearance.`;
        } else if (settings.makeup === 'Bali Dancer Style') {
           makeupPrompt = `Balinese Dancer Makeup: Distinctive white dot accents (srinata) on forehead/temples, bold winged eyeliner, vibrant lipstick, floral hair accessories.`;
        } else if (settings.makeup === 'Soft Korean Look') {
            makeupPrompt = `Soft Korean Style Makeup: Dewy glass skin, straight brows, puppy eyeliner, gradient lips, peach blush, youthful appearance.`;
        } else if (settings.makeup === 'Vintage Retro') {
            makeupPrompt = `Vintage 1950s Indonesian Style: Classic red lip, winged eyeliner, matte powder finish, neat hair.`;
        } else if (settings.makeup === 'Gothic Dark') {
            makeupPrompt = `Dark Gothic Makeup: Pale skin, dark smokey eyes, dark lipstick, mysterious vibe contrasting with traditional attire.`;
        } else {
           makeupPrompt = `${settings.makeup}, applied professionally with high-definition texture.`;
        }

        let focusPrompt = "";
        if (settings.bgEffect === 'Bokeh (Blur Background)') {
            focusPrompt = "STRONG BOKEH EFFECT: Shallow depth of field, f/1.2 aperture, background heavily blurred, creamy bokeh, separation from background. Subject is ultra sharp.";
        } else if (settings.bgEffect === 'Jelas / Tajam (Deep Focus)') {
            focusPrompt = "DEEP FOCUS (NO BLUR): f/22 aperture, infinite depth of field, background is perfectly sharp and detailed. Crystal clear landscape/interior details behind the subject. Hyper-detailed environment.";
        }

        if (settings.isRandomMode || (batchConfig.enabled && i > 0)) {
          posePrompt = "Creative, photogenic, and culturally elegant pose selected by AI (Varied Angle)";
          if (batchConfig.enabled) posePrompt += ` [Variation ${i}: Different angle and expression]`;
        }

        const desc1 = `Model 1: ${activeRef.gender}, age ${activeRef.age}, ${bodyTypeDesc1}, height ${activeRef.height}cm. Wearing ${regionalContext.attire}. Expression: ${activeRef.smile}.`;
        let desc2 = "";
        if (secondaryRef.image) {
           const bodyTypeDesc2 = getBodyTypeDescription(secondaryRef.weight, secondaryRef.gender);
           desc2 = `Model 2: ${secondaryRef.gender}, age ${secondaryRef.age}, ${bodyTypeDesc2}, height ${secondaryRef.height}cm. Wearing matching ${settings.province} traditional attire. Expression: ${secondaryRef.smile}.`;
        }

        const prompt = `
          INDONESIAN CULTURAL PORTRAIT.
          [QUALITY: ULTRA-SHARP 8K - CRYSTAL CLEAR]
          Ensure the final image is Crystal Clear, No Blur, High Contrast, and Hyper-Realistic.
          Location/Background: ${bgPrompt}. ${focusPrompt}
          Pose: ${posePrompt}.
          Lighting: ${settings.lighting}.
          [MAKEUP INSTRUCTION]: ${makeupPrompt}
          Props: ${settings.props.join(", ")}${manualProp ? `, ${manualProp}` : ""}.
          ${desc1} ${desc2 ? desc2 : "Single subject composition."}
          Custom Instructions: ${manualPrompt}
          Detail Level: Masterpiece, 8K, Intricate textile patterns (Batik/Tenun/Songket), Cultural Accuracy, Visible Skin Texture, Realistic Lighting. 
          Use Phase One Camera simulation for maximum sharpness.
        `;

        const result = await generateCreativeImage(prompt, activeRef.image, settings.aspectRatio, settings.resolution, null, secondaryRef.image || null);
        newResults.push({ url: result, timestamp: Date.now() + i });
      }
      setGeneratedImages(prev => [...newResults, ...prev]);

    } catch (e: any) {
      setErrorMsg(e.message || "Gagal membuat gambar.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEdit = async (editInstruction: string) => {
    const latestImage = generatedImages[0];
    if (!latestImage) return;
    setLoading(true);
    setLoadingMessage(`Menerapkan edit: ${editInstruction}...`);
    try {
        const res = await fetch(latestImage.url);
        const blob = await res.blob();
        const file = new File([blob], "edit-source.png", { type: "image/png" });
        const prompt = `Edit this image: ${editInstruction}. Maintain the Indonesian Cultural theme (Nusantara). High Quality 8k.`;
        const result = await generateCreativeImage(prompt, file, settings.aspectRatio, settings.resolution, null, null);
        setGeneratedImages(prev => [{ url: result, timestamp: Date.now() }, ...prev]);
    } catch (e: any) {
        setErrorMsg(e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {errorMsg && <ErrorPopup message={errorMsg} onClose={() => setErrorMsg('')} onRetry={generate} />}
      {previewImage && (
         <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setPreviewImage(null)}>
            <button onClick={() => setPreviewImage(null)} className="fixed top-6 right-6 text-white hover:text-red-400 z-[210] p-3 bg-black/60 rounded-full border border-white/20 shadow-lg hover:bg-black/80 transition-all"><X size={32}/></button>
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
               <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Full Preview" />
               <div className="mt-4 flex gap-4">
                  <a href={previewImage} download="smart-panda-hd.png" className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors"><Download size={20}/> Unduh HD</a>
               </div>
            </div>
         </div>
      )}
      <div className="space-y-2"><h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><span className="text-4xl">🏛️</span> Smart Panda Studio</h2><p className="text-gray-500 dark:text-gray-400">Kenakan pakaian adat dari Sabang sampai Merauke secara virtual. Cintai warisan budaya kita dengan gaya!</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"><User className="text-red-600" size={18} /><h3 className="font-bold text-gray-800 dark:text-gray-200">Referensi Model</h3></div><div className="grid grid-cols-2 gap-4">{references.map((ref, idx) => (<div key={ref.id} className={`p-3 rounded-xl border ${ref.image ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}><div className="mb-2 flex justify-between items-center"><span className="text-xs font-bold text-gray-600 dark:text-gray-300">Model {idx + 1}</span>{ref.image && (<button onClick={() => handleImageUpload(ref.id, null)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>)}</div><div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 transition-colors"><input type="file" accept="image/*" id={`nusantara-upload-${ref.id}`} className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => e.target.files && handleImageUpload(ref.id, e.target.files[0])} />{ref.image ? (<img src={URL.createObjectURL(ref.image)} className="w-full h-full object-cover" alt="Ref" />) : (<div className="flex flex-col items-center justify-center h-full text-gray-400"><Upload size={20} /><span className="text-[10px] mt-1">Upload</span></div>)}</div><div className="space-y-2"><select value={ref.gender} onChange={(e) => handleRefChange(ref.id, 'gender', e.target.value)} className="w-full text-[10px] p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"><option value="Male">Pria</option><option value="Female">Wanita</option></select><div className="flex gap-1"><input type="number" placeholder="Age" value={ref.age} onChange={(e) => handleRefChange(ref.id, 'age', e.target.value)} className="w-1/2 text-[10px] p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"/><select value={ref.weight} onChange={(e) => handleRefChange(ref.id, 'weight', e.target.value)} className="w-1/2 text-[10px] p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"><option value="Standar (Proporsional)">Standar</option><option value="Kurus (Skinny)">Kurus</option><option value="Langsing (Slim/Fit)">Langsing</option><option value="Gemoy (Chubby/Curvy)">Gemoy</option><option value="Obesitas (Plus Size)">Obesitas</option></select></div></div></div>))}</div></div>
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"><MapPin className="text-red-600" size={18} /><h3 className="font-bold text-gray-800 dark:text-gray-200">Region & Kostum</h3></div><div className="space-y-4"><div className="space-y-1"><label className="text-xs font-semibold text-gray-500 uppercase">Pulau</label><select value={settings.island} onChange={(e) => updateSettings({ island: e.target.value, province: DATA_REGIONS[e.target.value][0] })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white outline-none">{Object.keys(DATA_REGIONS).map(island => <option key={island} value={island}>{island}</option>)}</select></div><div className="space-y-1"><label className="text-xs font-semibold text-gray-500 uppercase">Provinsi (Gaya Adat)</label><select value={settings.province} onChange={(e) => updateSettings({ province: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white outline-none">{DATA_REGIONS[settings.island].map(prov => <option key={prov} value={prov}>{prov}</option>)}</select></div></div></div>
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"><div className="flex items-center gap-2"><Settings className="text-red-600" size={18} /><h3 className="font-bold text-gray-800 dark:text-gray-200">Estetika</h3></div><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase text-gray-400">Mode Acak</span><button onClick={() => updateSettings({isRandomMode: !settings.isRandomMode})} className={`w-8 h-4 rounded-full relative transition-colors ${settings.isRandomMode ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.isRandomMode ? 'translate-x-4' : 'translate-x-0'}`} /></button></div></div><div className={`space-y-3 transition-opacity ${settings.isRandomMode ? 'opacity-50 pointer-events-none' : ''}`}><div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><Palette size={10}/> Riasan / Makeup</label><select value={settings.makeup} onChange={(e) => updateSettings({makeup: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-xs dark:text-white">{MAKEUP_STYLES.map((m, i) => <option key={i} value={m}>{m}</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><Aperture size={10}/> Efek Background</label><select value={settings.bgEffect} onChange={(e) => updateSettings({bgEffect: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-xs dark:text-white">{BG_EFFECTS.map((e, i) => <option key={i} value={e}>{e}</option>)}</select></div></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase">Background</label><select value={settings.background} onChange={(e) => updateSettings({background: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-xs dark:text-white">{BACKGROUNDS.map((bg, i) => <option key={i} value={bg}>{bg}</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase">Pose</label><select value={settings.pose} onChange={(e) => updateSettings({pose: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-xs dark:text-white">{POSES.map((p, i) => <option key={i} value={p}>{p}</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase">Lighting</label><select value={settings.lighting} onChange={(e) => updateSettings({lighting: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-xs dark:text-white">{LIGHTING.map((l, i) => <option key={i} value={l}>{l}</option>)}</select></div></div></div>
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2"><div className="flex items-center gap-2"><Layers className="text-red-600" size={18} /><h3 className="font-bold text-gray-800 dark:text-gray-200">Properti (Pilih)</h3></div><button onClick={handleAutoProps} disabled={settings.isRandomMode} className="text-xs flex items-center gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded"><RefreshCw size={12}/> Auto</button></div><div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3 ${settings.isRandomMode ? 'opacity-50 pointer-events-none' : ''}`}>{PROPS.map((prop, i) => (<label key={i} className={`text-[9px] p-2 rounded border cursor-pointer flex flex-col items-center justify-center gap-1 text-center min-h-[50px] transition-all hover:bg-gray-50 ${settings.props.includes(prop) ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}><input type="checkbox" className="hidden" checked={settings.props.includes(prop)} onChange={() => toggleProp(prop)} />{settings.props.includes(prop) ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300"></div>}<span className="leading-tight">{prop}</span></label>))}</div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase">Input Properti Manual</label><input type="text" value={manualProp} onChange={(e) => setManualProp(e.target.value)} placeholder="Contoh: Pegang burung merpati, latar belakang bunga mawar..." className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white outline-none focus:border-red-500" /></div></div>
          <div className="space-y-4"><div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><Ratio size={12}/> Rasio</label><select value={settings.aspectRatio} onChange={(e) => updateSettings({aspectRatio: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white">{ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><Monitor size={12}/> Resolusi</label><select value={settings.resolution} onChange={(e) => updateSettings({resolution: e.target.value})} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white">{RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div></div></div><div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-2"><Copy size={16} className="text-gray-500"/><span className="text-sm font-bold text-gray-700 dark:text-gray-200">Batch Mode (Banyak Gambar)</span></div><div className="flex items-center gap-2">{batchConfig.enabled && (<div className="flex items-center bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"><button onClick={() => setBatchConfig(p => ({...p, count: Math.max(2, p.count-1)}))} className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-600">-</button><span className="px-2 text-xs font-bold">{batchConfig.count}</span><button onClick={() => setBatchConfig(p => ({...p, count: Math.min(5, p.count+1)}))} className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-600">+</button></div>)}<button onClick={() => setBatchConfig(prev => ({...prev, enabled: !prev.enabled}))} className={`w-10 h-5 rounded-full relative transition-colors ${batchConfig.enabled ? 'bg-green-500' : 'bg-red-500'}`}><div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${batchConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div></div><div className="space-y-1"><label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><PenTool size={10}/> Instruksi Khusus (Prompt Manual)</label><textarea value={manualPrompt} onChange={(e) => setManualPrompt(e.target.value)} placeholder="Tambahkan detail khusus yang belum ada di pengaturan..." className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-800 p-2 text-sm dark:text-white outline-none focus:border-red-500 h-20 resize-none" /></div><div className="flex gap-3"><button onClick={handleUndoSettings} disabled={settingsHistoryIndex <= 0 || loading} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Urungkan Pengaturan"><RotateCcw size={18} /><span className="hidden sm:inline text-xs">Undo</span></button><button onClick={handleRedoSettings} disabled={settingsHistoryIndex >= settingsHistory.length - 1 || loading} className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Ulangi Pengaturan"><RotateCw size={18} /><span className="hidden sm:inline text-xs">Redo</span></button><button onClick={generate} disabled={loading} className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-500/30'}`}>{loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Wand2 size={20} />}<span>{loading ? loadingMessage : `GENERATE ${batchConfig.enabled ? `BATCH (${batchConfig.count})` : ''}`}</span></button></div></div>
        </div>
        <div className="lg:col-span-7 space-y-6"><div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-6 min-h-[600px] border border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden">{generatedImages.length === 0 ? (<div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60"><ImageIcon size={64} className="mb-4" /><p className="text-xl font-medium">Galeri Kosong</p><p className="text-sm">Konfigurasi dan klik Generate untuk memulai.</p></div>) : (<div className="flex-1 flex flex-col gap-6"><div className="w-full flex flex-col gap-4"><div className="flex justify-between items-center"><h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Sparkles size={16} className="text-yellow-500" /> Hasil Terbaru</h3></div><div className="relative rounded-2xl overflow-hidden bg-black group w-full cursor-pointer" onClick={() => setPreviewImage(generatedImages[0].url)}><img src={generatedImages[0].url} alt="Latest Result" className="w-full h-auto max-h-[600px] object-contain mx-auto" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><button className="p-3 bg-black/60 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><ZoomIn size={24}/></button></div></div>{!loading && (<div className="mt-4 space-y-3 animate-fade-in"><label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Film size={12}/> Edit Cepat (Gambar di atas)</label><div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{QUICK_EDITS.map((edit) => (<button key={edit} onClick={() => handleQuickEdit(edit)} className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm flex-shrink-0">{edit}</button>))}</div><div className="flex gap-2"><input type="text" value={customEditPrompt} onChange={(e) => setCustomEditPrompt(e.target.value)} placeholder="Atau ketik instruksi edit manual (contoh: ubah baju jadi merah)..." className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm dark:text-white outline-none focus:border-red-500"/><button onClick={() => handleQuickEdit(customEditPrompt)} disabled={!customEditPrompt.trim()} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm font-bold hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">Kirim</button></div></div>)}</div>{generatedImages.length > 1 && (<div className="pt-6 border-t border-gray-200 dark:border-gray-700"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-2"><History size={16} className="text-gray-500" /><h3 className="font-bold text-gray-600 dark:text-gray-300 text-sm">Riwayat ({generatedImages.length})</h3></div><button onClick={() => setGeneratedImages([])} className="text-xs text-red-500 hover:underline">Hapus Semua</button></div><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{generatedImages.map((img, idx) => (<div key={idx} className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer aspect-square" onClick={() => setPreviewImage(img.url)}><img src={img.url} alt={`History ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>))}</div></div>)}</div>)}</div></div>
      </div>
    </div>
  );
};