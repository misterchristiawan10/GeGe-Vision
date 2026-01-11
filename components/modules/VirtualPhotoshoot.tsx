
import React, { useState, useEffect, useRef } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { Trash2, Upload, Plus, RotateCw, RotateCcw, Info } from 'lucide-react';
import { generateCreativeImage } from '../../services/geminiService';

// --- CONSTANTS ---

const GENDERS = ['Wanita', 'Pria'];

const BODY_TYPES: Record<string, string[]> = {
  Wanita: ['Standar (Proporsional)', 'Kurus (Skinny)', 'Langsing (Slim/Fit)', 'Gemoy (Chubby/Curvy)', 'Obesitas (Plus Size)'],
  Pria: ['Standar (Proporsional)', 'Kurus (Skinny)', 'Langsing (Slim/Fit)', 'Gemoy (Chubby)', 'Obesitas (Large Build)']
};

const HAIR_STYLES: Record<string, string[]> = {
  Wanita: ['Lurus Panjang', 'Bob Bergelombang', 'Potongan Pixie', 'Keriting Panjang', 'Kuncir Kuda', 'Kepang', 'Potongan Layer', 'Sanggul Berantakan', 'Hijab Modern', 'Hijab Syari'],
  Pria: ['Fade Pendek', 'Buzz Cut', 'Undercut', 'Man Bun', 'Panjang Bergelombang', 'Slicked Back', 'Berantakan Bertekstur', 'Belah Samping']
};

const HAIR_COLORS = ['Hitam', 'Cokelat Tua', 'Pirang', 'Merah', 'Perak', 'Putih', 'Pink Pastel', 'Biru', 'Hijau', 'Ungu'];
const CLOTHING_COLORS = ['✨ Sesuai Prompt', 'Putih', 'Hitam', 'Merah', 'Biru', 'Hijau', 'Emas', 'Perak', 'Pink', 'Kuning', 'Ungu', 'Navy', 'Krem'];
const FABRIC_TYPES = ['✨ Sesuai Prompt', 'Katun', 'Sutra', 'Kulit', 'Denim', 'Beludru', 'Satin', 'Linen', 'Wol', 'Latex', 'Sifon', 'Renda'];
const ACCESSORIES = ['Tidak Ada', 'Kacamata Hitam', 'Kalung Emas', 'Anting Berlian', 'Topi', 'Jam Tangan Mewah', 'Syal', 'Kacamata', 'Kalung Mutiara', 'Tas Tangan', 'Headphone'];

const EXPRESSIONS = [
  '✨ Auto (AI)', 'Senyum Natural', 'Tertawa Lepas', 'Serius / Fierce', 
  'Sedih / Melankolis', 'Terkejut', 'Menggoda (Flirty)', 'Misterius', 'Wajah Datar (Poker Face)',
  'Pose Konyol / Lucu', 'Pose Imut (Aegyo)', 'Menjulurkan Lidah'
];

const ART_STYLES = [
  'Foto Realistik', 
  'Pas Foto (ID Photo)', 
  'Photobox / Photobooth', 
  'Sinematik', 
  'Seni Digital (Karikatur)', 
  'Lukisan Minyak', 
  'Gaya Anime', 
  'Hitam Putih', 
  'Vaporwave / Neon',
  'Vintage 90s',
  'Polaroid Style'
];

const ID_PHOTO_COLORS = ['Merah (Red)', 'Biru (Blue)', 'Putih (White)', 'Abu-abu (Grey)'];

const ID_PHOTO_CLOTHING = [
    { value: 'formal_suit', label: 'Jas Formal & Kemeja' },
    { value: 'white_shirt', label: 'Hanya Kemeja Putih Polos' },
    { value: 'sma_uniform', label: 'Seragam SMA (Putih Abu-abu)' },
    { value: 'smp_uniform', label: 'Seragam SMP (Putih Biru)' },
    { value: 'sd_uniform', label: 'Seragam SD (Putih Merah)' }
];

const PHOTOBOX_CONCEPTS = [
  'Studio Polos Putih (Clean White)',
  'Studio Warna (Solid Color)',
  'Studio Motif (Patterned)',
  'Classic 4-Strip (White Frame)',
  'Classic 4-Strip (Black Frame)',
  'Y2K Aesthetic (00s Vibes)',
  'Neon Cyberpunk Glow',
  'Soft Floral Garden',
  'Vintage Retro 90s',
  'Minimalist Grey Studio',
  'Funky Pop Art Pattern',
  'Kawaii Pastel Cute',
  'Love/Heart Themed',
  'Grunge / Edgy Style'
];

const PHOTOBOX_COLORS = [
  'Pastel Pink', 'Sky Blue', 'Lemon Yellow', 'Mint Green', 'Lilac Purple',
  'Vibrant Red', 'Electric Blue', 'Neon Green', 'Hot Pink', 'Deep Maroon',
  'Cream / Beige', 'Warm Orange', 'Chocolate Brown', 'Black & White'
];

const PHOTOBOX_PATTERNS = [
  'Polka Dots (Bintik)', 'Checkerboard (Catur)', 'Stripes (Garis-garis)', 
  'Hearts (Hati)', 'Stars (Bintang)', 'Clouds (Awan)', 'Grid Lines', 
  'Abstract Shapes', 'Floral Repeat', 'Leopard Print', 'Cow Print'
];

const MAKEUP_STYLES = [
  { value: 'auto', label: '✨ Auto (AI)' },
  { value: 'natural_no_makeup', label: 'No Makeup / Natural Look' },
  { value: 'soft_glam', label: 'Soft Glam (Natural Radiance)' },
  { value: 'full_glam', label: 'Full Glam (Heavy Makeup)' },
  { value: 'editorial_fashion', label: 'Editorial / High Fashion' },
  { value: 'korean_glass_skin', label: 'Korean Glass Skin (Dewy)' },
  { value: 'smokey_eyes', label: 'Smokey Eyes & Nude Lips' },
  { value: 'vintage_retro', label: 'Vintage / Retro (Red Lips)' },
  { value: 'goth_dark', label: 'Gothic / Dark Aesthetics' },
  { value: 'fantasy_ethereal', label: 'Fantasy / Ethereal (Glitter)' },
  { value: 'cyberpunk_neon', label: 'Cyberpunk / Neon Accents' },
  { value: 'bridal', label: 'Bridal / Wedding Day' },
  { value: 'matte_finish', label: 'Matte Finish (Velvet Skin)' },
  { value: 'glossy_wet', label: 'Glossy / Wet Look' },
  { value: 'bronzed_beach', label: 'Bronzed / Sun-Kissed' }
];

const LOCATION_TYPES = ['✨ Otomatis', '✎ Input Manual', 'Indoor (Interior)', 'Outdoor (Alam)', 'Urban (Kota)', 'Fantasy/Sci-Fi'];

const INDOOR_LOCATIONS = ['Studio Photobox', 'Kamar Tidur', 'Kafe', 'Studio', 'Ruang Makan', 'Ruang Tamu', 'Perpustakaan', 'Kantor', 'Lobi Hotel Mewah', 'Industrial Loft', 'Gym/Fitness'];
const OUTDOOR_LOCATIONS = ['Sawah', 'Hutan', 'Air Terjun', 'Gunung', 'Perbukitan', 'Sungai', 'Pantai', 'Danau', 'Taman Kota', 'Taman Bunga'];
const URBAN_LOCATIONS = ['Jalanan Kota', 'Rooftop Gedung', 'Stasiun MRT', 'Pasar Malam', 'Neon City Street', 'Jembatan Penyeberangan'];
const FANTASY_LOCATIONS = ['Pesawat Luar Angkasa', 'Kastil Fantasi', 'Hutan Ajaib', 'Kota Cyberpunk', 'Bawah Air'];

const TIMES = [
  '✨ Otomatis', 'Flash Photography (Studio)', 'Matahari Terbit (Sunrise)', 'Pagi Cerah', 'Siang Hari (High Noon)', 
  'Sore (Golden Hour)', 'Senja (Blue Hour)', 'Malam (City Lights)', 'Tengah Malam (Gelap)'
];

const LIGHTING_EFFECTS = ['✨ Otomatis', 'Ring Light (Photobooth)', 'Golden Hour', 'Pencahayaan Studio', 'Natural Lembut', 'Bayangan Dramatis', 'Lampu Neon', 'Volumetrik Sinematik', 'Gelap & Murung', 'Rembrandt Lighting', 'Butterfly Lighting'];

const CAMERA_ANGLES = [
  '✨ Otomatis', 'Selevel Mata (Eye Level)', 'Sudut Rendah (Low Angle)', 'Sudut Tinggi (High Angle)', 
  'Wide Shot (Full Body)', 'Potret Close-up', 'Dutch Angle (Miring)', 'Over the Shoulder', 
  'Drone View (Aerial)', 'GoPro View (Fisheye)', 'Macro (Detail)', 'Telephoto (Compressed Background)'
];

const POSES = [
  '✨ Otomatis', 'Berdiri Percaya Diri', 'Duduk Santai', 'Berjalan Candid', 'Pose Aksi', 
  'Tangan Bersedekap', 'Tangan di Saku', 'Melihat ke Belakang', 'Menoleh Samping (Side Profile)',
  'Duduk di Lantai', 'Melompat Dinamis', 'Selfie Mirror', 'Bersandar di Dinding',
  'Cheek to Cheek (Pipi Ketemu Pipi)', 'Bunny Ears (Telinga Kelinci)', 'Peace Sign (Dua Jari)',
  'Rangkulan Akrab', 'Gaya Bebas Photobooth', 'Saling Menatap'
];

const BG_EFFECTS = ['Bokeh (Blur)', 'Jelas / Tajam'];

interface SubjectData {
  id: number;
  image: File | null;
  name: string;
  gender: string;
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  clothingColor: string;
  fabricType: string;
  accessory: string;
  expression: string;
}

interface SettingsState {
    subjects: Omit<SubjectData, 'image'>[];
    artStyle: string;
    idPhotoColor: string;
    idPhotoClothing: string;
    photoboxConcept: string;
    photoboxColor: string;
    photoboxPattern: string;
    makeup: string;
    locationType: string;
    specificLocation: string;
    manualLocation: string;
    timeOfDay: string;
    lighting: string;
    angle: string;
    pose: string;
    bgEffect: string;
}

interface VirtualPhotoshootProps {
  initialRefImage?: File | null;
  initialState?: any;
  onStateChange?: (state: any) => void;
}

export const VirtualPhotoshootModule: React.FC<VirtualPhotoshootProps> = ({ initialRefImage, initialState, onStateChange }) => {
  const isHydrated = useRef(false);

  const [subjects, setSubjects] = useState<SubjectData[]>([
    {
      id: 1, image: null, name: '', gender: 'Wanita', bodyType: BODY_TYPES['Wanita'][0], hairStyle: HAIR_STYLES['Wanita'][0],
      hairColor: 'Hitam', clothingColor: '✨ Sesuai Prompt', fabricType: '✨ Sesuai Prompt', accessory: 'Tidak Ada', expression: EXPRESSIONS[0]
    }
  ]);

  const [settings, setSettingsState] = useState<Omit<SettingsState, 'subjects'>>({
    artStyle: ART_STYLES[0],
    idPhotoColor: ID_PHOTO_COLORS[0],
    idPhotoClothing: ID_PHOTO_CLOTHING[0].value,
    photoboxConcept: PHOTOBOX_CONCEPTS[0], photoboxColor: PHOTOBOX_COLORS[0], photoboxPattern: PHOTOBOX_PATTERNS[0],
    makeup: MAKEUP_STYLES[0].value,
    locationType: LOCATION_TYPES[0], specificLocation: '', manualLocation: '',
    timeOfDay: TIMES[0], lighting: LIGHTING_EFFECTS[0], angle: CAMERA_ANGLES[0], pose: POSES[0],
    bgEffect: BG_EFFECTS[0]
  });

  const [history, setHistory] = useState<SettingsState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const getCurrentSettings = (): SettingsState => ({
    ...settings,
    subjects: subjects.map(({ image, ...rest }) => rest)
  });

  const applyStateFromHistory = (state: SettingsState) => {
    const { subjects: subjectSettings, ...restSettings } = state;
    setSettingsState(restSettings);
    setSubjects(prevSubjects => subjectSettings.map(s => {
      const existingSubject = prevSubjects.find(ps => ps.id === s.id);
      return { ...s, image: existingSubject?.image || null } as SubjectData;
    }));
  };

  // History update logic
  useEffect(() => {
    if (!isHydrated.current) return;
    const currentFullState = getCurrentSettings();
    
    const lastHistory = history[historyIndex];
    if (!lastHistory || JSON.stringify(currentFullState) !== JSON.stringify(lastHistory)) {
      const newHistory = [...history.slice(0, historyIndex + 1), currentFullState].slice(-20);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [settings, subjects]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      applyStateFromHistory(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      applyStateFromHistory(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  // Hydration from parent
  useEffect(() => {
    if (initialState && !isHydrated.current) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            applyStateFromHistory(initialState.history[newIndex]);
        }
        isHydrated.current = true;
    } else if (!initialState && !isHydrated.current) {
        const initialFullState = getCurrentSettings();
        setHistory([initialFullState]);
        setHistoryIndex(0);
        isHydrated.current = true;
    }
  }, [initialState]);

  // Sync back to parent
  useEffect(() => {
    if (isHydrated.current) {
        onStateChange?.({ 
            history, 
            historyIndex,
            generator: initialState?.generator 
        });
    }
  }, [history, historyIndex]);

  const { artStyle, idPhotoColor, idPhotoClothing, photoboxConcept, photoboxColor, photoboxPattern, makeup, locationType, specificLocation, manualLocation, timeOfDay, lighting, angle, pose, bgEffect } = settings;

  const updateSettingsLocal = (newPart: Partial<typeof settings>) => {
    setSettingsState(prev => ({ ...prev, ...newPart }));
  };

  // Auto-fill Logic
  useEffect(() => {
    if (artStyle === 'Photobox / Photobooth') {
      updateSettingsLocal({
        locationType: 'Indoor (Interior)', specificLocation: 'Studio Photobox', timeOfDay: 'Flash Photography (Studio)',
        lighting: 'Ring Light (Photobooth)', angle: 'Selevel Mata (Eye Level)', pose: 'Gaya Bebas Photobooth', bgEffect: 'Jelas / Tajam'
      });
    } else if (artStyle === 'Pas Foto (ID Photo)') {
      updateSettingsLocal({
        locationType: 'Indoor (Interior)', specificLocation: 'Studio Foto Formal', timeOfDay: 'Flash Photography (Studio)',
        lighting: 'Pencahayaan Studio', angle: 'Selevel Mata (Eye Level)', pose: 'Berdiri Formal (Tangan di Samping)', bgEffect: 'Jelas / Tajam'
      });
    }
  }, [artStyle]);

  const updateSubject = (id: number, field: keyof SubjectData, value: any) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'gender') {
        updated.bodyType = BODY_TYPES[value as string][0];
        updated.hairStyle = HAIR_STYLES[value as string][0];
      }
      return updated;
    }));
  };

  const addSubject = () => {
    if (subjects.length >= 5) return;
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    setSubjects([...subjects, {
      id: newId, image: null, name: '', gender: 'Wanita', bodyType: BODY_TYPES['Wanita'][0],
      hairStyle: HAIR_STYLES['Wanita'][0], hairColor: 'Hitam', clothingColor: '✨ Sesuai Prompt',
      fabricType: '✨ Sesuai Prompt', accessory: 'Tidak Ada', expression: EXPRESSIONS[0]
    }]);
  };

  const removeSubject = (id: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleLocationTypeChange = (val: string) => {
    let newSpecificLocation = '';
    if (val === 'Indoor (Interior)') newSpecificLocation = INDOOR_LOCATIONS[0];
    if (val === 'Outdoor (Alam)') newSpecificLocation = OUTDOOR_LOCATIONS[0];
    if (val === 'Urban (Kota)') newSpecificLocation = URBAN_LOCATIONS[0];
    if (val === 'Fantasy/Sci-Fi') newSpecificLocation = FANTASY_LOCATIONS[0];
    updateSettingsLocal({ locationType: val, specificLocation: newSpecificLocation });
  };

  const handleCustomGenerate = async (
    userPrompt: string, 
    aspectRatio: string, 
    imageSize: string, 
    isBatch: boolean, 
    batchCount: number,
    // Note: baseImage, refImage, faceImage2 are passed from GeneratorModule but this module uses its own subjects state
    baseImage: File | null
  ) => {
    // Sync local subjects[0].image with baseImage if provided by GeneratorModule upload box (though this module primarily uses its own grid)
    const activeSubjectImage = subjects[0].image || baseImage;
    if (!activeSubjectImage) throw new Error("Wajah Utama (Subjek 1) wajib diisi!");

    let locationText = '';
    if (locationType === '✎ Input Manual') locationText = manualLocation;
    else if (locationType !== '✨ Otomatis') locationText = specificLocation;
    
    const makeupText = MAKEUP_STYLES.find(m => m.value === makeup)?.label || '';

    let environmentDetails = [
      `Gaya Seni: ${artStyle}`,
      locationText ? `Lokasi: ${locationText}` : '',
      (timeOfDay !== '✨ Otomatis') ? `Waktu: ${timeOfDay}` : '',
      lighting !== '✨ Otomatis' ? `Pencahayaan: ${lighting}` : '',
      angle !== '✨ Otomatis' ? `Sudut Kamera: ${angle}` : '',
      pose !== '✨ Otomatis' ? `Pose: ${pose}` : '',
      `Latar Belakang: ${bgEffect}`,
    ].filter(Boolean).join(', ');

    const subjectDescriptions = subjects.map((s, idx) => {
       let clothingInstruction = "";
       const subName = s.name ? s.name.toUpperCase() : "STUDENT";
       
       if (artStyle === 'Pas Foto (ID Photo)') {
           if (idPhotoClothing === 'formal_suit') {
               clothingInstruction = "Professional black business suit with a crisp white shirt and a black necktie.";
           } else if (idPhotoClothing === 'white_shirt') {
               clothingInstruction = "Plain crisp white formal long-sleeved shirt with a neat collar.";
           } else if (idPhotoClothing === 'sma_uniform') {
               clothingInstruction = `Indonesian High School (SMA) uniform: Short-sleeved white shirt, grey necktie, an Indonesian red-white flag badge pinned above the left chest pocket, and the OSIS SMA circular emblem (brown and grey) on the pocket. CRITICAL: Add a small white rectangular name tag pinned on the right chest with the text "${subName}" written clearly in black capital letters.`;
           } else if (idPhotoClothing === 'smp_uniform') {
               clothingInstruction = `Indonesian Junior High School (SMP) uniform: Short-sleeved white shirt, navy blue necktie, an Indonesian red-white flag badge pinned above the left chest pocket, and the OSIS SMP circular emblem (yellow and blue) on the pocket. CRITICAL: Add a small white rectangular name tag pinned on the right chest with the text "${subName}" written clearly in black capital letters.`;
           } else if (idPhotoClothing === 'sd_uniform') {
               clothingInstruction = `Indonesian Elementary School (SD) uniform: Short-sleeved white shirt, bright red necktie, an Indonesian red-white flag badge pinned above the left chest pocket, and the OSIS SD circular emblem (red/maroon) on the pocket. CRITICAL: Add a small white rectangular name tag pinned on the right chest with the text "${subName}" written clearly in black capital letters.`;
           }
       }
       
       return `SUBJEK ${idx + 1} (${s.name || `Orang ${idx + 1}`}): ${s.gender}, rambut ${s.hairStyle} warna ${s.hairColor}, pakaian ${clothingInstruction || (s.clothingColor === '✨ Sesuai Prompt' ? 'sesuai tema' : s.clothingColor)}, ekspresi ${s.expression}.`;
    }).join('\n');

    let fullPrompt = `Generasi KUALITAS TERTINGGI (8k resolution, Ultra-Sharp, Crystal Clear).
    ${environmentDetails}.
    Makeup Style: ${makeupText}.
    ${subjectDescriptions}
    Kualitas keseluruhan: Masterpiece, sangat detail, fotorealistik, tekstur kulit nyata.
    Instruksi Tambahan: ${userPrompt}`;

    if (artStyle === 'Pas Foto (ID Photo)') {
        fullPrompt = `[PROFESSIONAL ID PHOTO PROTOCOL]: Create a formal ID Photo / Passport Photo. 
        Background: SOLID PLAIN COLOR '${idPhotoColor.split(' ')[0]}'. 
        Subject: Frontal view, eye level, chest up, neutral expression or slight professional smile. 
        Lighting: Flat studio lighting, no shadows on background. 
        ${subjectDescriptions}
        Composition: Centered subject. Highest detail. Ensure the shirt collar, tie, badges, and name tag are perfectly neat, properly aligned, and the text "${subjects[0].name.toUpperCase()}" is legible.`;
    } else if (artStyle === 'Photobox / Photobooth') {
        let conceptDetails = photoboxConcept;
        if (photoboxConcept === 'Studio Warna (Solid Color)') conceptDetails = `Solid Color Background: ${photoboxColor}`;
        else if (photoboxConcept === 'Studio Motif (Patterned)') conceptDetails = `Patterned Background: ${photoboxPattern}`;
        fullPrompt += `\n[PHOTOBOX MODE]: Concept: ${conceptDetails}. Create a fun, candid, photobooth style image.`;
    }

    const mainImage = activeSubjectImage;
    const extraFaces = subjects.slice(1).map(s => s.image).filter((img): img is File => img !== null);

    if (isBatch) {
        const results: string[] = [];
        for (let i = 0; i < batchCount; i++) {
            const batchPrompt = `${fullPrompt} \n\n[VARIASI BATCH #${i + 1}: Pose dan ekspresi yang berbeda.]`;
            const result = await generateCreativeImage(batchPrompt, mainImage, aspectRatio, imageSize, initialRefImage, extraFaces, true);
            results.push(result);
        }
        return results;
    } else {
        return await generateCreativeImage(fullPrompt, mainImage, aspectRatio, imageSize, initialRefImage, extraFaces, true);
    }
  };

  const renderSubjectControls = (subject: SubjectData, index: number) => (
    <div key={subject.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
      <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
         <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">👤 Subjek {index + 1} {index === 0 ? '(Utama)' : ''}</h3>
         {index > 0 && (
            <button onClick={() => removeSubject(subject.id)} className="text-red-500 hover:text-red-700 p-1 bg-white dark:bg-gray-700 rounded shadow-sm"><Trash2 size={14}/></button>
         )}
      </div>
      <div className="flex gap-4 mb-4">
         <div className="w-24 h-32 flex-shrink-0 relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition-colors bg-white dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => e.target.files && updateSubject(subject.id, 'image', e.target.files[0])} />
            {subject.image ? <img src={URL.createObjectURL(subject.image)} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 p-1"><Upload size={16} className="mx-auto mb-1" /><span className="text-[9px] block leading-tight">Upload Wajah</span></div>}
         </div>
         <div className="flex-1 grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-bold text-gray-400 block mb-0.5">Nama</label><input type="text" value={subject.name} onChange={(e) => updateSubject(subject.id, 'name', e.target.value)} className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white" /></div>
            <div><label className="text-[9px] font-bold text-gray-400 block mb-0.5">Gender</label><select value={subject.gender} onChange={(e) => updateSubject(subject.id, 'gender', e.target.value)} className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white dark:bg-gray-700">{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div><label className="text-[9px] font-bold text-gray-400 block mb-0.5">Rambut</label><select value={subject.hairStyle} onChange={(e) => updateSubject(subject.id, 'hairStyle', e.target.value)} className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white dark:bg-gray-700">{HAIR_STYLES[subject.gender].map(h => <option key={h} value={h}>{h}</option>)}</select></div>
            <div><label className="text-[9px] font-bold text-gray-400 block mb-0.5">Ekspresi</label><select value={subject.expression} onChange={(e) => updateSubject(subject.id, 'expression', e.target.value)} className="w-full p-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white dark:bg-gray-700">{EXPRESSIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div>
         </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <div><label className="text-[9px] text-gray-400 block">Warna Baju</label><select value={subject.clothingColor} onChange={(e) => updateSubject(subject.id, 'clothingColor', e.target.value)} className="w-full p-1 text-[10px] rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" disabled={artStyle==='Pas Foto (ID Photo)'}>{CLOTHING_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-[9px] text-gray-400 block">Tipe Tubuh</label><select value={subject.bodyType} onChange={(e) => updateSubject(subject.id, 'bodyType', e.target.value)} className="w-full p-1 text-[10px] rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">{BODY_TYPES[subject.gender].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label className="text-[9px] text-gray-400 block">Aksesoris</label><select value={subject.accessory} onChange={(e) => updateSubject(subject.id, 'accessory', e.target.value)} className="w-full p-1 text-[10px] rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" disabled={artStyle==='Pas Foto (ID Photo)'}>{ACCESSORIES.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>
    </div>
  );

  const extraControls = (
    <div className="space-y-6">
      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Daftar Subjek ({subjects.length}/5)</h3>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
                </div>
                <button onClick={addSubject} disabled={subjects.length >= 5 || artStyle === 'Pas Foto (ID Photo)'} className="text-xs flex items-center gap-1 bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1.5 rounded-full font-bold transition-colors disabled:opacity-50"><Plus size={14}/> Tambah Orang</button>
            </div>
         </div>
         <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {subjects.map((subject, index) => renderSubjectControls(subject, index))}
         </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-primary-100 dark:border-primary-900 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]">
        <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg">📸</span> PEMANDANGAN & SUASANA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Gaya Artistik</label>
            <div className="relative">
              <select 
                value={artStyle} 
                onChange={(e) => updateSettingsLocal({ artStyle: e.target.value })}
                className="w-full rounded-lg border border-primary-500 bg-transparent dark:bg-gray-700 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
              >
                {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-primary-600">▼</div>
            </div>
          </div>

          {artStyle === 'Pas Foto (ID Photo)' && (
            <>
                <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-semibold text-primary-600 uppercase">Warna Background</label>
                    <div className="relative">
                      <select 
                        value={idPhotoColor} 
                        onChange={(e) => updateSettingsLocal({ idPhotoColor: e.target.value })}
                        className="w-full rounded-lg border border-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-blue-800 dark:text-blue-200"
                      >
                        {ID_PHOTO_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-blue-500">▼</div>
                    </div>
                </div>

                <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] font-semibold text-primary-600 uppercase">Jenis Pakaian</label>
                    <div className="relative">
                      <select 
                        value={idPhotoClothing} 
                        onChange={(e) => updateSettingsLocal({ idPhotoClothing: e.target.value })}
                        className="w-full rounded-lg border border-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-blue-800 dark:text-blue-200"
                      >
                        {ID_PHOTO_CLOTHING.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-blue-500">▼</div>
                    </div>
                    <p className="text-[9px] text-gray-400 italic mt-1 leading-tight">Setting teknis (Waktu, Cahaya, Angle) diatur otomatis untuk standar Pas Foto.</p>
                </div>
            </>
          )}

          {artStyle === 'Photobox / Photobooth' && (
            <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-semibold text-pink-500 uppercase">Konsep Photobox</label>
                <select value={photoboxConcept} onChange={(e) => updateSettingsLocal({ photoboxConcept: e.target.value })} className="w-full rounded-lg border border-pink-300 dark:border-pink-800 bg-pink-50 dark:bg-gray-800 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-pink-500">
                    {PHOTOBOX_CONCEPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Makeup / Riasan</label>
            <div className="relative">
              <select 
                value={makeup} 
                onChange={(e) => updateSettingsLocal({ makeup: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                {MAKEUP_STYLES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>

          {artStyle !== 'Pas Foto (ID Photo)' && (
            <>
              <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Lokasi</label>
                <div className="flex gap-2">
                    <select value={locationType} onChange={(e) => handleLocationTypeChange(e.target.value)} disabled={artStyle === 'Photobox / Photobooth'} className="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                    {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {locationType === '✎ Input Manual' ? (
                    <input type="text" placeholder="Contoh: Di pesawat luar angkasa..." value={manualLocation} onChange={(e) => updateSettingsLocal({ manualLocation: e.target.value })} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                    ) : locationType !== '✨ Otomatis' ? (
                    <select value={specificLocation} onChange={(e) => updateSettingsLocal({ specificLocation: e.target.value })} disabled={artStyle === 'Photobox / Photobooth'} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                        {locationType === 'Indoor (Interior)' && INDOOR_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        {locationType === 'Outdoor (Alam)' && OUTDOOR_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        {locationType === 'Urban (Kota)' && URBAN_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        {locationType === 'Fantasy/Sci-Fi' && FANTASY_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    ) : (
                    <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm text-gray-400 italic">AI akan memilih lokasi terbaik</div>
                    )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Waktu</label>
                <select value={timeOfDay} onChange={(e) => updateSettingsLocal({ timeOfDay: e.target.value })} disabled={artStyle === 'Photobox / Photobooth'} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none disabled:opacity-50">
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Pencahayaan</label>
                <select value={lighting} onChange={(e) => updateSettingsLocal({ lighting: e.target.value })} disabled={artStyle === 'Photobox / Photobooth'} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none disabled:opacity-50">
                {LIGHTING_EFFECTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Sudut Kamera</label>
                <select value={angle} onChange={(e) => updateSettingsLocal({ angle: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none">
                {CAMERA_ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Pose Subjek</label>
                <select value={pose} onChange={(e) => updateSettingsLocal({ pose: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none">
                {POSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Efek Latar</label>
                <select value={bgEffect} onChange={(e) => updateSettingsLocal({ bgEffect: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none">
                {BG_EFFECTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="virtual-photoshoot"
      title="GeGe Foto Studio"
      description="Selfie-mu bisa jadi foto studio keren! Coba berbagai konsep profesional tanpa perlu ke studio beneran."
      promptPrefix=""
      requireImage={false} 
      allowReferenceImage={artStyle !== 'Pas Foto (ID Photo)'}
      referenceImageLabel="Referensi Outfit/Pose (Global)"
      allowAdditionalFaceImage={false}
      extraControls={extraControls}
      batchModeAvailable={true}
      initialRefImage={initialRefImage}
      customGenerateHandler={handleCustomGenerate}
      defaultAspectRatio={artStyle === 'Pas Foto (ID Photo)' ? '3:4' : '1:1'}
      initialState={initialState?.generator}
      onStateChange={(genState) => {
        onStateChange?.({ history, historyIndex, generator: genState });
      }}
    />
  );
};
