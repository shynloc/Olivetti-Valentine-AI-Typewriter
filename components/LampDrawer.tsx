import React, { useState } from 'react';
import { LampType, DesktopType, PadType, CameraType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { playSwitchSound, playPaperLoadSound } from '../services/soundService';

interface LampDrawerProps {
  selectedType: LampType;
  onSelect: (type: LampType) => void;
  selectedDesktop: DesktopType;
  onSelectDesktop: (type: DesktopType) => void;
  selectedPad: PadType;
  onSelectPad: (type: PadType) => void;
  selectedCamera: CameraType;
  onSelectCamera: (type: CameraType) => void;
}

const LampDrawer: React.FC<LampDrawerProps> = ({ 
    selectedType, onSelect, 
    selectedDesktop, onSelectDesktop,
    selectedPad, onSelectPad,
    selectedCamera, onSelectCamera
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Lamp Options
  const lampOptions: { type: LampType; labelKey: string; colorClass: string; ringClass: string }[] = [
    { type: 'industrial', labelKey: 'styleIndustrial', colorClass: 'bg-zinc-800', ringClass: 'border-zinc-600' },
    { type: 'banker', labelKey: 'styleBanker', colorClass: 'bg-emerald-800', ringClass: 'border-yellow-600' },
    { type: 'pixar', labelKey: 'stylePixar', colorClass: 'bg-slate-300', ringClass: 'border-slate-400' },
    { type: 'retro', labelKey: 'styleRetro', colorClass: 'bg-orange-600', ringClass: 'border-orange-800' },
    { type: 'modern', labelKey: 'styleModern', colorClass: 'bg-zinc-200', ringClass: 'border-zinc-300' },
  ];

  // Desktop Options
  const desktopOptions: { type: DesktopType; labelKey: string; bgStyle: React.CSSProperties }[] = [
      { type: 'wood', labelKey: 'deskWood', bgStyle: { backgroundColor: '#3E2723', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.002 0.04' numOctaves='3' result='n'/%3E%3CfeDiffuseLighting in='n' lighting-color='%236D4C41' surfaceScale='1.5'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%233E2723'/%3E%3Crect width='100%25' height='100%25' filter='url(%23w)' opacity='0.5'/%3E%3C/svg%3E")` } },
      { type: 'glass', labelKey: 'deskGlass', bgStyle: { backgroundColor: '#2c3e50', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")` } },
      { type: 'black', labelKey: 'deskBlack', bgStyle: { backgroundColor: '#111', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005 0.05' numOctaves='3' result='noise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.2'/%3E%3C/svg%3E")` } },
      { type: 'marble', labelKey: 'deskMarble', bgStyle: { backgroundColor: '#e5e7eb', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='marble'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='5' result='noise'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9' in='noise' result='coloredNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Crect width='100%25' height='100%25' filter='url(%23marble)' opacity='0.3'/%3E%3C/svg%3E")` } },
      { type: 'concrete', labelKey: 'deskConcrete', bgStyle: { backgroundColor: '#78716c', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%2378716c'/%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)' opacity='0.25'/%3E%3C/svg%3E")` } }
  ];

  // Pad Options
  const padOptions: { type: PadType; labelKey: string; previewClass: string; iconClass: string }[] = [
      { type: 'newton', labelKey: 'padNewton', previewClass: '', iconClass: 'w-8 h-10 bg-[#9ea78e] border-4 border-[#2a2a2a] flex items-center justify-center' },
      { type: 'p900', labelKey: 'padP900', previewClass: '', iconClass: 'w-6 h-8 bg-white border border-blue-200 flex flex-col items-center' },
      { type: 'blackberry', labelKey: 'padBlackberry', previewClass: '', iconClass: 'w-8 h-8 bg-black border border-zinc-800 flex flex-col items-center' },
      { type: 'vaio', labelKey: 'padVaio', previewClass: '', iconClass: 'w-8 h-5 bg-black border-x-4 border-zinc-300' },
      { type: 'treo', labelKey: 'padTreo', previewClass: '', iconClass: 'w-6 h-8 bg-zinc-100 border border-zinc-300 flex flex-col items-center' },
  ];

  // Camera Options
  const cameraOptions: { type: CameraType; labelKey: string; iconClass: string }[] = [
      { type: 'i2', labelKey: 'camI2', iconClass: 'bg-[#111] border-zinc-700' }, // Modern Black
      { type: 'onestep', labelKey: 'camOneStep', iconClass: 'bg-[#f0f0f0] border-zinc-300' }, // Classic White/Rainbow
      { type: 'sx70', labelKey: 'camSX70', iconClass: 'bg-[#8d6e63] border-[#5d4037]' }, // Leather/Chrome
      { type: 'coolcam', labelKey: 'camCool', iconClass: 'bg-pink-500 border-pink-700' }, // 90s Pink/Grey
      { type: 'impulse', labelKey: 'camImpulse', iconClass: 'bg-slate-700 border-slate-900' }, // Boxy Grey
  ];

  const toggleDrawer = () => {
      playPaperLoadSound();
      setIsOpen(!isOpen);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[160] flex justify-center pointer-events-none"
    >
      {/* Drawer Container */}
      <div 
        className={`
            relative bg-[#1a1a1a] border-t-4 border-zinc-800 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]
            transition-transform duration-500 ease-out flex flex-col items-center pointer-events-auto
            ${isOpen ? 'translate-y-0' : 'translate-y-[85%]'}
        `}
        style={{ width: '600px', height: '440px' }} // Increased height for 4 rows
      >
          {/* Handle Area (Visible when collapsed) - Click to Toggle */}
          <div 
            className="w-full h-8 flex justify-center items-center cursor-pointer group"
            onClick={toggleDrawer}
            title={isOpen ? "Click to Close" : "Click to Open"}
          >
              <div className="w-24 h-1.5 bg-zinc-700 rounded-full group-hover:bg-zinc-500 transition-colors shadow-inner"></div>
              <span className="absolute top-2 text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] group-hover:text-zinc-300">
                  {t('lampStyle')}
              </span>
              
              {/* Chevron Icon hint */}
              <div className={`absolute right-6 top-3 text-zinc-600 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <span className="material-icons text-sm">expand_less</span>
              </div>
          </div>

          <div className="flex-1 w-full flex flex-col px-8 pb-4 gap-4 overflow-y-auto">
              
              {/* Row 1: Lamps */}
              <div>
                  <h4 className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 text-center border-b border-zinc-800 pb-1">{t('lampStyle')}</h4>
                  <div className="flex justify-around items-center">
                    {lampOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => {
                                playSwitchSound();
                                onSelect(option.type);
                            }}
                            className={`
                                flex flex-col items-center gap-2 group transition-all duration-200
                                ${selectedType === option.type ? 'scale-110 -translate-y-1' : 'hover:scale-105 opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2
                                ${option.colorClass} ${option.ringClass}
                                ${selectedType === option.type ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
                            `}>
                                {selectedType === option.type && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                                )}
                            </div>
                            <span className={`text-[8px] font-sans uppercase font-bold tracking-wider ${selectedType === option.type ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>{t(option.labelKey as any)}</span>
                        </button>
                    ))}
                  </div>
              </div>

              {/* Row 2: Desktops */}
              <div>
                  <h4 className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 text-center border-b border-zinc-800 pb-1">{t('desktopStyle')}</h4>
                  <div className="flex justify-around items-center">
                    {desktopOptions.map((option) => (
                        <button
                            key={option.labelKey}
                            onClick={() => {
                                playSwitchSound();
                                onSelectDesktop(option.type);
                            }}
                            className={`
                                flex flex-col items-center gap-2 group transition-all duration-200
                                ${selectedDesktop === option.type ? 'scale-110 -translate-y-1' : 'hover:scale-105 opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-zinc-700 overflow-hidden relative
                                ${selectedDesktop === option.type ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
                            `}>
                                <div className="absolute inset-0" style={option.bgStyle}></div>
                                {selectedDesktop === option.type && (
                                    <div className="w-4 h-4 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center relative z-10">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                                    </div>
                                )}
                            </div>
                            <span className={`text-[8px] font-sans uppercase font-bold tracking-wider ${selectedDesktop === option.type ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>{t(option.labelKey as any)}</span>
                        </button>
                    ))}
                  </div>
              </div>

              {/* Row 3: Pad Styles */}
              <div>
                  <h4 className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 text-center border-b border-zinc-800 pb-1">{t('padStyle')}</h4>
                  <div className="flex justify-around items-center">
                    {padOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => {
                                playSwitchSound();
                                onSelectPad(option.type);
                            }}
                            className={`
                                flex flex-col items-center gap-2 group transition-all duration-200
                                ${selectedPad === option.type ? 'scale-110 -translate-y-1' : 'hover:scale-105 opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-zinc-700 overflow-hidden relative bg-zinc-800
                                ${selectedPad === option.type ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
                            `}>
                                <div className={`${option.iconClass} opacity-80`}>
                                    <div className={`w-[80%] h-[60%] rounded-[1px] mt-1 ${option.type === 'newton' ? 'bg-[#9ea78e]' : 'bg-blue-400/20'}`}></div>
                                </div>
                                {selectedPad === option.type && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                                )}
                            </div>
                            <span className={`text-[8px] font-sans uppercase font-bold tracking-wider ${selectedPad === option.type ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>{t(option.labelKey as any)}</span>
                        </button>
                    ))}
                  </div>
              </div>

              {/* Row 4: Camera Styles */}
              <div>
                  <h4 className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 text-center border-b border-zinc-800 pb-1">{t('cameraStyle')}</h4>
                  <div className="flex justify-around items-center">
                    {cameraOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => {
                                playSwitchSound();
                                onSelectCamera(option.type);
                            }}
                            className={`
                                flex flex-col items-center gap-2 group transition-all duration-200
                                ${selectedCamera === option.type ? 'scale-110 -translate-y-1' : 'hover:scale-105 opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 relative
                                ${option.iconClass}
                                ${selectedCamera === option.type ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
                            `}>
                                {/* Lens Hint */}
                                <div className="w-6 h-6 rounded-full bg-black border border-white/20 shadow-inner relative">
                                    <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-50"></div>
                                </div>
                                {selectedCamera === option.type && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                                )}
                            </div>
                            <span className={`text-[8px] font-sans uppercase font-bold tracking-wider ${selectedCamera === option.type ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>{t(option.labelKey as any)}</span>
                        </button>
                    ))}
                  </div>
              </div>

          </div>

          {/* Wood Texture Overlay for Drawer Body */}
          <div className="absolute inset-0 opacity-10 pointer-events-none rounded-t-[30px]" 
               style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")'}}>
          </div>
      </div>
    </div>
  );
};

export default LampDrawer;