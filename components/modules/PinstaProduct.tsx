import React, { useState, useEffect, useRef } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { RotateCcw, RotateCw } from 'lucide-react';

interface PinstaProductProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

const BACKGROUNDS = [{ id: 'white', name: 'Minimal White' }, { id: 'marble', name: 'Luxury Marble' }, { id: 'wood', name: 'Scandinavian Wood' }, { id: 'pastel', name: 'Soft Pastel' }, { id: 'dark', name: 'Moody Dark' }, { id: 'fabric', name: 'Elegant Fabric' }, { id: 'silk', name: 'Kain Sutra Mewah' }, { id: 'podium', name: 'Podium Geometris' }, { id: 'water', name: 'Permukaan Air (Ripples)' }, { id: 'on-table', name: 'Di Atas Meja' }, { id: 'on-rock', name: 'Di Atas Batu Alam' }, { id: 'on-grass', name: 'Di Atas Rumput' }, { id: 'beach-sand', name: 'Pasir Pantai' }, { id: 'concrete-wall', name: 'Tembok Beton' }, { id: 'cafe-vibe', name: 'Suasana Kafe' }, { id: 'kitchen', name: 'Dapur Modern' }, { id: 'desk', name: 'Meja Kerja / Kantor' }, { id: 'shelf', name: 'Rak Kayu Estetik' }, { id: 'urban', name: 'Jalanan Kota (Urban)' }, { id: 'sky', name: 'Langit Biru Cerah' }, { id: 'in-nature', name: 'Di Alam (Hutan)' }];
const EFFECTS = [{ id: 'soft-light', name: 'Cahaya Natural Lembut' }, { id: 'dramatic', name: 'Bayangan Dramatis' }, { id: 'golden-hour', name: 'Golden Hour' }, { id: 'studio', name: 'Pencahayaan Studio' }, { id: 'backlit', name: 'Backlit Glow' }, { id: 'rembrandt', name: 'Rembrandt Lighting' }, { id: 'noir', name: 'Product Noir (Gelap)' }, { id: 'ring-light', name: 'Ring Light (Beauty)' }];
const CATEGORIES = [{ id: 'skincare', name: 'Skincare / Kosmetik' }, { id: 'fashion', name: 'Fashion / Aksesoris' }, { id: 'food', name: 'Makanan / Minuman' }, { id: 'toys', name: 'Mainan / Hobi (Toys)' }, { id: 'electronics', name: 'Gadget / Elektronik' }, { id: 'jewelry', name: 'Perhiasan' }, { id: 'home', name: 'Dekorasi Rumah' }, { id: 'shoes', name: 'Sepatu / Alas Kaki' }, { id: 'automotive', name: 'Otomotif / Sparepart' }, { id: 'health', name: 'Kesehatan / Herbal' }, { id: 'sports', name: 'Olahraga / Gym' }];
const ANGLES = [{ id: 'front', name: 'Tampak Depan' }, { id: '45-degree', name: 'Sudut 45 Derajat' }, { id: 'top-down', name: 'Flat Lay (Dari Atas)' }, { id: 'side', name: 'Tampak Samping' }, { id: 'macro', name: 'Macro Close-up' }, { id: 'lifestyle', name: 'Konteks Lifestyle' }, { id: 'low-angle', name: 'Low Angle (Heroic)' }, { id: 'held-by-hand', name: 'Dipegang Tangan' }];
const STYLES = [{ id: 'minimalist', name: 'Minimalis' }, { id: 'luxury', name: 'Mewah / Elegan' }, { id: 'vintage', name: 'Vintage / Retro' }, { id: 'modern', name: 'Modern Clean' }, { id: 'organic', name: 'Organik / Natural' }, { id: 'pop-art', name: 'Pop Art / Warna Warni' }, { id: 'kawaii', name: 'Cute / Kawaii (Pastel)' }, { id: 'rustic', name: 'Rustic / Pedesaan' }, { id: 'ethereal', name: 'Ethereal / Dreamy' }, { id: 'futuristic', name: 'Futuristik' }, { id: 'neon', name: 'Neon Glow' }, { id: 'industrial', name: 'Industrial' }];
const LOCATIONS = ['Studio Foto', 'Kamar Tidur', 'Ruang Tamu', 'Dapur', 'Outdoor (Taman)', 'Jalanan Kota', 'Pantai', 'Kafe', 'Gym/Fitness Center', 'Mall', '✎ Input Manual'];
const POSES = ['Berdiri Tegak', 'Berjalan (Walking)', 'Duduk Santai', 'Tangan di Pinggul', 'Melihat ke Samping', 'Close-up Wajah', 'Bersandar', 'Tangan di Saku', 'Pose Dinamis', 'Memegang Produk', 'Duduk di Lantai'];
const POSTER_STYLES = [{ id: 'umkm', name: 'Street Food / UMKM' }, { id: 'fresh', name: 'Minuman Segar (Fresh)' }, { id: 'luxury', name: 'Luxury & Premium' }, { id: 'dramatic', name: 'Dramatis / Gelap' }, { id: 'cinematic', name: 'Sinematik' }, { id: 'tech', name: 'Tech & Futuristic' }, { id: 'clean-minimal', name: 'Clean & Minimalist' }, { id: 'tropical', name: 'Summer / Tropical' }, { id: 'cyberpunk', name: 'Neon Cyberpunk' }, { id: 'playful', name: 'Playful / Anak-anak' }];
const COLOR_PALETTES = [{ id: 'vibrant', name: 'Vibrant Pop (Merah/Kuning)' }, { id: 'pastel', name: 'Soft Pastel (Pink/Biru Muda)' }, { id: 'monochrome', name: 'Monokrom (Hitam/Putih)' }, { id: 'gold_navy', name: 'Mewah (Emas & Navy)' }, { id: 'nature', name: 'Natural (Hijau/Cokelat)' }, { id: 'minimal', name: 'Minimal (Putih Bersih)' }, { id: 'dark', name: 'Dark Mode (Hitam/Abu)' }];

interface SettingsState {
    activeTab: 'photo' | 'try-on' | 'poster';
    productName: string;
    bg: string;
    effect: string;
    category: string;
    angle: string;
    style: string;
    location: string;
    manualLocation: string;
    pose: string;
    posterTitle: string;
    posterTagline: string;
    posterPrice: string;
    posterPromo: string;
    posterCTA: string;
    posterStyle: string;
    colorPalette: string;
    contacts: { wa: string; tiktok: string; telegram: string; shopee: string; facebook: string; instagram: string; };
    benefits: string[];
}

export const PinstaProductModule: React.FC<PinstaProductProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    activeTab: 'photo',
    productName: '',
    bg: BACKGROUNDS[0].id,
    effect: EFFECTS[0].id,
    category: CATEGORIES[0].id,
    angle: ANGLES[0].id,
    style: STYLES[0].id,
    location: LOCATIONS[0],
    manualLocation: '',
    pose: POSES[0],
    posterTitle: '',
    posterTagline: '',
    posterPrice: '',
    posterPromo: '',
    posterCTA: '',
    posterStyle: POSTER_STYLES[0].id,
    colorPalette: COLOR_PALETTES[0].id,
    contacts: { wa: '', tiktok: '', telegram: '', shopee: '', facebook: '', instagram: '' },
    benefits: ['', '', ''],
  });
  
  const [promptPrefix, setPromptPrefix] = useState('');
  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHydrated = useRef(false);

  // Initialize History on first load
  useEffect(() => {
    if (history.length === 0) {
        setHistory([settings]);
        setHistoryIndex(0);
    }
  }, []);

  // Hydration from parent
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

  // Sync to parent
  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({ 
            history, 
            historyIndex,
            generator: initialState?.generator 
        });
    }
  }, [history, historyIndex]);

  const updateSettings = (newSettings: Partial<SettingsState>, recordHistory = true) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    if (recordHistory) {
        const newHistory = [...history.slice(0, historyIndex + 1), updated].slice(-15);
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

  const {
    activeTab, productName, bg, effect, category, angle, style,
    location, manualLocation, pose, posterTitle, posterTagline,
    posterPrice, posterPromo, posterCTA, posterStyle, colorPalette,
    contacts, benefits
  } = settings;

  useEffect(() => {
    const productText = productName ? `Produk: ${productName}.` : 'Produk utama dalam gambar.';
    if (activeTab === 'photo') {
      const bgName = BACKGROUNDS.find(b => b.id === bg)?.name;
      const effName = EFFECTS.find(e => e.id === effect)?.name;
      const catName = CATEGORIES.find(c => c.id === category)?.name;
      const angName = ANGLES.find(a => a.id === angle)?.name;
      const styName = STYLES.find(s => s.id === style)?.name;
      setPromptPrefix(`Fotografi Produk Profesional Kualitas Tinggi (8K). ${productText} Kategori: ${catName}. Gaya Visual: ${styName}. Latar Belakang: ${bgName}. Pencahayaan: ${effName}. Sudut Kamera: ${angName}. Pastikan produk terlihat sangat jelas, tajam, dan menarik secara komersial. Fokus penuh pada detail produk.`);
    } else if (activeTab === 'try-on') {
      const locText = location === '✎ Input Manual' ? manualLocation : location;
      setPromptPrefix(`Fotografi Model Fashion Profesional. ${productText} Instruksi Utama: Pakaikan produk (Gambar 1) pada Model (Gambar 2). Lokasi: ${locText}. Pose: ${pose}. ATURAN WAJAH: Wajib mempertahankan 100% identitas wajah dari Gambar Referensi (Gambar 2). Jangan ubah fitur wajah. Pastikan produk menempel pada tubuh model secara natural dan realistis.`);
    } else if (activeTab === 'poster') {
      const pStyle = POSTER_STYLES.find(s => s.id === posterStyle)?.name;
      const pColor = COLOR_PALETTES.find(c => c.id === colorPalette)?.name;
      const benefitsText = benefits.filter(b => b.trim()).map((b, i) => `${i+1}. ${b}`).join(', ');
      const contactsList = [];
      if (contacts.wa) contactsList.push(`[Logo WhatsApp] ${contacts.wa}`);
      if (contacts.tiktok) contactsList.push(`[Logo TikTok] ${contacts.tiktok}`);
      if (contacts.telegram) contactsList.push(`[Logo Telegram] ${contacts.telegram}`);
      if (contacts.shopee) contactsList.push(`[Logo Shopee] ${contacts.shopee}`);
      if (contacts.facebook) contactsList.push(`[Logo Facebook] ${contacts.facebook}`);
      if (contacts.instagram) contactsList.push(`[Logo Instagram] ${contacts.instagram}`);
      const contactsText = contactsList.join(' | ');
      setPromptPrefix(`Desain Poster Iklan Komersial Profesional. ${productText} Gaya Desain: ${pStyle}. Palet Warna Dominan: ${pColor}. Elemen Teks Wajib (RENDER TEKS DENGAN EJAAN YANG SEMPURNA DAN JELAS): - JUDUL BESAR: "${posterTitle || 'PRODUK BARU'}" - TAGLINE: "${posterTagline}" - HARGA: "${posterPrice}" - PROMO: "${posterPromo}" - CTA (Call To Action): "${posterCTA}" ${benefitsText ? `Poin Keunggulan (List): ${benefitsText}` : ''} ${contactsText ? `Kontak & Sosial Media (Wajib tampilkan Ikon Logo Kecil + Teks): ${contactsText}` : ''} Komposisi: Produk harus menjadi fokus utama di tengah atau area strategis. Teks harus terbaca jelas, font modern dan tebal. Desain harus memenuhi seluruh frame tanpa area kosong.`);
    }
  }, [settings]);

  const renderSelector = (label: string, value: string, setValue: (v: string) => void, options: any[]) => (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-500 uppercase">{label}</label>
      <select 
        value={value} onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
      >
        {options.map(opt => (
          <option key={opt.id || opt} value={opt.id || opt}>{opt.name || opt}</option>
        ))}
      </select>
    </div>
  );

  const extraControls = (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => updateSettings({ activeTab: 'photo' })}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'photo' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📸 Foto Produk
        </button>
        <button
          onClick={() => updateSettings({ activeTab: 'try-on' })}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'try-on' ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          👗 Model Try-On
        </button>
        <button
          onClick={() => updateSettings({ activeTab: 'poster' })}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'poster' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          💡 Poster Iklan
        </button>
      </div>
      <div className="flex justify-end gap-2 -mb-4">
        <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-500 uppercase">Nama Produk (Untuk Konteks AI)</label>
        <input 
          type="text" 
          value={productName}
          onChange={(e) => updateSettings({ productName: e.target.value })}
          placeholder="Cth: Sepatu Lari Merah, Serum Wajah..."
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm dark:text-white outline-none focus:border-emerald-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        
        {activeTab === 'photo' && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {renderSelector('Kategori', category, (v) => updateSettings({category: v}), CATEGORIES)}
            {renderSelector('Gaya Visual', style, (v) => updateSettings({style: v}), STYLES)}
            {renderSelector('Latar Belakang', bg, (v) => updateSettings({bg: v}), BACKGROUNDS)}
            {renderSelector('Pencahayaan', effect, (v) => updateSettings({effect: v}), EFFECTS)}
            {renderSelector('Sudut Pengambilan', angle, (v) => updateSettings({angle: v}), ANGLES)}
          </div>
        )}

        {activeTab === 'try-on' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              ℹ️ Upload foto produk di <b>Subjek 1</b>. Upload foto model di <b>Model Referensi</b>.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Lokasi</label>
                <select 
                  value={location} onChange={(e) => updateSettings({ location: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white"
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {location === '✎ Input Manual' && (
                  <input 
                    type="text" value={manualLocation} onChange={(e) => updateSettings({ manualLocation: e.target.value })} placeholder="Lokasi..."
                    className="mt-1 w-full rounded-md border border-gray-300 bg-transparent p-2 text-xs"
                  />
                )}
              </div>
              {renderSelector('Pose Model', pose, (v) => updateSettings({pose: v}), POSES)}
            </div>
          </div>
        )}

        {activeTab === 'poster' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Judul Poster</label>
                <input 
                  type="text" value={posterTitle} onChange={(e) => updateSettings({ posterTitle: e.target.value })} placeholder="DISKON BESAR"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Tagline</label>
                <input 
                  type="text" value={posterTagline} onChange={(e) => updateSettings({ posterTagline: e.target.value })} placeholder="Kualitas Terbaik"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Harga</label>
                <input 
                  type="text" value={posterPrice} onChange={(e) => updateSettings({ posterPrice: e.target.value })} placeholder="Rp 99.000"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Promo</label>
                <input 
                  type="text" value={posterPromo} onChange={(e) => updateSettings({ posterPromo: e.target.value })} placeholder="Beli 1 Gratis 1"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Call To Action (CTA)</label>
                <input 
                  type="text" value={posterCTA} onChange={(e) => updateSettings({ posterCTA: e.target.value })} placeholder="Pesan Sekarang / Kunjungi Toko"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {renderSelector('Gaya Desain', posterStyle, (v) => updateSettings({posterStyle: v}), POSTER_STYLES)}
               {renderSelector('Palet Warna', colorPalette, (v) => updateSettings({colorPalette: v}), COLOR_PALETTES)}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Manfaat / Keunggulan Produk</label>
                {benefits.map((benefit, idx) => (
                    <input 
                        key={idx}
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                            const newBenefits = [...benefits];
                            newBenefits[idx] = e.target.value;
                            updateSettings({ benefits: newBenefits });
                        }}
                        placeholder={`Keunggulan ${idx + 1}`}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white mb-2"
                    />
                ))}
                <button onClick={() => updateSettings({ benefits: [...benefits, ''] })} className="text-xs text-purple-600 hover:underline">+ Tambah Kolom</button>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Kontak & Sosial Media (Otomatis Tambah Logo)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">WA</span>
                        <input type="text" value={contacts.wa} onChange={(e) => updateSettings({ contacts: {...contacts, wa: e.target.value}})} placeholder="0812..." className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-black dark:text-white text-xs">TikTok</span>
                        <input type="text" value={contacts.tiktok} onChange={(e) => updateSettings({ contacts: {...contacts, tiktok: e.target.value}})} placeholder="@username" className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-xs">Tele</span>
                        <input type="text" value={contacts.telegram} onChange={(e) => updateSettings({ contacts: {...contacts, telegram: e.target.value}})} placeholder="@username" className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500 text-xs">Shopee</span>
                        <input type="text" value={contacts.shopee} onChange={(e) => updateSettings({ contacts: {...contacts, shopee: e.target.value}})} placeholder="Nama Toko" className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-pink-500 text-xs">IG</span>
                        <input type="text" value={contacts.instagram} onChange={(e) => updateSettings({ contacts: {...contacts, instagram: e.target.value}})} placeholder="@username" className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-xs">FB</span>
                        <input type="text" value={contacts.facebook} onChange={(e) => updateSettings({ contacts: {...contacts, facebook: e.target.value}})} placeholder="Nama Halaman" className="flex-1 rounded-md border border-gray-300 bg-transparent p-1.5 text-xs" />
                    </div>
                </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="pinsta-product"
      title="GeGe Affiliate"
      description="Sulap foto produk biasa jadi jualan laris manis! Cocok buat pejuang UMKM & affiliate."
      promptPrefix={promptPrefix}
      requireImage={activeTab !== 'poster'}
      mainImageLabel={activeTab === 'try-on' ? "Foto Produk (Wajib)" : "Foto Produk"}
      
      allowReferenceImage={activeTab === 'try-on'}
      referenceImageLabel="Model Referensi (Wajib)"
      
      extraControls={extraControls}
      batchModeAvailable={true}
      defaultAspectRatio="4:5"
      
      initialState={initialState?.generator}
      onStateChange={(state) => onStateChange?.({ 
          history, 
          historyIndex,
          generator: state 
      })}
    />
  );
};