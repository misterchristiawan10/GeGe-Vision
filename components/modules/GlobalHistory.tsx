import React, { useMemo, useState } from 'react';
import { ModuleId } from '../../types';
import { MODULES } from './Home';
import { History, Trash2, ZoomIn, ExternalLink, Image, Video, Music } from 'lucide-react';

interface GlobalHistoryProps {
  modulesState: { [key in ModuleId]?: any };
  onNavigate: (id: ModuleId) => void;
  onDelete: (moduleId: ModuleId, itemId: number | string) => void;
}

interface HistoryItem {
  id: number | string;
  type: 'image' | 'video' | 'audio';
  url: string;
  timestamp: number;
  moduleId: ModuleId;
  moduleTitle: string;
  moduleIcon: React.ElementType;
}

export const GlobalHistoryModule: React.FC<GlobalHistoryProps> = ({ modulesState, onNavigate, onDelete }) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video' | null>(null);

  const allHistoryItems = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [];

    for (const moduleId in modulesState) {
      const state = modulesState[moduleId as ModuleId];
      const moduleDef = MODULES.find(m => m.id === moduleId);

      if (!state || !moduleDef) continue;

      // GeneratorModule-based modules
      if (state.resultHistory && Array.isArray(state.resultHistory)) {
        state.resultHistory.forEach((item: any) => {
          if (item.generatedImage) {
            items.push({
              id: item.timestamp,
              type: 'image',
              url: item.generatedImage,
              timestamp: item.timestamp,
              moduleId: moduleId as ModuleId,
              moduleTitle: moduleDef.title,
              moduleIcon: moduleDef.icon,
            });
          }
        });
      }
      
      // NusantaraStudio
      if (state.generatedImages && Array.isArray(state.generatedImages) && state.generatedImages.every((i:any) => typeof i === 'object')) {
        state.generatedImages.forEach((item: { url: string; timestamp: number }) => {
          items.push({
            id: item.timestamp,
            type: 'image',
            url: item.url,
            timestamp: item.timestamp,
            moduleId: moduleId as ModuleId,
            moduleTitle: moduleDef.title,
            moduleIcon: moduleDef.icon,
          });
        });
      }

      // ContentCreator (FlatLay)
       if (state.flatLayHistory && Array.isArray(state.flatLayHistory)) {
        state.flatLayHistory.forEach((item: { id: number; image: string }) => {
          items.push({
            id: item.id,
            type: 'image',
            url: item.image,
            timestamp: item.id,
            moduleId: moduleId as ModuleId,
            moduleTitle: moduleDef.title,
            moduleIcon: moduleDef.icon,
          });
        });
      }

      // VidGen
      if (state.videoHistory && Array.isArray(state.videoHistory)) {
        state.videoHistory.forEach((item: { id: number; url: string }) => {
          items.push({
            id: item.id,
            type: 'video',
            url: item.url,
            timestamp: item.id,
            moduleId: moduleId as ModuleId,
            moduleTitle: moduleDef.title,
            moduleIcon: moduleDef.icon,
          });
        });
      }

      // VoiceOverStudio
      if (state.audioList && Array.isArray(state.audioList)) {
        state.audioList.forEach((item: { id: number; dataUrl: string }) => {
          items.push({
            id: item.id,
            type: 'audio',
            url: item.dataUrl,
            timestamp: item.id,
            moduleId: moduleId as ModuleId,
            moduleTitle: moduleDef.title,
            moduleIcon: moduleDef.icon,
          });
        });
      }
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [modulesState]);

  const openLightbox = (item: HistoryItem) => {
    if (item.type === 'image' || item.type === 'video') {
      setLightboxUrl(item.url);
      setLightboxType(item.type);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
        >
          {lightboxType === 'image' && <img src={lightboxUrl} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />}
          {lightboxType === 'video' && <video src={lightboxUrl} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <History className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Riwayat Global</h2>
          <p className="text-gray-500 dark:text-gray-400">Semua hasil generate dari semua modul dalam satu tempat.</p>
        </div>
      </div>

      {allHistoryItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700">
          <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="font-bold text-gray-700 dark:text-gray-300">Riwayat Kosong</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mulai berkreasi di modul lain untuk melihat hasilnya di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allHistoryItems.map(item => (
            <div key={item.id} className="group relative aspect-square bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {item.type === 'image' && <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
              {item.type === 'video' && <video src={item.url} className="w-full h-full object-cover" muted />}
              {item.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-2">
                  <Music size={24} className="text-gray-400 mb-2"/>
                  <audio controls src={item.url} className="w-full h-8" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold mb-2">
                  <item.moduleIcon size={12} />
                  <span>{item.moduleTitle}</span>
                </div>
                
                <div className="flex gap-1.5">
                  {(item.type === 'image' || item.type === 'video') && (
                    <button onClick={() => openLightbox(item)} className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40 backdrop-blur-sm"><ZoomIn size={12} /></button>
                  )}
                  <button onClick={() => onNavigate(item.moduleId)} className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40 backdrop-blur-sm"><ExternalLink size={12} /></button>
                  <button onClick={() => onDelete(item.moduleId, item.id)} className="p-1.5 bg-red-500/50 text-white rounded-md hover:bg-red-500 backdrop-blur-sm"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};