
import { GoogleGenAI, Type, Modality } from "@google/genai";

// State global untuk menyimpan kunci aktif
let activeKeys: string[] = [];

export const setGlobalApiKeys = (keys: string[]) => {
  activeKeys = keys.filter(k => k.trim() !== "");
};

/**
 * Fungsi untuk mengacak array (Fisher-Yates Shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Fungsi Inti: Mengeksekusi pemanggilan API dengan sistem rotasi jika kuota habis (Error 429)
 */
async function callWithRetry<T>(apiCall: (ai: any) => Promise<T>): Promise<T> {
  const vaultData = localStorage.getItem('gege_api_vault');
  let localKeys: string[] = [];
  let useSystemKey = true;

  if (vaultData) {
    try {
      const parsed = JSON.parse(vaultData);
      localKeys = parsed.keys.filter((k: string, i: number) => parsed.activeToggles[i] && k.trim().length >= 30);
      useSystemKey = parsed.useSystemKey !== false;
    } catch(e) {}
  }

  // Gabungkan dan acak kunci agar distribusi beban merata
  let keysToTry = shuffleArray([...localKeys]);
  if (useSystemKey && process.env.API_KEY) {
    keysToTry.push(process.env.API_KEY);
  }

  // Hapus duplikat
  keysToTry = [...new Set(keysToTry)];

  if (keysToTry.length === 0) {
    throw new Error("Tidak ada API Key yang aktif. Silakan isi di menu Settings.");
  }

  let lastError: any = null;

  for (let i = 0; i < keysToTry.length; i++) {
    const currentKey = keysToTry[i];
    const keyDisplay = `${currentKey.substring(0, 6)}...${currentKey.substring(currentKey.length - 4)}`;
    
    console.log(`[GeGe AI] Mencoba Kunci #${i + 1} (${keyDisplay})`);

    try {
      const ai = new GoogleGenAI({ apiKey: currentKey });
      const result = await apiCall(ai);
      console.log(`[GeGe AI] ✅ Berhasil menggunakan Kunci #${i + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("limit");
      
      if (isQuotaError) {
        console.warn(`[GeGe AI] ⚠️ Kunci #${i + 1} terkena limit kuota. Mencoba kunci lain...`);
        // Beri jeda sangat singkat sebelum pindah kunci
        await new Promise(r => setTimeout(r, 200));
        continue; 
      }
      
      // Jika error bukan karena kuota (misal: prompt dilarang), langsung lempar errornya
      throw error;
    }
  }
  
  // Jika sampai sini, berarti semua kunci gagal
  const totalKeys = keysToTry.length;
  console.error(`[GeGe AI] ❌ Semua (${totalKeys}) kunci gagal.`);
  
  // Modifikasi pesan error agar lebih informatif
  if (lastError?.message?.includes("429")) {
      throw new Error(`Seluruh (${totalKeys}) API Key kamu sudah habis kuota hari ini. Google membatasi generate gambar di akun Free Tier. Coba lagi 1 jam lagi atau gunakan akun Google lain.`);
  }

  throw lastError || new Error("Gagal terhubung ke AI.");
}

export interface StoryboardSceneData {
  action: string;
  camera: string;
  dialogue?: string;
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        } else {
            reject(new Error("Failed to read file"));
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function pcmToWav(pcmData: Uint8Array, sampleRate: number): Blob {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (v: DataView, o: number, s: string) => {
        for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    const pcmDataView = new Uint8Array(buffer, 44);
    pcmDataView.set(pcmData);
    return new Blob([buffer], { type: 'audio/wav' });
}

export const generateCreativeImage = async (
  prompt: string,
  baseImage: File | null = null,
  aspectRatio: string = "1:1",
  imageSize: string = "1K",
  refImage: File | null = null,
  faceImage2: File | null | File[] = null,
  preserveFace: boolean = false
): Promise<string> => {
  const parts: any[] = [{ text: prompt }];
  if (baseImage) parts.push({ inlineData: { mimeType: baseImage.type, data: await fileToBase64(baseImage) } });
  if (refImage) parts.push({ inlineData: { mimeType: refImage.type, data: await fileToBase64(refImage) } });
  if (faceImage2) {
    const faces = Array.isArray(faceImage2) ? faceImage2 : [faceImage2];
    for (const f of faces) if (f instanceof File) parts.push({ inlineData: { mimeType: f.type, data: await fileToBase64(f) } });
  }

  let model = 'gemini-2.5-flash-image';
  if (imageSize === '2K' || imageSize === '4K') model = 'gemini-3-pro-image-preview';

  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
          imageConfig: {
              aspectRatio: aspectRatio as any,
              ...(model === 'gemini-3-pro-image-preview' ? { imageSize: imageSize as any } : {})
          }
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated.");
  });
};

export const generateRenovationStory = async (o: string, c: string, l: string, r: string, s: number) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Direct architectural timelapse for ${o}, from ${c} in ${l} to ${r} in ${s} steps. JSON output.`,
      config: { 
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  firstFramePrompt: { type: Type.STRING },
                  timelapseSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
          }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateInfographicPrompt = async (topic: string) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create prompt for infographic about: ${topic}.`,
    });
    return response.text || "";
  });
};

export const generateRandomPrompt = async () => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a creative and detailed image generation prompt.",
    });
    return response.text || "";
  });
};

export const refineUserPrompt = async (prompt: string) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this prompt: "${prompt}"`,
    });
    return response.text || prompt;
  });
};

export const analyzeImagePrompt = async (imageBase64: string) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: "Analyze this image and provide a detailed text prompt." }
        ]
      }
    });
    return response.text || "";
  });
};

export const generateSocialCaption = async (imageBase64: string, platform: string) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageBase64 } },
          { text: `Write a caption for ${platform}.` }
        ]
      }
    });
    return response.text || "";
  });
};

export const generateCharacterDescription = async (character: string, series: string) => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Describe character ${character} from ${series}.`,
    });
    return response.text || "";
  });
};

export const generateStoryFromImage = async (imageUrl: string, characterName: string) => {
    let base64 = "";
    if (imageUrl.startsWith('data:')) base64 = imageUrl.split(',')[1];
    else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        base64 = await fileToBase64(new File([blob], "image.png"));
    }
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64 } },
                    { text: `Write a short creative story about this character (${characterName}).` }
                ]
            }
        });
        return response.text || "";
    });
};

export const generateVeoVideo = async (prompt: string, aspectRatio: string = '16:9', imageFile: File | null = null): Promise<string> => {
    let imageInput = undefined;
    if (imageFile) {
        imageInput = { imageBytes: await fileToBase64(imageFile), mimeType: imageFile.type };
    }

    return await callWithRetry(async (ai) => {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: imageInput,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
        });
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation failed");
        // Gunakan API Key yang sedang digunakan oleh instance AI ini
        const response = await fetch(`${downloadLink}&key=${ai.apiKey}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    });
};

export const generateStoryboardPlan = async (theme: string, count: number): Promise<StoryboardSceneData[]> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Create a storyboard plan for theme: "${theme}". Return JSON array.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            action: { type: Type.STRING },
                            camera: { type: Type.STRING },
                            dialogue: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSpeech = async (text: string, voiceName: string, emotion?: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text + (emotion ? ` (${emotion} tone)` : "") }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("TTS failed");
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const wavBlob = pcmToWav(new Uint8Array(byteNumbers), 24000);
        return URL.createObjectURL(wavBlob);
    });
};

export const generateScript = async (topic: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a short script about: ${topic}.`
        });
        return response.text || "";
    });
};

export const analyzeForexChart = async (base64Image: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Image } },
                    { text: "Analyze this forex chart." }
                ]
            }
        });
        return response.text || "";
    });
};

export const chatWithAstra = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
        });
        const response = await chat.sendMessage({ message: newMessage });
        return response.text || "";
    });
};

export const generateForexSignal = async (pair: string, timeframe: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate forex signal for ${pair}.`,
            config: { responseMimeType: 'application/json' }
        });
        return response.text || "{}";
    });
};

export const generateThumbnailDescription = async (category: string, headline: string, context: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Describe high-CTR thumbnail for "${headline}".`
        });
        return response.text || "";
    });
};

export const generateViralHeadline = async (category: string, topic: string): Promise<string> => {
    return await callWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Create viral headline for "${topic}".`
        });
        return response.text || "";
    });
};
