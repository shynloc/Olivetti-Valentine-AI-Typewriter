import React, { useState, useEffect } from 'react';
import Lamp from './components/Lamp';
import Typewriter from './components/Typewriter';
import PaperStack from './components/PaperStack';
import ConfidentialFolder from './components/ConfidentialFolder';
import TrashBin from './components/TrashBin';
import PaperGrid from './components/PaperGrid';
import MarkdownCheatSheet from './components/MarkdownCheatSheet';
import LanguageSwitcher from './components/LanguageSwitcher';
import Thermometer from './components/Thermometer';
import PolaroidCamera from './components/PolaroidCamera';
import LampDrawer from './components/LampDrawer';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PaperSheet, APIKeys, AIModel, LampType, DesktopType, PadType, CameraType } from './types';
import { playSwitchSound, playCrumpleSound, playPaperLoadSound, startAmbientSound, stopAmbientSound } from './services/soundService';

const generateId = () => Math.random().toString(36).substring(2, 15);

type ViewMode = 'desktop' | 'spread' | 'trash';

const InnerApp: React.FC = () => {
  const { t } = useLanguage();
  const [isLightOn, setIsLightOn] = useState(true);
  const [lampType, setLampType] = useState<LampType>('industrial'); 
  const [desktopType, setDesktopType] = useState<DesktopType>('wood'); 
  const [padType, setPadType] = useState<PadType>('newton');
  const [cameraType, setCameraType] = useState<CameraType>('i2'); // Default Camera
  
  const [completedSheets, setCompletedSheets] = useState<PaperSheet[]>([]);
  const [trashedSheets, setTrashedSheets] = useState<PaperSheet[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeys>({ 
      gemini: '', 
      deepseek: '', 
      deepSeekModel: 'deepseek-chat',
      geminiModel: 'gemini-2.5-flash',
      nickname: ''
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [aiTemperature, setAiTemperature] = useState<number>(0.7);

  // ... (Existing Effects for Audio/Esc)
  // Handle Ambient Sound based on Lamp
  useEffect(() => {
    let started = false;
    const handleInteract = () => {
        if (!started && isLightOn) {
            startAmbientSound();
            started = true;
        }
    };
    
    window.addEventListener('click', handleInteract);
    window.addEventListener('keydown', handleInteract);

    if (isLightOn && started) {
        startAmbientSound();
    } else if (!isLightOn) {
        stopAmbientSound();
    }

    return () => {
        window.removeEventListener('click', handleInteract);
        window.removeEventListener('keydown', handleInteract);
        stopAmbientSound();
    }
  }, [isLightOn]);

  useEffect(() => {
     if (isLightOn) {
         startAmbientSound();
     } else {
         stopAmbientSound();
     }
  }, [isLightOn]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode !== 'desktop') {
        playSwitchSound();
        setViewMode('desktop');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [viewMode]);

  const handlePaperFull = (content: string[]) => {
    const newSheet: PaperSheet = {
      id: generateId(),
      type: 'text',
      content: content,
      timestamp: Date.now()
    };
    setCompletedSheets(prev => [...prev, newSheet]);
  };
  
  const handlePhotoGenerated = (sheet: PaperSheet) => {
      setCompletedSheets(prev => [...prev, sheet]);
  };

  const handleMoveToTrash = (ids: string[]) => {
    playCrumpleSound();
    const toTrash = completedSheets.filter(s => ids.includes(s.id));
    setCompletedSheets(prev => prev.filter(s => !ids.includes(s.id)));
    setTrashedSheets(prev => [...prev, ...toTrash]);
    if (completedSheets.length - ids.length === 0 && viewMode === 'spread') {
         setViewMode('desktop');
    }
  };

  const handleRestoreFromTrash = (ids: string[]) => {
    const toRestore = trashedSheets.filter(s => ids.includes(s.id));
    setTrashedSheets(prev => prev.filter(s => !ids.includes(s.id)));
    setCompletedSheets(prev => [...prev, ...toRestore]);
  };

  const handlePermanentDelete = (ids: string[]) => {
    setTrashedSheets(prev => prev.filter(s => !ids.includes(s.id)));
  };

  const getDesktopStyle = () => {
      switch (desktopType) {
          case 'glass':
              return {
                  backgroundColor: '#2c3e50',
                  backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 80%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`
              };
          case 'black':
              return {
                  backgroundColor: '#111',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005 0.05' numOctaves='3' result='noise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.15'/%3E%3C/svg%3E")`
              };
          case 'marble':
              return {
                  backgroundColor: '#e5e7eb',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='marble'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='5' result='noise'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9' in='noise' result='coloredNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Crect width='100%25' height='100%25' filter='url(%23marble)' opacity='0.3'/%3E%3C/svg%3E")`
              };
          case 'concrete':
              return {
                  backgroundColor: '#78716c',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%2378716c'/%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)' opacity='0.25'/%3E%3C/svg%3E")`
              };
          case 'wood':
          default:
              return {
                  backgroundColor: '#3E2723',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.002 0.04' numOctaves='3' result='n'/%3E%3CfeDiffuseLighting in='n' lighting-color='%236D4C41' surfaceScale='1.5'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%233E2723'/%3E%3Crect width='100%25' height='100%25' filter='url(%23w)' opacity='0.5'/%3E%3C/svg%3E"), radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 70%)`,
                  backgroundBlendMode: 'normal, normal'
              };
      }
  };

  return (
    <div className={`
      relative w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-1000
    `}>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isLightOn ? 'opacity-100' : 'opacity-20'}`}
           style={getDesktopStyle()}></div>
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 bg-black ${isLightOn ? 'opacity-0' : 'opacity-90'}`}></div>
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isLightOn ? 'opacity-0' : 'opacity-100'}`}
           style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,200,150,0.08) 0%, transparent 25%)' }}></div>

      <LanguageSwitcher />

      <Lamp isOn={isLightOn} onToggle={() => setIsLightOn(!isLightOn)} type={lampType} />

      <LampDrawer 
        selectedType={lampType} onSelect={setLampType} 
        selectedDesktop={desktopType} onSelectDesktop={setDesktopType}
        selectedPad={padType} onSelectPad={setPadType}
        selectedCamera={cameraType} onSelectCamera={setCameraType}
      />

      <ConfidentialFolder apiKeys={apiKeys} onSave={setApiKeys} padType={padType} />
      <MarkdownCheatSheet />
      <Thermometer value={aiTemperature} onChange={setAiTemperature} />
      <PolaroidCamera apiKeys={apiKeys} onPhotoGenerated={handlePhotoGenerated} cameraType={cameraType} />
      
      <PaperStack 
        sheets={completedSheets} 
        onOpenGrid={() => { playPaperLoadSound(); setViewMode('spread'); }}
        onDelete={(id) => handleMoveToTrash([id])}
        nickname={apiKeys.nickname}
      />

      <TrashBin count={trashedSheets.length} onClick={() => { playSwitchSound(); setViewMode('trash'); }} />

      <div className="relative z-10 scale-75 md:scale-90 lg:scale-100 transition-transform mt-10">
        <Typewriter 
          onPaperFull={handlePaperFull} 
          apiKeys={apiKeys}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          isLightOn={isLightOn}
          aiTemperature={aiTemperature}
        />
      </div>

      {viewMode === 'spread' && (
          <PaperGrid 
             sheets={completedSheets}
             title="Output Tray"
             onClose={() => setViewMode('desktop')}
             onDelete={handleMoveToTrash}
             nickname={apiKeys.nickname}
          />
      )}

      {viewMode === 'trash' && (
          <PaperGrid 
             sheets={trashedSheets}
             title="Trash Bin"
             isTrashMode={true}
             onClose={() => setViewMode('desktop')}
             onDelete={handlePermanentDelete}
             onRestore={handleRestoreFromTrash}
             nickname={apiKeys.nickname}
          />
      )}

      <div className={`absolute bottom-4 left-4 font-typewriter text-xs transition-colors duration-500 select-none pointer-events-none ${isLightOn && desktopType !== 'marble' ? 'text-white/40 text-shadow-sm' : 'text-zinc-600'}`}>
        <p>{t('instruction1')}</p>
        <p>{t('instruction2')}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <InnerApp />
    </LanguageProvider>
  );
};

export default App;