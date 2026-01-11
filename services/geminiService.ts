
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Fungsi helper untuk inisialisasi AI secara lokal
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    const pcmDataView = new Uint8Array(buffer, 44);
    pcmDataView.set(pcmData);
    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
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
  const ai = getAi();
  let model = 'gemini-2.5-flash-image';
  if (imageSize === '2K' || imageSize === '4K') {
      model = 'gemini-3-pro-image-preview';
  }

  const parts: any[] = [{ text: prompt }];

  if (baseImage) {
    const base64 = await fileToBase64(baseImage);
    parts.push({
      inlineData: {
        mimeType: baseImage.type,
        data: base64
      }
    });
  }

  if (refImage) {
    const base64 = await fileToBase64(refImage);
    parts.push({
        inlineData: {
            mimeType: refImage.type,
            data: base64
        }
    });
  }

  if (faceImage2) {
      if (Array.isArray(faceImage2)) {
          for (const f of faceImage2) {
              const base64 = await fileToBase64(f);
              parts.push({ inlineData: { mimeType: f.type, data: base64 } });
          }
      } else if (faceImage2 instanceof File) {
          const base64 = await fileToBase64(faceImage2);
          parts.push({ inlineData: { mimeType: faceImage2.type, data: base64 } });
      }
  }

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
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export const generateRenovationStory = async (
  object: string,
  condition: string,
  location: string,
  result: string,
  stepCount: number = 5
): Promise<{ firstFramePrompt: string; timelapseSteps: string[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Act as a World-Class Architectural Timelapse Director.
      INPUTS: Object: "${object}", Condition: "${condition}", Location: "${location}", Result: "${result}", Total Steps: ${stepCount}
      STRICT OUTPUT FORMAT (JSON):
      The 'timelapseSteps' MUST follow this EXACT structure: "Hyper timelapse video of [Action] [Object] in [Location], locked camera."
    `,
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
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { firstFramePrompt: "", timelapseSteps: [] };
  }
};

export const generateInfographicPrompt = async (topic: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a detailed prompt for an infographic about: ${topic}.`,
  });
  return response.text || "";
};

export const generateRandomPrompt = async (): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Generate a creative and detailed image generation prompt.",
  });
  return response.text || "";
};

export const refineUserPrompt = async (prompt: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine this prompt: "${prompt}"`,
  });
  return response.text || prompt;
};

export const analyzeImagePrompt = async (imageBase64: string): Promise<string> => {
  const ai = getAi();
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
};

export const generateSocialCaption = async (imageBase64: string, platform: string): Promise<string> => {
   const ai = getAi();
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
};

export const generateCharacterDescription = async (character: string, series: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Describe character ${character} from ${series}.`,
  });
  return response.text || "";
};

export const generateStoryFromImage = async (imageUrl: string, characterName: string): Promise<string> => {
    const ai = getAi();
    let base64 = "";
    if (imageUrl.startsWith('data:')) {
        base64 = imageUrl.split(',')[1];
    } else if (imageUrl.startsWith('http')) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        base64 = await fileToBase64(new File([blob], "image.png"));
    } else {
        base64 = imageUrl;
    }
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
};

export const generateVeoVideo = async (prompt: string, aspectRatio: string = '16:9', imageFile: File | null = null): Promise<string> => {
    const ai = getAi();
    let imageInput = undefined;
    if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        imageInput = {
            imageBytes: base64,
            mimeType: imageFile.type
        };
    }
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imageInput,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as any
        }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const generateStoryboardPlan = async (theme: string, count: number): Promise<StoryboardSceneData[]> => {
    const ai = getAi();
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
    try {
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
};

export const generateSpeech = async (text: string, voiceName: string, emotion?: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: text + (emotion ? ` (${emotion} tone)` : "") }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName }
                }
            }
        }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS failed");
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const wavBlob = pcmToWav(byteArray, 24000);
    return URL.createObjectURL(wavBlob);
};

export const generateScript = async (topic: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short script about: ${topic}.`
    });
    return response.text || "";
};

export const analyzeForexChart = async (base64Image: string): Promise<string> => {
    const ai = getAi();
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
};

export const chatWithAstra = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
    const ai = getAi();
    const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "";
};

export const generateForexSignal = async (pair: string, timeframe: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate forex signal for ${pair}.`,
        config: { responseMimeType: 'application/json' }
    });
    return response.text || "{}";
};

export const generateThumbnailDescription = async (category: string, headline: string, context: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Describe high-CTR thumbnail for "${headline}".`
    });
    return response.text || "";
};

export const generateViralHeadline = async (category: string, topic: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create viral headline for "${topic}".`
    });
    return response.text || "";
};
