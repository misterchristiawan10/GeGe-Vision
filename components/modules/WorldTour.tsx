
import React, { useState, useEffect } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { Plane, MapPin, Sun, Cloud, Moon, RotateCcw, RotateCw, Shirt, Camera, ScanFace } from 'lucide-react';
import { generateCreativeImage } from '../../services/geminiService';

interface WorldTourProps {
  initialState?: any;
  onStateChange?: (state: any) => void;
}

// Data Destinasi
const DESTINATIONS: Record<string, Record<string, string[]>> = {
  "Indonesia 🇮🇩": {
    "Bali": ["Pura Lempuyang (Gates of Heaven)", "Uluwatu Temple (Cliff)", "Tegalalang Rice Terrace", "Kelingking Beach Nusa Penida", "Pura Ulun Danu Bratan"],
    "Jakarta": ["Monas (Monumen Nasional)", "Bundaran HI (Skyline)", "Kota Tua Jakarta", "Gelora Bung Karno Stadium"],
    "Yogyakarta": ["Candi Borobudur", "Candi Prambanan", "Jalan Malioboro", "Taman Sari Water Castle", "Pantai Parangtritis"],
    "Surakarta (Solo)": ["Keraton Surakarta Hadiningrat", "Pura Mangkunegaran", "Pasar Gede Hardjonagoro", "Museum Batik Danar Hadi", "Kampoeng Batik Laweyan"],
    "Gunung & Alam": ["Gunung Bromo (Lautan Pasir)", "Gunung Rinjani (Puncak & Segara Anak)", "Gunung Ijen (Blue Fire)", "Gunung Merapi (Lava Tour)", "Gunung Kelimutu (Danau Tiga Warna)", "Gunung Semeru (Oro-oro Ombo)"],
    "Bandung": ["Gedung Sate", "Jalan Braga (Classic)", "Kawah Putih Ciwidey", "Tangkuban Perahu", "Lembang Highland View"],
    "Surabaya": ["Jembatan Suramadu", "Tugu Pahlawan", "Monumen Kapal Selam", "Patung Suro dan Boyo"],
    "Medan": ["Istana Maimun", "Masjid Raya Al-Mashun", "Danau Toba (Samosir View)", "Graha Maria Annai Velangkanni"],
    "Makassar": ["Pantai Losari (Sunset)", "Benteng Rotterdam", "Masjid 99 Kubah", "Pulau Samalona"],
    "Lombok": ["Sirkuit Internasional Mandalika", "Bukit Merese", "Gili Trawangan", "Desa Adat Sade"],
    "Labuan Bajo": ["Pulau Padar (Top View)", "Pink Beach", "Pulau Komodo", "Gua Rangko (Glowing Water)"],
    "Palembang": ["Jembatan Ampera (Malam)", "Benteng Kuto Besak", "Pulau Kemaro"],
    "Raja Ampat": ["Wayag Islands (Karst View)", "Piaynemo Overlook", "Pasir Timbul Beach"]
  },
  "Jepang 🇯🇵": {
    "Tokyo": ["Tokyo Tower (Red Steel)", "Shibuya Crossing (Crowded)", "Senso-ji Temple (Asakusa)", "Shinjuku Neon Street"],
    "Kyoto": ["Fushimi Inari Taisha (Torii Gates)", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
    "Osaka": ["Dotonbori (Glico Man)", "Osaka Castle (Sakura Season)", "Universal Studios Japan Globe"]
  },
  "Perancis 🇫🇷": {
    "Paris": ["Menara Eiffel (Trocadero View)", "Museum Louvre (Pyramid)", "Arc de Triomphe", "Cafe Parisian Street"],
    "Nice": ["Promenade des Anglais (Beach)", "Old Town Nice (Colorful Buildings)"]
  },
  "Amerika Serikat 🇺🇸": {
    "New York": ["Times Square (Night)", "Statue of Liberty (Ferry View)", "Brooklyn Bridge", "Central Park"],
    "Los Angeles": ["Hollywood Sign", "Santa Monica Pier", "Beverly Hills Palm Trees"],
    "San Francisco": ["Golden Gate Bridge", "Lombard Street"]
  },
  "Italia 🇮🇹": {
    "Roma": ["Colosseum (Exterior)", "Trevi Fountain", "Spanish Steps"],
    "Venesia": ["Grand Canal (Gondola Ride)", "Rialto Bridge", "St. Mark's Square"],
    "Pisa": ["Menara Miring Pisa"]
  },
  "Inggris 🇬🇧": {
    "London": ["Big Ben & Elizabeth Tower", "Tower Bridge", "London Eye", "Red Telephone Booth Street"],
    "Edinburgh": ["Edinburgh Castle", "Royal Mile"]
  },
  "Korea Selatan 🇰🇷": {
    "Seoul": ["Gyeongbokgung Palace", "Bukchon Hanok Village", "N Seoul Tower (Love Locks)", "Gangnam Street"],
    "Jeju": ["Seongsan Ilchulbong", "Jeju Tangerine Farm"]
  },
  "Arab Saudi 🇸🇦": {
    "Makkah": ["Masjidil Haram (Kaaba View)", "Clock Tower (Abraj Al Bait)"],
    "Madinah": ["Masjid Nabawi (Green Dome)", "Payung Raksasa Nabawi"],
    "Al Ula": ["Elephant Rock", "Hegra (Mada'in Saleh)"]
  },
  "Turki 🇹🇷": {
    "Istanbul": ["Hagia Sophia", "Blue Mosque", "Galata Tower"],
    "Cappadocia": ["Hot Air Balloons (Sunrise)", "Fairy Chimneys"]
  },
  "Swiss 🇨🇭": {
    "Zermatt": ["Matterhorn Mountain (Snow)", "Swiss Alpine Village"],
    "Interlaken": ["Lake Brienz (Turquoise Water)"]
  }
};

const TIMES = [
  { id: 'Golden Hour', label: 'Golden Hour (Sore)', icon: Sun },
  { id: 'Daylight', label: 'Siang Cerah', icon: Cloud },
  { id: 'Night', label: 'Malam (City Lights)', icon: Moon },
  { id: 'Sunrise', label: 'Sunrise (Pagi)', icon: Sun },
];

const SEASONS = [
  'Musim Semi (Bunga Mekar)', 
  'Musim Panas (Cerah)', 
  'Musim Gugur (Dan Oranye)', 
  'Musim Dingin (Salju)',
  'Hujan Romantis'
];

const DESTINATION_OUTFITS: Record<string, string[]> = {
  "Indonesia 🇮🇩": ["Kebaya Modern & Kain Batik", "Pakaian Adat Bali Lengkap", "Batik Formal Executive", "Tenun Ikat NTT Style", "Streetwear Urban Indonesia", "Kaos Santai Tropis"],
  "Jepang 🇯🇵": ["Kimono Tradisional (Full Set)", "Yukata (Summer Festival)", "Seragam Sekolah Jepang (Seifuku)", "Harajuku Street Style"],
  "Perancis 🇫🇷": ["Parisian Chic (Beret & Trench Coat)", "Haute Couture Elegant Dress", "Striped Shirt & Red Scarf"],
  "Amerika Serikat 🇺🇸": ["NYC Urban Streetwear", "Coachella Boho Style", "Ivy League Preppy", "Hollywood Red Carpet Gown"],
  "Italia 🇮🇹": ["Milan High Fashion Suit/Dress", "Venetian Carnival Costume", "Summer Amalfi Linen"],
  "Inggris 🇬🇧": ["Classic Trench Coat & Umbrella", "Royal Ascott Style", "Vintage Tweed Jacket", "Mod Fashion 60s"],
  "Korea Selatan 🇰🇷": ["Hanbok Tradisional Premium", "K-Drama Chaebol Style", "K-Pop Idol Stage Outfit", "Korean Street Fashion"],
  "Arab Saudi 🇸🇦": ["Abaya Glamour (Wanita)", "Thobe & Bisht (Pria)", "Modest Fashion Luxury", "Desert Safari Chic"],
  "Turki 🇹🇷": ["Ottoman Kaftan Royal", "Cappadocia Travel Dress (Flowy)", "Turkish Silk Scarf Style"],
  "Swiss 🇨🇭": ["Luxury Winter Ski Suit", "Traditional Swiss Dirndl/Tracht", "Cozy Cashmere Winter Wear"]
};

const OUTFIT_RECOMMENDATIONS: Record<string, string[]> = {
  'Musim Semi (Bunga Mekar)': [
    'Floral Dress / Kemeja Bunga',
    'Cardigan Pastel & Jeans',
    'Trench Coat Ringan',
    'Casual Chic (Blazer & Kaos)'
  ],
  'Musim Panas (Cerah)': [
    'Kaos Putih & Celana Pendek',
    'Summer Dress Flowy',
    'Kemeja Linen Tropis',
    'Topi Jerami & Kacamata Hitam',
    'Pakaian Pantai (Sopan)'
  ],
  'Musim Gugur (Daun Oranye)': [
    'Jaket Kulit & Syal',
    'Sweater Rajut Oversized',
    'Long Coat Earth Tone',
    'Boots & Denim'
  ],
  'Musim Dingin (Salju)': [
    'Jaket Puffer Tebal',
    'Mantel Wol Panjang (Winter Coat)',
    'Hoodie & Beanie Hat',
    'Pakaian Ski (Sporty)'
  ],
  'Hujan Romantis': [
    'Jas Hujan Transparan Estetik',
    'Payung Bening',
    'Hoodie Nyaman',
    'Jaket Waterproof'
  ]
};

const STYLES = [
  'Foto Turis Candid',
  'Influencer Travel Shot',
  'Cinematic Vlog Style',
  'Selfie Wide Angle',
  'Professional Portrait'
];

const SHOT_TYPES = [
  'Full Body (Seluruh Badan)',
  'Knee Up (Dari Lutut ke Atas)',
  'Waist Up (Setengah Badan)',
  'Close Up (Wajah & Bahu)',
  'Extreme Close Up (Detail Wajah)'
];

export const WorldTourModule: React.FC<WorldTourProps> = ({ initialState, onStateChange }) => {
  const [country, setCountry] = useState('Indonesia 🇮🇩');
  const [city, setCity] = useState('Bali');
  const [landmark, setLandmark] = useState('Pura Lempuyang (Gates of Heaven)');
  
  const [time, setTime] = useState(TIMES[1].id);
  const [season, setSeason] = useState(SEASONS[1]);
  const [outfit, setOutfit] = useState('Pakai Baju Asli (Jangan Ubah)');
  const [style, setStyle] = useState(STYLES[0]);
  const [shotType, setShotType] = useState(SHOT_TYPES[2]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    const newCities = Object.keys(DESTINATIONS[newCountry]);
    const newCity = newCities[0];
    const newLandmark = DESTINATIONS[newCountry][newCity][0];

    setCountry(newCountry);
    setCity(newCity);
    setLandmark(newLandmark);
    setOutfit('Pakai Baju Asli (Jangan Ubah)');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    const newLandmark = DESTINATIONS[country][newCity][0];

    setCity(newCity);
    setLandmark(newLandmark);
  };

  const handleLandmarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLandmark(e.target.value);
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSeason(e.target.value);
  };

  const destinationSpecificOutfits = DESTINATION_OUTFITS[country] || [];
  const seasonalOutfits = OUTFIT_RECOMMENDATIONS[season] || [];
  
  const currentOutfitOptions = [
    'Pakai Baju Asli (Jangan Ubah)',
    ...destinationSpecificOutfits,
    ...seasonalOutfits
  ];

  useEffect(() => {
    onStateChange?.({
        settings: { country, city, landmark, time, season, outfit, style, shotType },
        generator: initialState?.generator
    });
  }, [country, city, landmark, time, season, outfit, style, shotType]);

  useEffect(() => {
    if (initialState?.settings) {
        const savedCountry = initialState.settings.country;
        if (savedCountry && DESTINATIONS[savedCountry]) {
            setCountry(savedCountry);
            const savedCity = initialState.settings.city;
            if (savedCity && DESTINATIONS[savedCountry][savedCity]) {
                setCity(savedCity);
                const savedLandmark = initialState.settings.landmark;
                if (savedLandmark && DESTINATIONS[savedCountry][savedCity].includes(savedLandmark)) {
                    setLandmark(savedLandmark);
                } else {
                    setLandmark(DESTINATIONS[savedCountry][savedCity][0]);
                }
            } else {
                const defaultCity = Object.keys(DESTINATIONS[savedCountry])[0];
                setCity(defaultCity);
                setLandmark(DESTINATIONS[savedCountry][defaultCity][0]);
            }
        }
        
        if (initialState.settings.time) setTime(initialState.settings.time);
        if (initialState.settings.season) setSeason(initialState.settings.season);
        if (initialState.settings.outfit) setOutfit(initialState.settings.outfit);
        if (initialState.settings.style) setStyle(initialState.settings.style);
        if (initialState.settings.shotType) setShotType(initialState.settings.shotType);
    }
  }, [initialState]);

  const handleCustomGenerate = async (
    prompt: string,
    aspectRatio: string,
    imageSize: string,
    isBatch: boolean,
    batchCount: number,
    baseImage: File | null
  ) => {
    if (!baseImage) throw new Error("Foto diri wajib diunggah untuk keliling dunia!");

    let outfitInstruction = "**OUTFIT INSTRUCTION:** KEEP THE ORIGINAL OUTFIT FROM THE PHOTO 100% UNCHANGED.";
    if (outfit !== 'Pakai Baju Asli (Jangan Ubah)') {
        outfitInstruction = `**OUTFIT INSTRUCTION:** CHANGE the subject's outfit to: ${outfit}. Ensure it looks natural and fits the ${season} weather and the location perfectly.`;
    }

    const fullPrompt = `
      [TRAVEL PHOTOGRAPHY MASTERPIECE]
      **Subject:** The person from the uploaded photo.
      **Location:** ${landmark}, ${city}, ${country}.
      **Context:** The subject is visiting this famous location. 
      **Atmosphere:** ${time}, ${season}.
      **Photography Style:** ${style}.
      **Framing/Shot Type:** ${shotType}.
      ${outfitInstruction}
      
      **CRITICAL INSTRUCTIONS:**
      1. **INTEGRATION:** The subject must NOT look like a cutout. Match the lighting, shadows, and color temperature of the subject to the environment perfectly.
      2. **BACKGROUND:** The landmark (${landmark}) must be clearly visible and recognizable in the background, high fidelity 8K resolution.
      3. **REALISM:** Use photorealistic textures. If it is "Night", ensure city lights reflect on the subject. If "Golden Hour", ensure warm rim lighting.
      4. **PERSPECTIVE:** Adjust the subject's scale to look natural against the landmark based on the shot type (${shotType}).
      
      **Additional User Instruction:** ${prompt}
    `;

    return await generateCreativeImage(fullPrompt, baseImage, aspectRatio, imageSize, null, null, true); 
  };

  const extraControls = (
    <div className="space-y-6">
      <div className="bg-sky-50 dark:bg-sky-900/20 p-5 rounded-2xl border border-sky-100 dark:border-sky-800">
        <div className="flex items-center gap-2 mb-4">
            <Plane className="text-sky-600 dark:text-sky-400" size={20} />
            <h3 className="font-bold text-sky-800 dark:text-sky-200">Destinasi Tujuan</h3>
        </div>
        
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Negara</label>
                <select 
                    value={country} 
                    onChange={handleCountryChange}
                    className="w-full rounded-xl border border-sky-200 dark:border-sky-700 bg-white dark:bg-gray-800 p-2.5 text-sm dark:text-white outline-none"
                >
                    {Object.keys(DESTINATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Kota / Area</label>
                    <select 
                        value={city} 
                        onChange={handleCityChange}
                        className="w-full rounded-xl border border-sky-200 dark:border-sky-700 bg-white dark:bg-gray-800 p-2.5 text-sm dark:text-white outline-none"
                    >
                        {DESTINATIONS[country] ? Object.keys(DESTINATIONS[country]).map(c => <option key={c} value={c}>{c}</option>) : <option>Memuat...</option>}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><MapPin size={10}/> Landmark</label>
                    <select 
                        value={landmark} 
                        onChange={handleLandmarkChange}
                        className="w-full rounded-xl border border-sky-200 dark:border-sky-700 bg-white dark:bg-gray-800 p-2.5 text-sm dark:text-white outline-none font-medium"
                    >
                        {DESTINATIONS[country]?.[city] ? DESTINATIONS[country][city].map(l => <option key={l} value={l}>{l}</option>) : <option>Memuat...</option>}
                    </select>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
         <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Atmosfer & Gaya</h3>
         
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {TIMES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTime(t.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${time === t.id ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-500 text-sky-700 dark:text-sky-300 font-bold' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500'}`}
                    >
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Musim / Cuaca</label>
                    <select 
                        value={season} 
                        onChange={handleSeasonChange}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                    >
                        {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Shirt size={10}/> Outfit (Auto-Match)</label>
                    <select 
                        value={outfit} 
                        onChange={(e) => setOutfit(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                    >
                        {currentOutfitOptions.map(o => (
                            <option key={o} value={o}>{o}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Camera size={10}/> Gaya Foto</label>
                    <select 
                        value={style} 
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                    >
                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><ScanFace size={10}/> Tipe Shot / Framing</label>
                    <select 
                        value={shotType} 
                        onChange={(e) => setShotType(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                    >
                        {SHOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="world-tour"
      title="GeGe Traveling"
      description="Keliling dunia tanpa paspor! Ubah fotomu seolah sedang liburan di landmark ikonik dunia dengan integrasi AI yang realistis."
      promptPrefix=""
      requireImage={true}
      mainImageLabel="Foto Diri (Wajib)"
      allowReferenceImage={false}
      extraControls={extraControls}
      customGenerateHandler={handleCustomGenerate}
      defaultAspectRatio="4:5"
      batchModeAvailable={false}
      initialState={initialState}
      onStateChange={onStateChange}
    />
  );
};
