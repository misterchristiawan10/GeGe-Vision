
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, ModuleId } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { WelcomeMessage } from './components/WelcomeMessage';
import { CopyrightGuard } from './components/CopyrightGuard';
import { ComplianceGuard } from './components/ComplianceGuard';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { setGlobalApiKeys } from './services/geminiService';

// Import modules
import { HomeModule as Home } from './components/modules/Home';
import { VirtualPhotoshootModule } from './components/modules/VirtualPhotoshoot';
import { PrewedVirtualModule } from './components/modules/PrewedVirtual';
import { ContentCreatorModule } from './components/modules/ContentCreator';
import { CosplayFusionModule } from './components/modules/CosplayFusion';
import { BikiniPhotoshootModule } from './components/modules/BikiniPhotoshoot';
import { PinstaProductModule } from './components/modules/PinstaProduct';
import { KarikaturModule } from './components/modules/Karikatur';
import { InfografisModule } from './components/modules/Infografis';
import { SmartPandaStudioModule as NusantaraStudioModule } from './components/modules/NusantaraStudio';
import { VidGenModule } from './components/modules/VidGen';
import { StoryBoardModule } from './components/modules/StoryBoard';
import { VoiceOverStudioModule } from './components/modules/VoiceOverStudio';
import { RebelFXModule } from './components/modules/RebelFX';
import { GlobalHistoryModule } from './components/modules/GlobalHistory';
import { Mp4ToMp3Module } from './components/modules/Mp4ToMp3';
import { ThumbnailMakerModule } from './components/modules/ThumbnailMaker';
import { AsmrVisualMakerModule } from './components/modules/AsmrVisualMaker';
import { ImageResizerModule } from './components/modules/ImageResizer';
import { RenovationTimelapseModule } from './components/modules/RenovationTimelapse';
import { WorldTourModule } from './components/modules/WorldTour';
import { AdminPanelModule } from './components/modules/AdminPanel';

import { loadState, saveState } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('home');
  const [modulesState, setModulesState] = useState<{ [key in ModuleId]?: any }>({});
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const savedUser = await loadState('user');
      const savedState = await loadState('modulesState');
      const welcomeShown = await loadState('welcomeShown');
      const copyrightAccepted = await loadState('copyrightAccepted');
      const complianceAccepted = await loadState('complianceAccepted');
      const lastActiveId = await loadState('lastActiveModuleId');
      const savedKeys = await loadState('apiKeys');

      if (savedUser) setUser(savedUser);
      if (savedState) setModulesState(savedState);
      if (lastActiveId) setActiveModuleId(lastActiveId);
      if (savedKeys) {
          setApiKeys(savedKeys);
          setGlobalApiKeys(savedKeys);
      }
      
      if (!copyrightAccepted) {
        setIsCopyrightOpen(true);
      } else if (savedUser && !complianceAccepted) {
        setIsComplianceOpen(true);
      } else if (savedUser && !welcomeShown) {
        setIsWelcomeOpen(true);
      }
      
      setIsLoading(false);
    };
    initApp();
  }, []);

  const handleModuleStateChange = useCallback((id: ModuleId, state: any) => {
    setModulesState(prev => {
      const newState = { ...prev, [id]: state };
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        saveState('modulesState', newState).then(() => {
          setIsSaving(false);
        }).catch(err => {
          console.error("Auto-save failed", err);
          setIsSaving(false);
        });
      }, 800);
      return newState;
    });
  }, []);

  const handleSaveApiKeys = async (keys: string[]) => {
    setApiKeys(keys);
    setGlobalApiKeys(keys);
    await saveState('apiKeys', keys);
  };

  const handleLogin = async (profile: UserProfile) => {
    setUser(profile);
    await saveState('user', profile);
    const complianceAccepted = await loadState('complianceAccepted');
    if (!complianceAccepted) setIsComplianceOpen(true);
    else {
      const welcomeShown = await loadState('welcomeShown');
      if (!welcomeShown) setIsWelcomeOpen(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Kamu yakin mau logout?")) {
      setUser(null);
      saveState('user', null);
    }
  };

  const handleNavigate = (id: ModuleId) => {
    setActiveModuleId(id);
    saveState('lastActiveModuleId', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg"><div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (isCopyrightOpen) return <CopyrightGuard onComplete={() => { setIsCopyrightOpen(false); saveState('copyrightAccepted', true); }} />;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (isComplianceOpen) return <ComplianceGuard onAccept={() => { setIsComplianceOpen(false); saveState('complianceAccepted', true); }} />;

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeModuleId={activeModuleId} 
      onNavigate={handleNavigate} 
      isSaving={isSaving}
      onOpenApiSettings={() => setIsApiModalOpen(true)}
    >
      <WelcomeMessage isOpen={isWelcomeOpen} onClose={() => { setIsWelcomeOpen(false); saveState('welcomeShown', true); }} />
      
      <ApiSettingsModal 
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onLogout={handleLogout}
        onSave={handleSaveApiKeys}
        initialKeys={apiKeys}
      />

      <div style={{ display: activeModuleId === 'home' ? 'block' : 'none' }}>
        <Home onNavigate={handleNavigate} />
        {user.role === 'admin' && (
           <div className="mt-10 p-6 bg-violet-600 rounded-3xl text-white flex justify-between items-center animate-fade-in">
              <div>
                <h3 className="text-xl font-black">ADMIN MODE ACTIVE</h3>
                <p className="text-xs opacity-80">Anda memiliki akses ke manajemen pengguna.</p>
              </div>
              <button onClick={() => handleNavigate('admin-panel')} className="px-6 py-3 bg-white text-violet-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">Buka Admin Panel</button>
           </div>
        )}
      </div>

      <div style={{ display: activeModuleId === 'admin-panel' ? 'block' : 'none' }}>
        <AdminPanelModule />
      </div>

      <div style={{ display: activeModuleId === 'virtual-photoshoot' ? 'block' : 'none' }}><VirtualPhotoshootModule initialState={modulesState['virtual-photoshoot']} onStateChange={(s) => handleModuleStateChange('virtual-photoshoot', s)}/></div>
      <div style={{ display: activeModuleId === 'prewed-virtual' ? 'block' : 'none' }}><PrewedVirtualModule initialState={modulesState['prewed-virtual']} onStateChange={(s) => handleModuleStateChange('prewed-virtual', s)}/></div>
      <div style={{ display: activeModuleId === 'world-tour' ? 'block' : 'none' }}><WorldTourModule initialState={modulesState['world-tour']} onStateChange={(s) => handleModuleStateChange('world-tour', s)}/></div>
      <div style={{ display: activeModuleId === 'content-creator' ? 'block' : 'none' }}><ContentCreatorModule onNavigate={handleNavigate} onTransfer={(f) => handleModuleStateChange('virtual-photoshoot', { ...modulesState['virtual-photoshoot'], initialRefImage: f })} initialState={modulesState['content-creator']} onStateChange={(s) => handleModuleStateChange('content-creator', s)}/></div>
      <div style={{ display: activeModuleId === 'cosplay-fusion' ? 'block' : 'none' }}><CosplayFusionModule onNavigate={handleNavigate} onTransferToStoryBoard={(f) => handleModuleStateChange('story-board', { ...modulesState['story-board'], initialImage: f })} initialState={modulesState['cosplay-fusion']} onStateChange={(s) => handleModuleStateChange('cosplay-fusion', s)}/></div>
      <div style={{ display: activeModuleId === 'bikini-photoshoot' ? 'block' : 'none' }}><BikiniPhotoshootModule initialState={modulesState['bikini-photoshoot']} onStateChange={(s) => handleModuleStateChange('bikini-photoshoot', s)}/></div>
      <div style={{ display: activeModuleId === 'pinsta-product' ? 'block' : 'none' }}><PinstaProductModule initialState={modulesState['pinsta-product']} onStateChange={(s) => handleModuleStateChange('pinsta-product', s)}/></div>
      <div style={{ display: activeModuleId === 'karikatur' ? 'block' : 'none' }}><KarikaturModule initialState={modulesState['karikatur']} onStateChange={(s) => handleModuleStateChange('karikatur', s)}/></div>
      <div style={{ display: activeModuleId === 'infografis' ? 'block' : 'none' }}><InfografisModule initialState={modulesState['infografis']} onStateChange={(s) => handleModuleStateChange('infografis', s)}/></div>
      <div style={{ display: activeModuleId === 'smart-panda-studio' ? 'block' : 'none' }}><NusantaraStudioModule initialState={modulesState['smart-panda-studio']} onStateChange={(s) => handleModuleStateChange('smart-panda-studio', s)}/></div>
      <div style={{ display: activeModuleId === 'vidgen' ? 'block' : 'none' }}><VidGenModule initialState={modulesState['vidgen']} onStateChange={(s) => handleModuleStateChange('vidgen', s)}/></div>
      <div style={{ display: activeModuleId === 'story-board' ? 'block' : 'none' }}><StoryBoardModule initialImage={modulesState['story-board']?.initialImage} initialState={modulesState['story-board']} onStateChange={(s) => handleModuleStateChange('story-board', s)}/></div>
      <div style={{ display: activeModuleId === 'voice-over' ? 'block' : 'none' }}><VoiceOverStudioModule initialState={modulesState['voice-over']} onStateChange={(s) => handleModuleStateChange('voice-over', s)}/></div>
      <div style={{ display: activeModuleId === 'rebel-fx' ? 'block' : 'none' }}><RebelFXModule initialState={modulesState['rebel-fx']} onStateChange={(s) => handleModuleStateChange('rebel-fx', s)}/></div>
      <div style={{ display: activeModuleId === 'mp4-to-mp3' ? 'block' : 'none' }}><Mp4ToMp3Module initialState={modulesState['mp4-to-mp3']} onStateChange={(s) => handleModuleStateChange('mp4-to-mp3', s)}/></div>
      <div style={{ display: activeModuleId === 'thumbnail-maker' ? 'block' : 'none' }}><ThumbnailMakerModule initialState={modulesState['thumbnail-maker']} onStateChange={(s) => handleModuleStateChange('thumbnail-maker', s)}/></div>
      <div style={{ display: activeModuleId === 'asmr-visual' ? 'block' : 'none' }}><AsmrVisualMakerModule initialState={modulesState['asmr-visual']} onStateChange={(s) => handleModuleStateChange('asmr-visual', s)}/></div>
      <div style={{ display: activeModuleId === 'image-resizer' ? 'block' : 'none' }}><ImageResizerModule initialState={modulesState['image-resizer']} onStateChange={(s) => handleModuleStateChange('image-resizer', s)}/></div>
      <div style={{ display: activeModuleId === 'renovation-timelapse' ? 'block' : 'none' }}><RenovationTimelapseModule initialState={modulesState['renovation-timelapse']} onStateChange={(s) => handleModuleStateChange('renovation-timelapse', s)}/></div>
      <div style={{ display: activeModuleId === 'global-history' ? 'block' : 'none' }}><GlobalHistoryModule modulesState={modulesState} onNavigate={handleNavigate} onDelete={(m, i) => { }}/></div>
    </Layout>
  );
};

export default App;
