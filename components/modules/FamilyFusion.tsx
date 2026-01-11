
import React, { useState } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { UserPlus, Plus, Trash2, ShieldCheck, Zap, Info } from 'lucide-react';

interface MissingMember {
  id: number;
  image: File | null;
  name: string;
}

interface FamilyFusionProps {
  initialState?: any;
  onStateChange?: (state: any) => void;
}

export const FamilyFusionModule: React.FC<FamilyFusionProps> = ({ initialState, onStateChange }) => {
  const [missingMembers, setMissingMembers] = useState<MissingMember[]>([
    { id: Date.now(), image: null, name: '' }
  ]);

  const addMember = () => {
    if (missingMembers.length < 4) {
      setMissingMembers([...missingMembers, { id: Date.now(), image: null, name: '' }]);
    }
  };

  const removeMember = (id: number) => {
    if (missingMembers.length > 1) {
      setMissingMembers(missingMembers.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: number, field: keyof MissingMember, value: any) => {
    setMissingMembers(missingMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleCustomGenerate = async (
    prompt: string,
    aspectRatio: string,
    imageSize: string,
    isBatch: boolean,
    batchCount: number,
    baseImage: File | null
  ) => {
    if (!baseImage) throw new Error("Foto Keluarga Utama wajib diunggah.");
    
    const validMissing = missingMembers.filter(m => m.image !== null);
    if (validMissing.length === 0) throw new Error("Minimal satu foto anggota keluarga tambahan wajib diunggah.");

    // Build specialized prompt for adding people
    const names = validMissing.map(m => m.name || "Family Member").join(", ");
    
    const mergePrompt = `
      [TASK: SEAMLESS CHARACTER ADDITION]
      OBJECTIVE: Add ${validMissing.length} new person/people (${names}) into the provided Base Family Photo.
      
      STRICT INSTRUCTIONS:
      1. PRESERVE ORIGINALS: DO NOT replace or change any faces or bodies that are already present in the Base Photo (GAMBAR 1). They must remain 100% untouched.
      2. LOGICAL PLACEMENT: Identify natural empty spots, such as an empty chair, a gap in the standing row, or an empty space in the background. Place the NEW members there.
      3. SCALE MATCH: Adjust the height and body size of the new members to match the existing family members based on the camera perspective.
      4. LIGHTING SYNC: Match the ambient light direction, color temperature, and shadow intensity of the original photo so the added members look like they were actually there.
      5. IDENTITY: The new members MUST have 100% accurate faces from their respective reference photos.
      
      TECHNICAL: Professional high-end DSLR family portrait style, 8K resolution, Crystal Clear.
      USER NOTES: ${prompt}
    `;

    const extraFaces = validMissing.map(m => m.image as File);
    const { generateCreativeImage } = await import('../../services/geminiService');
    
    // @google/genai-api:fix - Fixed argument count mismatch. Removed extra 8th argument.
    return await generateCreativeImage(mergePrompt, baseImage, aspectRatio, imageSize, null, extraFaces, true);
  };

  const extraControls = (
    <div className="space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={18} /> Anggota Keluarga Tambahan
          </h3>
          <button 
            onClick={addMember}
            disabled={missingMembers.length >= 4}
            className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-500 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Plus size={12} /> TAMBAH ORANG
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {missingMembers.map((member, index) => (
            <div key={member.id} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-emerald-100 dark:border-white/5 shadow-sm space-y-3 relative group">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Person #{index + 1}</span>
                {missingMembers.length > 1 && (
                  <button onClick={() => removeMember(member.id)} className="text-red-400 hover:text-red-500"><Trash2 size={14}/></button>
                )}
              </div>
              
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden flex-shrink-0 cursor-pointer hover:border-emerald-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => updateMember(member.id, 'image', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  {member.image ? (
                    <img src={URL.createObjectURL(member.image)} className="w-full h-full object-cover" />
                  ) : (
                    <UserPlus size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Nama</label>
                  <input 
                    type="text" 
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    placeholder="Contoh: Ayah..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-xl flex gap-3 items-start">
           <ShieldCheck size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
           <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
             <b>Pro Tip:</b> AI akan mencari celah kosong di foto utama (kursi kosong atau sela berdiri) untuk menempatkan orang baru tanpa menghapus orang lama.
           </p>
        </div>
      </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="family-fusion"
      title="GeGe Family Fusion"
      description="Satukan kembali momen berharga. Tambahkan anggota keluarga yang berhalangan hadir ke dalam foto keluarga utama secara cerdas dan natural."
      promptPrefix=""
      requireImage={true}
      mainImageLabel="Foto Keluarga (Base)"
      allowReferenceImage={false}
      extraControls={extraControls}
      customGenerateHandler={handleCustomGenerate}
      defaultAspectRatio="16:9"
      batchModeAvailable={false}
      initialState={initialState}
      onStateChange={onStateChange}
    />
  );
};
