
import React, { useState, useRef, useEffect } from 'react';
import { FileAudio, Upload, Download, Loader2, Music, Trash2, Play, Pause, AlertCircle, Sparkles } from 'lucide-react';

interface ExtractedAudio {
  id: string;
  name: string;
  url: string;
  size: string;
  duration: string;
  timestamp: number;
}

interface Mp4ToMp3Props {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

export const Mp4ToMp3Module: React.FC<Mp4ToMp3Props> = ({ initialState, onStateChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioHistory, setAudioHistory] = useState<ExtractedAudio[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialState && initialState.audioHistory) {
      setAudioHistory(initialState.audioHistory);
    }
  }, [initialState]);

  useEffect(() => {
    onStateChange?.({ audioHistory });
  }, [audioHistory]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extractAudio = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError("File yang diunggah bukan video.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      
      setProgress(30);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      setProgress(60);
      // Create a WAV file from the AudioBuffer
      const wavBlob = bufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setProgress(90);
      const newAudio: ExtractedAudio = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, "") + ".wav",
        url: url,
        size: formatSize(wavBlob.size),
        duration: formatDuration(audioBuffer.duration),
        timestamp: Date.now()
      };

      setAudioHistory(prev => [newAudio, ...prev]);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError("Gagal mengekstrak audio. Format video mungkin tidak didukung.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Helper to convert AudioBuffer to WAV blob
  const bufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i, sample, offset = 0, pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF); // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++;                                     // next source sample
    }

    return new Blob([bufferArr], {type: "audio/wav"});

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const handleTogglePlay = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      extractAudio(e.target.files[0]);
    }
  };

  const removeAudio = (id: string) => {
    if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
    }
    setAudioHistory(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
            <FileAudio className="text-white" size={28} />
          </div>
          Smart Audio Extractor
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Ekstrak audio dari file video MP4 Anda dalam sekejap. Tanpa upload ke server, proses 100% aman di browser Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Upload Zone */}
        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>
          
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isProcessing ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {isProcessing ? (
                <Loader2 className="text-orange-500 animate-spin" size={40} />
              ) : (
                <Upload className="text-gray-400 group-hover:text-orange-500 transition-colors" size={40} />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isProcessing ? 'Sedang Mengekstrak...' : 'Klik atau Taruh Video Di Sini'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Format yang didukung: MP4, MOV, WEBM</p>
            </div>

            <div className="w-full max-w-md relative">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <button className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all ${isProcessing ? 'bg-gray-300 dark:bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-orange-500/20 active:scale-[0.98]'}`}>
                Pilih File Video
              </button>
            </div>

            {isProcessing && (
              <div className="w-full max-w-md space-y-2">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">{progress}% Selesai</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl animate-fade-in">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Music size={18} className="text-orange-500" /> Hasil Ekstraksi
            </h3>
            {audioHistory.length > 0 && (
                <button onClick={() => setAudioHistory([])} className="text-xs text-red-500 hover:underline">Hapus Semua</button>
            )}
          </div>

          {audioHistory.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 dark:bg-dark-card/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
               <Music size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3 opacity-20" />
               <p className="text-gray-400 text-sm italic">Belum ada audio yang diekstrak.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
               {audioHistory.map((audio) => (
                 <div key={audio.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all group">
                    <button 
                      onClick={() => handleTogglePlay(audio.id, audio.url)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${playingId === audio.id ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100'}`}
                    >
                      {playingId === audio.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={audio.name}>{audio.name}</h4>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{audio.size}</span>
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">{audio.duration}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <a 
                         href={audio.url} 
                         download={audio.name}
                         className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                         title="Unduh Audio"
                       >
                          <Download size={20} />
                       </a>
                       <button 
                         onClick={() => removeAudio(audio.id)}
                         className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                         title="Hapus"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Tips */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 flex gap-4">
         <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 text-emerald-500">
            <Sparkles size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Pro Tip</h4>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70 leading-relaxed">
               Gunakan audio hasil ekstraksi ini sebagai input di modul <b>Smart Storyboard</b> atau <b>Smart VidGen</b> untuk menciptakan konten baru yang lebih kreatif!
            </p>
         </div>
      </div>
    </div>
  );
};
