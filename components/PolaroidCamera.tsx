import React, { useState, useRef } from 'react';
import { generateImage } from '../services/geminiService';
import { APIKeys, PaperSheet, CameraType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { playSwitchSound, playShutterSound, playMotorSound } from '../services/soundService';

interface PolaroidCameraProps {
  apiKeys: APIKeys;
  onPhotoGenerated: (sheet: PaperSheet) => void;
  cameraType?: CameraType;
}

const PolaroidCamera: React.FC<PolaroidCameraProps> = ({ apiKeys, onPhotoGenerated, cameraType = 'i2' }) => {
  const { t } = useLanguage();
  const [isBusy, setIsBusy] = useState(false); 
  const [developingImage, setDevelopingImage] = useState<{data: string, caption: string} | null>(null);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [flashActive, setFlashActive] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false); 
  const [shutterAnim, setShutterAnim] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const triggerFlash = () => {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 150);
  };

  const triggerShutterAnimation = () => {
      playShutterSound();
      setShutterAnim(true);
      setTimeout(() => setShutterAnim(false), 300);
  };

  const startDeveloping = (imgData: string, caption: string) => {
      setDevelopingImage({ data: imgData, caption });
      playMotorSound(); 
      setTimeout(() => {
          const newSheet: PaperSheet = {
            id: generateId(),
            type: 'image',
            content: [imgData, caption],
            timestamp: Date.now()
          };
          onPhotoGenerated(newSheet);
          setDevelopingImage(null);
          setIsBusy(false);
      }, 3500);
  };

  const handleShutterClick = () => {
      if (isBusy) return;
      triggerShutterAnimation();
      if (isAIMode) {
          playSwitchSound();
          setShowPromptInput(true);
      } else {
          fileInputRef.current?.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBusy(true);
    triggerFlash();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTimeout(() => {
          const imgData = ev.target?.result as string;
          startDeveloping(imgData, 'Uploaded Photo');
      }, 1000); 
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setShowPromptInput(false);
    setIsBusy(true);
    playSwitchSound();
    triggerFlash();
    triggerShutterAnimation();
    try {
        const imgData = await generateImage(prompt, apiKeys);
        if (imgData) {
             startDeveloping(imgData, prompt);
        } else {
             alert("Failed to generate image. Check API Key.");
             setIsBusy(false);
        }
    } catch (err) {
        console.error(err);
        alert("Error generating image.");
        setIsBusy(false);
    } finally {
        setPrompt('');
    }
  };

  const filterStyle = "contrast(1.1) brightness(0.95) saturate(1.5) sepia(0.2) hue-rotate(-5deg) blur(0.5px)";
  const lightLeakOverlay = {
      background: 'linear-gradient(45deg, rgba(255,100,50,0.1) 0%, transparent 20%, transparent 80%, rgba(255,200,100,0.15) 100%)',
      mixBlendMode: 'screen' as const
  };

  // --- STYLE VARIANTS ---
  const getBodyStyle = () => {
      switch(cameraType) {
          case 'onestep': return 'bg-[#f0f0f0] border-b-8 border-gray-300 rounded-[20px]';
          case 'sx70': return 'bg-[#8d6e63] border-b-8 border-[#5d4037] rounded-[4px]'; // Leather look
          case 'coolcam': return 'bg-[#ec4899] border-b-8 border-[#be185d] rounded-[30px]'; // Pink
          case 'impulse': return 'bg-[#334155] border-b-8 border-[#1e293b] rounded-[10px]'; // Grey
          case 'i2': default: return 'bg-[#161616] border-b-8 border-[#0a0a0a] rounded-[36px]';
      }
  };

  const getRainbowStrip = () => {
      if (cameraType === 'onestep') {
          return <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-[#e92f2f] via-[#fecb2f] to-[#2d8ae6] opacity-90 z-10 clip-path-stripe"></div>
      }
      return null;
  };

  return (
    <div className="absolute right-[5%] top-[8%] z-30 flex flex-col items-center perspective-1000">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className={`fixed inset-0 bg-white z-[200] pointer-events-none transition-opacity duration-100 ${flashActive ? 'opacity-60' : 'opacity-0'}`}></div>

      {showPromptInput && (
         <div className="absolute -left-64 top-10 z-50 w-60 bg-[#111] p-4 rounded-xl border border-zinc-700 shadow-2xl animate-in fade-in slide-in-from-right-4">
             <div className="absolute -right-2 top-6 w-4 h-4 bg-[#111] rotate-45 border-r border-t border-zinc-700"></div>
             <form onSubmit={handleAIGenerate}>
                 <label className="block text-[10px] text-zinc-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="material-icons text-sm text-yellow-500">auto_awesome</span>
                    {t('enterPrompt')}
                 </label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-zinc-900 text-white text-xs p-3 rounded-lg border border-zinc-700 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 mb-3 h-20 resize-none font-sans"
                    autoFocus
                    placeholder="A retro robot..."
                 />
                 <div className="flex justify-end gap-3">
                     <button type="button" onClick={() => setShowPromptInput(false)} className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-bold">CANCEL</button>
                     <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] px-4 py-2 rounded-full font-bold tracking-wider shadow-lg hover:shadow-yellow-500/20 transition-all">CAPTURE</button>
                 </div>
             </form>
         </div>
      )}

      {/* CAMERA BODY */}
      <div className={`relative w-[320px] h-[300px] group select-none scale-90 xl:scale-100 transition-transform`}>
          <div className={`absolute inset-0 shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col ${getBodyStyle()}`}>
               {/* Model-specific Rainbow */}
               {cameraType === 'onestep' && (
                   <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-r from-[#FF0000] via-[#FFFF00] to-[#0000FF] opacity-90 z-10" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
               )}

               {/* Top Section */}
               <div className="h-[70px] w-full relative flex justify-center pt-6 z-20">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent rounded-t-[36px] pointer-events-none"></div>
                   <span className={`font-sans font-medium text-lg tracking-[0.05em] antialiased drop-shadow-md ${cameraType === 'onestep' ? 'text-black' : 'text-white'}`}>polaroid</span>
               </div>

               {/* Face Controls */}
               <div className="flex-1 relative">
                   {/* FLASH */}
                   <div className={`absolute left-11 top-2 w-16 h-9 rounded-lg border overflow-hidden transition-all duration-100 ${flashActive ? 'bg-white border-white shadow-[0_0_50px_#fff] z-50' : 'bg-zinc-300 border-zinc-400'}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent mix-blend-overlay"></div>
                   </div>

                   {/* SHUTTER */}
                   <button 
                        onClick={handleShutterClick}
                        disabled={isBusy}
                        className={`
                            absolute left-12 top-20 w-14 h-14 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.3),0_5px_10px_rgba(0,0,0,0.5)] border 
                            active:translate-y-[2px] active:shadow-none transition-all z-30 group/shutter flex items-center justify-center
                            ${isAIMode ? 'bg-yellow-600 border-yellow-700' : 'bg-[#d92525] border-[#b51f1f]'}
                        `}
                        title={isAIMode ? t('aiPrint') : t('shutter')}
                   >
                   </button>

                   {/* LENS */}
                   <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-[60%] w-32 h-32 z-20">
                       <div className="w-full h-full rounded-full bg-zinc-300 bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-300 shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center p-1">
                           <div className="w-full h-full rounded-full bg-black shadow-[inset_0_2px_5px_rgba(255,255,255,0.2)] flex items-center justify-center relative overflow-hidden border border-black">
                               <div className="w-24 h-24 rounded-full bg-[#050505] relative overflow-hidden shadow-[inset_0_0_20px_black] border border-zinc-800">
                                   <div 
                                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#1a1a1a] opacity-90 transition-all duration-100 ease-out`}
                                      style={{ 
                                          clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
                                          transform: shutterAnim ? 'translate(-50%, -50%) scale(0.2)' : 'translate(-50%, -50%) scale(1)'
                                      }}
                                   >
                                       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#000] rounded-full"></div>
                                   </div>
                                   <div className="absolute -top-6 -left-6 w-full h-full bg-purple-500/20 rounded-full blur-xl mix-blend-screen"></div>
                                   <div className="absolute top-5 right-5 w-3 h-2 bg-white/90 rounded-[50%] rotate-[-45deg] blur-[1px]"></div>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* SENSORS / MODE SWITCH */}
                   <div className="absolute right-6 top-3 flex flex-col items-center gap-1 w-[60px]">
                        {/* Status LEDs */}
                        <div className="w-12 h-6 bg-[#080808] rounded-full border border-zinc-800 shadow-inner flex justify-around items-center px-1">
                            <div className={`w-3 h-3 rounded-full border transition-all duration-300 ${isAIMode && isBusy ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-[#151515] opacity-40'}`}></div>
                            <div className={`w-3 h-3 rounded-full border transition-all duration-300 ${isAIMode && !isBusy ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-[#151515] opacity-40'}`}></div>
                        </div>
                        {/* Mode Button */}
                        <div className="relative">
                           <button
                               onClick={() => { playSwitchSound(); setIsAIMode(!isAIMode); }}
                               className={`w-12 h-12 rounded-[12px] border-[2px] shadow-inner flex items-center justify-center transition-all mt-2 cursor-pointer overflow-hidden relative ${isAIMode ? 'border-zinc-500' : 'bg-[#080808] border-zinc-800'}`}
                           >
                               {isAIMode && <div className="w-full h-full bg-gradient-to-b from-sky-300 to-sky-100 opacity-80"></div>}
                           </button>
                       </div>
                   </div>
               </div>

               {/* Film Slot */}
               <div className="h-[60px] w-full relative mt-auto flex flex-col items-center justify-end pb-5">
                   <div className="w-[240px] h-4 bg-[#050505] rounded-full border-b border-zinc-800 shadow-[inset_0_2px_5px_rgba(0,0,0,1)]"></div>
               </div>
          </div>
      </div>

      {/* DEVELOPING ANIMATION */}
      {developingImage && (
          <div 
            className="absolute top-[80%] left-1/2 -translate-x-1/2 w-44 bg-white shadow-2xl z-[-10] flex flex-col p-2 pb-8 transform-gpu origin-top"
            style={{ animation: 'eject-photo 3.5s cubic-bezier(0.25, 1, 0.5, 1) forwards', height: '220px' }}
          >
              <div className="w-full aspect-square bg-zinc-100 relative overflow-hidden shadow-inner border border-gray-200/50">
                   <img 
                        src={developingImage.data} 
                        className="w-full h-full object-cover"
                        style={{ animation: 'develop-image 3s ease-in-out forwards' }}
                   />
                   <div className="absolute inset-0 z-10 pointer-events-none" style={lightLeakOverlay}></div>
              </div>
              <div className="mt-2 flex flex-col items-center justify-center opacity-0 animate-[fade-in_1s_ease-out_2s_forwards]">
                   <div className="font-handwriting font-bold text-xl text-[#2a2a2a] opacity-85 -rotate-1" style={{ mixBlendMode: 'multiply' }}>{apiKeys.nickname || 'User'}</div>
              </div>
          </div>
      )}
      
      <style>{`
        @keyframes eject-photo {
            0% { transform: translate(-50%, -100%) scale(0.9); opacity: 0; }
            20% { transform: translate(-50%, 10%); opacity: 1; }
            100% { transform: translate(-50%, 20%); opacity: 1; } 
        }
        @keyframes develop-image {
            0% { filter: brightness(0.1) sepia(1) blur(2px); opacity: 0.5; }
            40% { filter: brightness(0.4) sepia(0.8) blur(1px); opacity: 0.8; }
            100% { filter: ${filterStyle}; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PolaroidCamera;