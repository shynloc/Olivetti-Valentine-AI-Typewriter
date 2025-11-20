
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
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PaperSheet, APIKeys, AIModel } from './types';
import { playSwitchSound, playCrumpleSound, playPaperLoadSound, startAmbientSound, stopAmbientSound } from './services/soundService';

const generateId = () => Math.random().toString(36).substring(2, 15);

type ViewMode = 'desktop' | 'spread' | 'trash';

// Inner App contains the main logic that needs access to LanguageContext
const InnerApp: React.FC = () => {
  const { t } = useLanguage();
  const [isLightOn, setIsLightOn] = useState(true);
  const [completedSheets, setCompletedSheets] = useState<PaperSheet[]>([]);
  const [trashedSheets, setTrashedSheets] = useState<PaperSheet[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeys>({ 
      gemini: '', 
      deepseek: '', 
      deepSeekModel: 'deepseek-chat' 
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [aiTemperature, setAiTemperature] = useState<number>(0.7); // Default balanced

  // Handle Ambient Sound based on Lamp
  useEffect(() => {
    let started = false;
    const handleInteract = () => {
        if (!started && isLightOn) {
            startAmbientSound();
            started = true;
        }
    };
    
    // Web Audio needs interaction to start
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

  // Watch light for subsequent toggles
  useEffect(() => {
     if (isLightOn) {
         startAmbientSound();
     } else {
         stopAmbientSound();
     }
  }, [isLightOn]);


  // Handle Escape key to close views
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
      content: content
    };
    setCompletedSheets(prev => [...prev, newSheet]);
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

  return (
    <div className={`
      relative w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-1000
    `}>
      
      {/* WOOD DESK BACKGROUND */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isLightOn ? 'opacity-100' : 'opacity-20'}`}
           style={{
             backgroundColor: '#5c4033',
             backgroundImage: `
               repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 4px),
               url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E"),
               radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 60%)
             `,
             backgroundBlendMode: 'overlay, soft-light, normal'
           }}
      >
         {/* Wood Grain Lines (CSS Simulation) */}
         <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 53px, transparent 53px, transparent 63px, rgba(0,0,0,0.05) 63px, rgba(0,0,0,0.05) 66px)`
              }}
         ></div>
      </div>
      
      {/* Dark Mode Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 bg-black ${isLightOn ? 'opacity-0' : 'opacity-90'}`}></div>
      
      {/* Spotlight Effect for Dark Mode */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isLightOn ? 'opacity-0' : 'opacity-100'}`}
           style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,200,150,0.08) 0%, transparent 25%)' }}>
      </div>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* The Lamp */}
      <Lamp isOn={isLightOn} onToggle={() => setIsLightOn(!isLightOn)} />

      {/* The Settings Folder (Replaces Drawer) */}
      <ConfidentialFolder apiKeys={apiKeys} onSave={setApiKeys} />

      {/* Markdown Cheat Sheet (Under Typewriter) */}
      <MarkdownCheatSheet />
      
      {/* Thermometer (AI Temp Control) */}
      <Thermometer value={aiTemperature} onChange={setAiTemperature} />

      {/* The Finished Paper Basket (Right side) */}
      <PaperStack 
        sheets={completedSheets} 
        onOpenGrid={() => {
            playPaperLoadSound();
            setViewMode('spread');
        }}
        onDelete={(id) => handleMoveToTrash([id])}
      />

      {/* The Trash Bin (Bottom Right) */}
      <TrashBin 
        count={trashedSheets.length} 
        onClick={() => {
            playSwitchSound();
            setViewMode('trash');
        }}
      />

      {/* The Typewriter (Center) */}
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

      {/* OVERLAYS */}
      
      {/* Spread View (Active Sheets) */}
      {viewMode === 'spread' && (
          <PaperGrid 
             sheets={completedSheets}
             title="Output Tray"
             onClose={() => setViewMode('desktop')}
             onDelete={handleMoveToTrash}
          />
      )}

      {/* Trash View */}
      {viewMode === 'trash' && (
          <PaperGrid 
             sheets={trashedSheets}
             title="Trash Bin"
             isTrashMode={true}
             onClose={() => setViewMode('desktop')}
             onDelete={handlePermanentDelete}
             onRestore={handleRestoreFromTrash}
          />
      )}

      {/* Instructions */}
      <div className={`absolute bottom-4 left-4 font-typewriter text-xs transition-colors duration-500 select-none pointer-events-none ${isLightOn ? 'text-white/40 text-shadow-sm' : 'text-zinc-600'}`}>
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
