import React, { useState, useEffect } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { RotateCcw, RotateCw } from 'lucide-react';

interface BikiniPhotoshootProps {
  initialState?: any;
  onStateChange?: (state: any) => void;
}
// ... (Constants remain the same) ...
const MODES = [
  { value: 'reference', label: 'Mode Foto Referensi (Ganti Wajah)' },
  { value: 'free', label: 'Mode Bebas (Buat Wajah Baru)' }
];
const FACE_SHAPES = ['Oval', 'Bulat', 'Kotak', 'Hati', 'Diamond', 'Panjang'];
const ETHNICITIES = ['Indonesian', 'Japanese', 'Korean', 'Middle Eastern (Arab)', 'Caucasian (European)', 'Caucasian (American)', 'Russian', 'African', 'Latina'];
const BODY_TYPES = ['Standar (Proporsional)', 'Kurus (Skinny)', 'Langsing (Slim/Fit)', 'Gemoy (Chubby/Curvy)', 'Obesitas (Plus Size)'];
const BREAST_SIZES = ['Rata (Flat/Petite)', 'Kecil (Small A-Cup)', 'Sedang (Medium B/C-Cup)', 'Berisi (Full D-Cup)', 'Besar (Large E-Cup)', 'Sangat Besar (Massive/Voluminous)', 'Natural (Teardrop Shape)', 'Push-Up Effect (Cleavage)'];
const SKIN_TONES = [{ value: 'Fair skin', label: 'Putih Cerah (Fair)' }, { value: 'Light skin', label: 'Putih Langsat (Light)' }, { value: 'Olive skin', label: 'Kuning Langsat (Olive)' }, { value: 'Tan skin', label: 'Sawo Matang (Tan)' }, { value: 'Brown skin', label: 'Cokelat (Brown)' }, { value: 'Dark skin', label: 'Hitam Manis (Dark)' }];
const EYE_COLORS = ['Cokelat Tua', 'Hitam', 'Cokelat Muda', 'Biru', 'Hijau', 'Hazel', 'Abu-abu'];
const NAIL_COLORS = ['Alami (Tanpa Cat)', 'Merah Klasik', 'Nude', 'Hitam', 'Putih', 'French Manicure', 'Pink Cerah', 'Biru Tua'];
const HAIR_STYLES = ['Lurus Panjang', 'Ikat Kuda', 'Model Kepang', 'Poni Depan', 'French Bob', 'Classic Bob', 'Boyfriend Bob', 'Bob Oval', 'Pixie Cut', 'Retro Pixie/Mullet', 'Feathery Fringe', 'Angled Bob', 'Bob dengan Layer', 'Wolf Cut', 'Bob Ikal', 'Bob Keriting', 'Bob Shaggy', 'Blunt Cut', 'Side-parted Lob', 'Medium Layer', 'Butterfly Haircut', 'Hime Cut', 'Shaggy', 'Rambut Layer Panjang', 'Wavy Hair'];
const HAIR_COLORS = ['Chocolate Brown', 'Burgundy', 'Rose Pink', 'Brunette', 'Light Brown', 'Chestnut', 'Ash Brown', 'Pastel', 'Jet Black', 'Golden Copper', 'Honey Blonde', 'Platinum Gray', 'Deep Violet', 'Sunflower Blonde'];
const BIKINI_TYPES = ['Triangle bikini', 'Bandeau bikini', 'Microkini', 'Thong', 'High-Waisted bikini', 'Tankini', 'Monokini', 'Sport Bikini', 'Lace Bikini'];
const BACKGROUND_TYPES = ['Kolam Renang', 'Kamar', 'Pantai', 'Hutan', 'Kafe', 'Studio', 'Air terjun', 'Sungai', 'Yacht Mewah', 'Rooftop Bar'];
const STUDIO_CONCEPTS = ['Studio Modern', 'Studio Klasik', 'Studio Mewah', 'Studio Industrial', 'Floral/Botanical', 'Furnitur Vintage', 'Geometris Minimalis', 'Polos Putih', 'Polos Hitam', 'Polos Abu-abu', 'Polos Krem', 'Spotlight Dramatis', 'Neon Abstrak'];
const TIMES = ['Matahari Terbit (Sunrise)', 'Pagi (Cerah)', 'Siang (Terik)', 'Sore (Golden Hour)', 'Senja (Blue Hour)', 'Malam (City Lights)', 'Tengah Malam (Dark)'];
const ANGLES = ['Eye Level (Sejajar Mata)', 'Low Angle (Dari Bawah)', 'High Angle (Dari Atas)', 'Bird\'s Eye View (Drone)', 'Selfie Angle', 'Close-Up', 'Medium Shot', 'Full Body Shot', 'Dutch Angle', 'Over-the-Shoulder', 'Wide Angle Lens', 'Telephoto Lens (Compressed)'];
const POSES = ['Pose Standing', 'Pose Duduk (Relax)', 'Pose Berbaring (Dreamy)', 'Pose Dinamis (Action)', 'Pose Editorial', 'Body Curve Pose', 'Pose Menyapa (Salam)', 'Candid Tertawa', 'Pose Berjalan Elegan', 'Pose Menoleh ke Samping', 'Close Up Wajah', 'Tangan Menyentuh Dagu', 'Bersandar pada Dinding', 'Pose Siluet Misterius', 'Memainkan Rambut', 'Melihat ke Cakrawala'];
const MAKEUP_STYLES = [{ value: 'auto', label: '✨ Auto (AI)' }, { value: 'bronzed_beach', label: 'Bronzed / Sun-Kissed (Best for Beach)' }, { value: 'glossy_wet', label: 'Glossy / Wet Look (Best for Pool)' }, { value: 'natural_no_makeup', label: 'No Makeup / Natural Look' }, { value: 'soft_glam', label: 'Soft Glam (Natural Radiance)' }, { value: 'full_glam', label: 'Full Glam (Heavy Makeup)' }, { value: 'editorial_fashion', label: 'Editorial / High Fashion' }, { value: 'korean_glass_skin', label: 'Korean Glass Skin (Dewy)' }, { value: 'smokey_eyes', label: 'Smokey Eyes & Nude Lips' }, { value: 'vintage_retro', label: 'Vintage / Retro (Red Lips)' }, { value: 'goth_dark', label: 'Gothic / Dark Aesthetics' }, { value: 'fantasy_ethereal', label: 'Fantasy / Ethereal (Glitter)' }, { value: 'cyberpunk_neon', label: 'Cyberpunk / Neon Accents' }, { value: 'bridal', label: 'Bridal / Wedding Day' }, { value: 'matte_finish', label: 'Matte Finish (Velvet Skin)' }];

interface SettingsState {
    mode: string;
    faceShape: string;
    ethnicity: string;
    bodyType: string;
    breastSize: string;
    skinTone: string;
    eyeColor: string;
    nailColor: string;
    hairStyle: string;
    customHairStyle: string;
    hairColor: string;
    makeup: string;
    bikiniType: string;
    customBikini: string;
    background: string;
    customBackground: string;
    studioConcept: string;
    time: string;
    cameraAngle: string;
    customAngle: string;
    pose: string;
    customPose: string;
}

export const BikiniPhotoshootModule: React.FC<BikiniPhotoshootProps> = ({ initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    mode: 'reference',
    faceShape: FACE_SHAPES[0],
    ethnicity: ETHNICITIES[0],
    bodyType: BODY_TYPES[0],
    breastSize: BREAST_SIZES[2],
    skinTone: SKIN_TONES[0].value,
    eyeColor: EYE_COLORS[0],
    nailColor: NAIL_COLORS[1],
    hairStyle: HAIR_STYLES[0],
    customHairStyle: '',
    hairColor: HAIR_COLORS[0],
    makeup: MAKEUP_STYLES[0].value,
    bikiniType: BIKINI_TYPES[0],
    customBikini: '',
    background: BACKGROUND_TYPES[0],
    customBackground: '',
    studioConcept: STUDIO_CONCEPTS[0],
    time: TIMES[3],
    cameraAngle: ANGLES[6],
    customAngle: '',
    pose: POSES[0],
    customPose: '',
  });

  const [promptPrefix, setPromptPrefix] = useState('');

  // --- Settings History ---
  const [history, setHistory] = useState<SettingsState[]>([settings]);
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
    } else if (initialState?.settings) { // Legacy support
        const s = initialState.settings;
        const loadedSettings = { ...settings, ...s };
        setSettingsState(loadedSettings);
        setHistory([loadedSettings]);
        setHistoryIndex(0);
    }
  }, [initialState]);

  useEffect(() => {
    onStateChange?.({ 
        history, 
        historyIndex,
        generator: initialState?.generator 
    });
  }, [history, historyIndex]);

  useEffect(() => {
    const { 
        mode, faceShape, ethnicity, bodyType, breastSize, skinTone, eyeColor, nailColor,
        hairStyle, customHairStyle, hairColor, makeup, bikiniType, customBikini,
        background, customBackground, studioConcept, time, cameraAngle, customAngle, pose, customPose
     } = settings;

    const realismHeader = `
    [SYSTEM INSTRUCTION: CRYSTAL CLEAR PHOTOREALISM]
    You are a high-end fashion photographer using a Phase One XF IQ4 150MP Camera with an 85mm G-Master lens.
    **MANDATORY OUTPUT RULES:**
    1.  **RESOLUTION:** 8K UHD, Crystal Clear, Ultra-Sharp. Zero Blur. Maximum Clarity.
    2.  **SKIN TEXTURE:** You MUST generate visible, organic skin texture: pores, vellus hair (peach fuzz), slight skin unevenness, and natural moles. Skin should NEVER be perfectly smooth or plastic-like.
    3.  **IMPERFECTIONS:** Add subtle film grain (very fine), ISO noise (minimal), but keep the image SHARP.
    4.  **LIGHTING PHYSICS:** Use Subsurface Scattering (SSS) for skin. Light should penetrate translucent areas (ears/fingers) realistically.
    5.  **NO HAZE:** Ensure the image has high contrast and no milky/hazy overlay.
    If the image looks like a "Second Life" avatar or a "Sims" character, it is a FAILED generation.
    `;
    const strictNegativePrompt = `
    **NEGATIVE PROMPT (FORBIDDEN):**
    (3d render, cgi, octane render, unreal engine, blender, digital painting, cartoon, anime, sketch, drawing),
    (smooth skin, plastic skin, wax figure, rubber skin, doll, mannequin, airbrushed, photoshop filter, beauty filter),
    (blur, hazy, out of focus, low quality, pixelated, distorted fingers, extra limbs, low resolution, blurry).
    `;
    const finalHair = hairStyle === 'manual' ? customHairStyle : hairStyle;
    const finalBikini = bikiniType === 'manual' ? customBikini : bikiniType;
    const finalPose = pose === 'manual' ? customPose : pose;
    const finalAngle = cameraAngle === 'manual' ? customAngle : cameraAngle;
    let finalBg = background === 'manual' ? customBackground : background;
    let timePrompt = time;
    if (background === 'Studio') {
      finalBg = studioConcept;
      if (['Polos Putih', 'Polos Hitam', 'Polos Abu-abu'].some(c => studioConcept.includes(c))) {
        timePrompt = "Professional Studio Lighting";
      }
    }
    let bodyPrompt = "Balanced proportions, athletic fit physique";
    switch(bodyType) {
        case 'Standar (Proporsional)': bodyPrompt = "Balanced proportions, athletic fit physique, healthy weight, authentic body shape"; break;
        case 'Kurus (Skinny)': bodyPrompt = "Very slender, skinny physique, visible collarbones, prominent bone structure, petite frame, thin model"; break;
        case 'Langsing (Slim/Fit)': bodyPrompt = "Slim, toned, fit, elegant figure, lean muscle definition"; break;
        case 'Gemoy (Chubby/Curvy)': bodyPrompt = "Chubby, soft round features, curvy, thick thighs, soft skin texture, natural rolls, full figure"; break;
        case 'Obesitas (Plus Size)': bodyPrompt = "Obese, plus-size, heavy full figure, massive build, very soft body structure, realistic weight distribution"; break;
    }
    let breastSizePrompt = "Medium proportional bust";
    switch(breastSize) {
        case 'Rata (Flat/Petite)': breastSizePrompt = "Flat chest, petite bust, small A-cup"; break;
        case 'Kecil (Small A-Cup)': breastSizePrompt = "Small breasts, A-cup, natural lift, petite"; break;
        case 'Sedang (Medium B/C-Cup)': breastSizePrompt = "Medium breasts, B-cup to C-cup, proportional to body"; break;
        case 'Berisi (Full D-Cup)': breastSizePrompt = "Full breasts, D-cup, round shape, natural gravity"; break;
        case 'Besar (Large E-Cup)': breastSizePrompt = "Large breasts, E-cup, voluminous, heavy chest, natural sag"; break;
        case 'Sangat Besar (Massive/Voluminous)': breastSizePrompt = "Very large breasts, massive proportions, hyper-voluminous"; break;
        case 'Natural (Teardrop Shape)': breastSizePrompt = "Natural breasts, teardrop shape, soft look, unenhanced"; break;
        case 'Push-Up Effect (Cleavage)': breastSizePrompt = "Push-up effect, deep cleavage, lifted look, firm"; break;
    }
    let makeupPrompt = "";
    switch (makeup) {
      case 'auto': makeupPrompt = "Professional makeup suitable for the lighting and context."; break;
      case 'bronzed_beach': makeupPrompt = "Sun-Kissed Bronzed Makeup: Warm bronzer on high points of face, golden highlighter, faux freckles, warm brown eyeshadow, tinted lip oil, summer glow."; break;
      case 'glossy_wet': makeupPrompt = "High-Gloss Wet Look Makeup: Wet-look eyelids, glossy highlights on cheekbones, high-shine lip gloss, dewy fresh skin, modern runway aesthetic."; break;
      case 'natural_no_makeup': makeupPrompt = "Professional No-Makeup Look: Ultra-realistic skin texture, hydrated glow, groomed eyebrows, clear mascara, subtle lip balm, healthy complexion."; break;
      case 'soft_glam': makeupPrompt = "Professional Soft Glam Makeup: Flawless dewy skin base, soft contouring, highlighted cheekbones, neutral eyeshadow with high definition, glossy nude lips."; break;
      case 'full_glam': makeupPrompt = "Professional Full Glam Makeup: Full coverage foundation, sharp contour, baking, cut crease eyeshadow, thick volumetric false lashes, bold matte lipstick."; break;
      case 'editorial_fashion': makeupPrompt = "High-Fashion Editorial Makeup: Avant-garde application, creative graphic liner, glossy eyelids, glass skin texture, unique artistic elements."; break;
      case 'korean_glass_skin': makeupPrompt = "Korean Glass Skin Makeup: Extremely hydrated and reflective skin surface, straight brows, gradient lips (ombure), puppy eyeliner, peach or pink blush."; break;
      case 'smokey_eyes': makeupPrompt = "Classic Smokey Eye Makeup: Intense black and charcoal gradient eyeshadow, smudged kohl liner, nude lips to balance, sharp brows."; break;
      case 'vintage_retro': makeupPrompt = "Vintage Retro Makeup: Classic red bold lips, sharp black winged eyeliner, matte skin finish, Hollywood waves hairstyle match."; break;
      case 'goth_dark': makeupPrompt = "Professional Gothic Makeup: Pale matte skin foundation, dark contour, heavy black eyeshadow, dark plum or black lipstick, sharp arch brows."; break;
      case 'fantasy_ethereal': makeupPrompt = "Fantasy Ethereal Makeup: Iridescent highlighter, facial glitter accents, pastel colors, soft focus application, fairy-like aesthetic."; break;
      case 'cyberpunk_neon': makeupPrompt = "Cyberpunk Neon Makeup: Neon graphic liner (pink/blue/green), metallic skin finish, futuristic patterns on face, LED-like glow effects."; break;
      case 'bridal': makeupPrompt = "Professional Bridal Makeup: Soft romantic pinks and champagnes, radiant long-wear base, individual lashes, blushing cheeks, rosebud lips."; break;
      case 'matte_finish': makeupPrompt = "Velvet Matte Makeup: Zero shine, full coverage matte foundation, powdered finish, defined matte lips, sculpted features."; break;
      default: makeupPrompt = "High-quality professional makeup application.";
    }
    let subjectContext = "";
    if (mode === 'free') {
      subjectContext = `
      **Model Description:**
      Ethnicity: '${ethnicity}'.
      Face Shape: '${faceShape}'.
      **REALISM CHECK:** The model must look like a real person found on Instagram or a magazine, NOT a generated character.
      `;
    } else {
      subjectContext = `
      **Context: Face Swap / Identity Transfer.**
      Use the facial features from the provided reference image (Image 1).
      Apply them to a REAL, LIVING HUMAN BODY described below.
      Blend the face naturally with the neck and skin tone.
      `;
    }
    const fullPrompt = `
    ${realismHeader}
    ${strictNegativePrompt}
    **Subject:** A professional female model posing for a high-end summer catalog.
    **CAMERA METADATA:**
    Shot on Sony A7R V, 85mm f/1.4 GM lens.
    Settings: ISO 100, f/2.8, 1/250s.
    Format: RAW, 8K Resolution, Crystal Clear.
    ${subjectContext}
    **Physical Details (STRICT ADHERENCE):**
    - Body Type: ${bodyPrompt}
    - Chest/Bust Details: ${breastSizePrompt}
    - Eye Color: '${eyeColor}' (Natural, with realistic moisture/reflection).
    - Skin Tone: '${skinTone}' (Must look organic, show pores).
    - Nails: '${nailColor}'.
    - Hairstyle: '${finalHair}' in '${hairColor}'.
    **Makeup / Beauty:**
    - Style: ${makeupPrompt}
    **Outfit:** 
    - She is wearing a '${finalBikini}'. Fabric texture must be visible (weave, stitching).
    **Scene Settings:**
    - Camera Angle: ${finalAngle}
    - Pose: ${finalPose}
    - Background: '${finalBg}'
    - Lighting/Time: '${timePrompt}'
    IMPORTANT: The subject is barefoot. Ensure the composition is balanced and artistic. 
    Final check: Does this look like a real photo? If yes, generate.
    `;
    setPromptPrefix(fullPrompt);
  }, [settings]);

  const { mode, faceShape, ethnicity, bodyType, breastSize, skinTone, eyeColor, nailColor, hairStyle, customHairStyle, hairColor, makeup, bikiniType, customBikini, background, customBackground, studioConcept, time, cameraAngle, customAngle, pose, customPose } = settings;

  const renderDropdown = (label: string, value: string, onChange: (val: string) => void, options: string[] | {value: string, label: string}[], hasManual = false) => (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-500 uppercase">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
      >
        {options.map((opt: any) => (
          <option key={opt.label ? opt.value : opt} value={opt.label ? opt.value : opt}>
            {opt.label || opt}
          </option>
        ))}
        {hasManual && <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>}
      </select>
    </div>
  );

  const extraControls = (
    <div className="space-y-6">
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Pilih Mode Generate</label>
            <div className="flex items-center gap-2">
                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
            </div>
        </div>
        <select 
          value={mode}
          onChange={(e) => updateSettings({ mode: e.target.value })}
          className="w-full rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 p-3 text-sm dark:text-white outline-none mt-2"
        >
          {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {mode === 'free' && (
           <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
              {renderDropdown("Tipe Wajah", faceShape, (v) => updateSettings({faceShape: v}), FACE_SHAPES)}
              {renderDropdown("Etnisitas", ethnicity, (v) => updateSettings({ethnicity: v}), ETHNICITIES)}
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Detail Fisik</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
           {renderDropdown("Tipe Tubuh", bodyType, (v) => updateSettings({bodyType: v}), BODY_TYPES)}
           {renderDropdown("Ukuran Payudara", breastSize, (v) => updateSettings({breastSize: v}), BREAST_SIZES)}
           {renderDropdown("Warna Kulit", skinTone, (v) => updateSettings({skinTone: v}), SKIN_TONES)}
           {renderDropdown("Warna Mata", eyeColor, (v) => updateSettings({eyeColor: v}), EYE_COLORS)}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Rambut & Gaya</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Gaya Rambut</label>
              <select 
                value={hairStyle} onChange={(e) => updateSettings({ hairStyle: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
              >
                {HAIR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>
              </select>
              {hairStyle === 'manual' && (
                <input 
                  type="text" value={customHairStyle} onChange={(e) => updateSettings({ customHairStyle: e.target.value })} placeholder="Ketik gaya rambut..."
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              )}
           </div>
           {renderDropdown("Warna Rambut", hairColor, (v) => updateSettings({ hairColor: v }), HAIR_COLORS)}
           
           {renderDropdown("Riasan / Makeup", makeup, (v) => updateSettings({ makeup: v }), MAKEUP_STYLES)}
           {renderDropdown("Warna Kuku", nailColor, (v) => updateSettings({ nailColor: v }), NAIL_COLORS)}

           <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase text-pink-500">Jenis Bikini</label>
              <select 
                value={bikiniType} onChange={(e) => updateSettings({ bikiniType: e.target.value })}
                className="w-full rounded-md border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
              >
                {BIKINI_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>
              </select>
              {bikiniType === 'manual' && (
                <input 
                  type="text" value={customBikini} onChange={(e) => updateSettings({ customBikini: e.target.value })} placeholder="Detail pakaian..."
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              )}
           </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
         <h3 className="text-xs font-bold text-blue-500 uppercase mb-3 flex items-center gap-2">
            <span>🏝️</span> Scene & Kamera
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Latar Belakang</label>
              <select 
                value={background} onChange={(e) => updateSettings({ background: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
              >
                {BACKGROUND_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>
              </select>
              {background === 'manual' && (
                <input 
                  type="text" value={customBackground} onChange={(e) => updateSettings({ customBackground: e.target.value })} placeholder="Lokasi..."
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              )}
              {background === 'Studio' && (
                 <select 
                   value={studioConcept} onChange={(e) => updateSettings({ studioConcept: e.target.value })}
                   className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1.5 text-[10px] dark:text-white"
                 >
                    {STUDIO_CONCEPTS.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              )}
            </div>

            {renderDropdown("Waktu", time, (v) => updateSettings({ time: v }), TIMES)}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Angle Kamera</label>
              <select 
                value={cameraAngle} onChange={(e) => updateSettings({ cameraAngle: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
              >
                {ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>
              </select>
              {cameraAngle === 'manual' && (
                <input 
                  type="text" value={customAngle} onChange={(e) => updateSettings({ customAngle: e.target.value })} placeholder="Angle..."
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Pose</label>
              <select 
                value={pose} onChange={(e) => updateSettings({ pose: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-xs dark:text-white outline-none"
              >
                {POSES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="manual" className="text-yellow-600 font-bold">✎ Input Manual...</option>
              </select>
              {pose === 'manual' && (
                <input 
                  type="text" value={customPose} onChange={(e) => updateSettings({ customPose: e.target.value })} placeholder="Pose..."
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-xs dark:text-white"
                />
              )}
            </div>

         </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="bikini-photoshoot"
      title="GeGe Summer Mode"
      description="Buat foto musim panas ala selebgram! Dapatkan potret bikini & swimwear super realistis di lokasi impianmu."
      promptPrefix={promptPrefix}
      requireImage={settings.mode === 'reference'} 
      mainImageLabel={settings.mode === 'reference' ? "Foto Wajah (Wajib)" : "Tidak Perlu Foto"}
      
      allowReferenceImage={true}
      referenceImageLabel="Foto Kostum (Opsional)"
      
      extraControls={extraControls}
      batchModeAvailable={true}
      defaultAspectRatio="3:4"
      
      initialState={initialState?.generator}
      onStateChange={(state) => onStateChange?.({ 
        history, 
        historyIndex,
        generator: state 
      })}
    />
  );
};