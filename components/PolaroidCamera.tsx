
import React, { useState, useRef } from 'react';
import { generateImage } from '../services/geminiService';
import { APIKeys, PaperSheet } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { playSwitchSound, playShutterSound, playMotorSound } from '../services/soundService';

interface PolaroidCameraProps {
  apiKeys: APIKeys;
  onPhotoGenerated: (sheet: PaperSheet) => void;
}

const PolaroidCamera: React.FC<PolaroidCameraProps> = ({ apiKeys, onPhotoGenerated }) => {
  const { t } = useLanguage();
  const [isBusy, setIsBusy] = useState(false); // API or Processing
  const [developingImage, setDevelopingImage] = useState<{data: string, caption: string} | null>(null);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [flashActive, setFlashActive] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false); // New state for AI Mode
  const [shutterAnim, setShutterAnim] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const textureStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
  };

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
      playMotorSound(); // New synthesized motor sound
      
      // Animation duration: 3.5s total
      // 0-0.5s: Eject
      // 0.5s-3.0s: Develop
      // 3.5s: Move to stack
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

  // Handle Shutter Click
  const handleShutterClick = () => {
      if (isBusy) return;
      triggerShutterAnimation();

      if (isAIMode) {
          // AI Mode: Open Prompt Input
          playSwitchSound();
          setShowPromptInput(true);
      } else {
          // Classic Mode: Upload File
          fileInputRef.current?.click();
      }
  };

  // Handle File Upload
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
      }, 1000); // Wait a bit before ejecting
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle AI Generation
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setShowPromptInput(false);
    setIsBusy(true);
    playSwitchSound();
    
    // Trigger flash and shutter again
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

  // High Saturation Vintage Filter
  const filterStyle = "contrast(1.1) brightness(0.95) saturate(1.5) sepia(0.2) hue-rotate(-5deg) blur(0.5px)";

  const lightLeakOverlay = {
      background: 'linear-gradient(45deg, rgba(255,100,50,0.1) 0%, transparent 20%, transparent 80%, rgba(255,200,100,0.15) 100%)',
      mixBlendMode: 'screen' as const
  };

  return (
    <div className="absolute right-[5%] top-[8%] z-30 flex flex-col items-center perspective-1000">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Flash Overlay Effect (Screen) */}
      <div className={`fixed inset-0 bg-white z-[200] pointer-events-none transition-opacity duration-100 ${flashActive ? 'opacity-60' : 'opacity-0'}`}></div>

      {/* Prompt Input Modal */}
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
                     <button 
                        type="button" 
                        onClick={() => setShowPromptInput(false)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-bold"
                     >
                        CANCEL
                     </button>
                     <button 
                        type="submit" 
                        className="bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] px-4 py-2 rounded-full font-bold tracking-wider shadow-lg hover:shadow-yellow-500/20 transition-all"
                     >
                        CAPTURE
                     </button>
                 </div>
             </form>
         </div>
      )}

      {/* Camera Body - Replicating Polaroid I-2 */}
      <div className="relative w-[320px] h-[300px] group select-none scale-90 xl:scale-100 transition-transform">
          
          {/* Main Shell */}
          <div className="absolute inset-0 bg-[#161616] rounded-[36px] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col border-b-8 border-[#0a0a0a]">
               
               {/* Texture Overlay */}
               <div className="absolute inset-0 opacity-20 rounded-[36px] pointer-events-none" style={textureStyle}></div>

               {/* Top Section (Branding & Hump) */}
               <div className="h-[70px] w-full relative flex justify-center pt-6 z-20">
                   {/* Shoulders shadow (fake 3D) */}
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent rounded-t-[36px] pointer-events-none"></div>
                   <span className="font-sans text-white font-medium text-lg tracking-[0.05em] antialiased drop-shadow-md">polaroid</span>
               </div>

               {/* Face Controls Section */}
               <div className="flex-1 relative">
                   
                   {/* FLASH (Left - Above Shutter) */}
                   <div className={`
                       absolute left-11 top-2 w-16 h-9 rounded-lg border overflow-hidden transition-all duration-100
                       ${flashActive ? 'bg-white border-white shadow-[0_0_50px_#fff] z-50' : 'bg-zinc-300 border-zinc-400 shadow-[inset_0_0_5px_rgba(0,0,0,0.2)]'}
                   `}>
                        {/* Flash Fresnel Lens Texture */}
                        <div className={`w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,rgba(0,0,0,0.1)_1px,rgba(0,0,0,0.1)_2px)] ${flashActive ? 'opacity-20' : 'opacity-100'}`}></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent mix-blend-overlay"></div>
                        {/* Xenon Tube hint */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 rounded-full blur-[1px] ${flashActive ? 'bg-white' : 'bg-white/60'}`}></div>
                   </div>

                   {/* SHUTTER BUTTON (Mid Left) */}
                   <button 
                        onClick={handleShutterClick}
                        disabled={isBusy}
                        className={`
                            absolute left-12 top-20 w-14 h-14 rounded-full shadow-[0_4px_0_#8a1818,0_5px_10px_rgba(0,0,0,0.5)] border 
                            active:translate-y-[2px] active:shadow-none transition-all z-30 group/shutter flex items-center justify-center
                            ${isAIMode ? 'bg-yellow-600 border-yellow-700 shadow-[0_4px_0_#92400e]' : 'bg-[#d92525] border-[#b51f1f] shadow-[0_4px_0_#8a1818]'}
                        `}
                        title={isAIMode ? t('aiPrint') : t('shutter')}
                   >
                        {/* Concave reflection */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-transparent to-black/10"></div>
                   </button>

                   {/* MAIN LENS (Center) - ENHANCED */}
                   <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-[60%] w-32 h-32 z-20">
                       {/* Outer Silver Ring */}
                       <div className="w-full h-full rounded-full bg-zinc-300 bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-300 shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center p-1">
                           {/* Inner Black Housing */}
                           <div className="w-full h-full rounded-full bg-black shadow-[inset_0_2px_5px_rgba(255,255,255,0.2)] flex items-center justify-center relative overflow-hidden border border-black">
                               
                               {/* Enhanced Glass Lens */}
                               <div className="w-24 h-24 rounded-full bg-[#050505] relative overflow-hidden shadow-[inset_0_0_20px_black] border border-zinc-800">
                                   
                                   {/* Aperture Blades (Hexagon Shape) */}
                                   <div 
                                      className={`
                                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#1a1a1a] opacity-90
                                        transition-all duration-100 ease-out
                                      `}
                                      style={{ 
                                          clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
                                          transform: shutterAnim ? 'translate(-50%, -50%) scale(0.2)' : 'translate(-50%, -50%) scale(1)'
                                      }}
                                   >
                                       {/* Inner hole of aperture */}
                                       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#000] rounded-full"></div>
                                   </div>

                                   {/* Coatings / Reflections / Glass Texture */}
                                   {/* Purple Coating */}
                                   <div className="absolute -top-6 -left-6 w-full h-full bg-purple-500/20 rounded-full blur-xl mix-blend-screen"></div>
                                   {/* Blue Coating */}
                                   <div className="absolute bottom-0 right-0 w-full h-full bg-blue-500/20 rounded-full blur-xl mix-blend-screen"></div>
                                   
                                   {/* Specular Highlights (Sharp Glints) */}
                                   <div className="absolute top-5 right-5 w-3 h-2 bg-white/90 rounded-[50%] rotate-[-45deg] blur-[1px]"></div>
                                   <div className="absolute top-6 right-4 w-1 h-1 bg-white rounded-full blur-[0.5px]"></div>
                                   
                                   {/* Subtle Surface Reflection */}
                                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none"></div>
                               </div>
                           </div>
                       </div>
                       
                       {/* Powered by Gemini Label - Moved Down */}
                       <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span 
                                className="font-sans text-[9px] font-bold tracking-[0.15em] uppercase"
                                style={{ 
                                    background: 'linear-gradient(to bottom, #d4d4d8, #52525b)', 
                                    WebkitBackgroundClip: 'text', 
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0px 1px 0px rgba(0,0,0,0.8))'
                                }}
                            >
                                Powered by Gemini
                            </span>
                       </div>
                   </div>

                   {/* SENSORS & STATUS LEDS (Top Right) */}
                   <div className="absolute right-6 top-3 flex flex-col items-center gap-1 w-[60px]">
                       {/* LiDAR/AF Pill -> Re-purposed as Status Indicators */}
                       <div className="relative">
                            <div className="w-12 h-6 bg-[#080808] rounded-full border border-zinc-800 shadow-inner flex justify-around items-center px-1">
                                {/* LEFT LED (RED) - Indicates BUSY */}
                                <div className={`
                                    w-3 h-3 rounded-full border relative overflow-hidden transition-all duration-300
                                    ${isAIMode 
                                        ? (isBusy ? 'bg-red-500 border-red-400 shadow-[0_0_8px_#ef4444]' : 'bg-[#151515] border-zinc-800 opacity-40')
                                        : 'bg-[#121212] border-zinc-700 opacity-80' // Off state look
                                    }
                                `}>
                                    {/* Lens Reflection when OFF */}
                                    {(!isAIMode || !isBusy) && <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/10 rounded-full"></div>}
                                </div>
                                
                                {/* RIGHT LED (GREEN) - Indicates READY (AI Mode ON & Idle) */}
                                <div className={`
                                    w-3 h-3 rounded-full border relative overflow-hidden transition-all duration-300
                                    ${isAIMode 
                                        ? (!isBusy ? 'bg-green-500 border-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-[#151515] border-zinc-800 opacity-40')
                                        : 'bg-[#121212] border-zinc-700 opacity-80' // Off state look
                                    }
                                `}>
                                    {/* Lens Reflection when OFF */}
                                    {(!isAIMode || isBusy) && <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/10 rounded-full"></div>}
                                </div>
                            </div>
                       </div>

                       {/* Viewfinder (Mode Switch) */}
                       <div className="relative">
                           <button
                               onClick={() => {
                                   playSwitchSound();
                                   setIsAIMode(!isAIMode);
                               }}
                               className={`
                                    w-12 h-12 rounded-[12px] border-[2px] shadow-inner flex items-center justify-center transition-all mt-2 cursor-pointer overflow-hidden relative
                                    ${isAIMode ? 'border-zinc-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'bg-[#080808] border-zinc-800 hover:border-zinc-600'}
                               `}
                               title={isAIMode ? "AI Mode ON" : "Click to enable AI Mode"}
                           >
                               {isAIMode ? (
                                   // Active Viewfinder (Scene)
                                   <div className="w-full h-full relative bg-gradient-to-b from-sky-300 to-sky-100">
                                       <div className="absolute bottom-0 w-full h-1/3 bg-green-600/80 rounded-t-[40%] blur-[1px]"></div>
                                       <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full blur-[2px]"></div>
                                       
                                       {/* HUD Overlay */}
                                       <div className="absolute inset-0 border-2 border-white/30 rounded-[10px] opacity-50 flex items-center justify-center">
                                           <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                                       </div>
                                   </div>
                               ) : (
                                   // Inactive Viewfinder (Dark Glass)
                                   <div className="w-8 h-8 bg-black rounded-[8px] relative overflow-hidden group-hover:scale-105 transition-transform">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-white/20 rounded-full blur-[1px]"></div>
                                   </div>
                               )}
                           </button>
                       </div>

                       {/* MOVED DECORATIONS (Rainbow & Specs) */}
                       <div className="mt-2 flex flex-col items-center">
                           {/* Rainbow Strip */}
                           <div className="w-12 h-[3px] bg-gradient-to-r from-[#e92f2f] via-[#fecb2f] to-[#2d8ae6] opacity-90 rounded-full mb-1"></div>
                           {/* Specs Text */}
                           <div className="text-[4px] text-zinc-500 font-sans font-medium tracking-widest opacity-80 whitespace-nowrap scale-75">
                               98mm f/8.0 AF 0.49
                           </div>
                       </div>
                   </div>

               </div>

               {/* Bottom Chin (Film Slot) */}
               <div className="h-[60px] w-full relative mt-auto flex flex-col items-center justify-end pb-5">
                   {/* Slot styling */}
                   <div className="w-[240px] h-4 bg-[#050505] rounded-full border-b border-zinc-800 shadow-[inset_0_2px_5px_rgba(0,0,0,1)]"></div>
               </div>

          </div>

          {/* Side Depth (Fake 3D) */}
          <div className="absolute top-8 -right-3 w-6 h-[240px] bg-[#080808] rounded-r-[20px] transform skew-y-[-12deg] z-[-1] shadow-2xl border-r border-black"></div>

      </div>

      {/* PHOTO EJECT & DEVELOPING ANIMATION */}
      {developingImage && (
          <div 
            className="absolute top-[80%] left-1/2 -translate-x-1/2 w-44 bg-white shadow-2xl z-[-10] flex flex-col p-2 pb-8 transform-gpu origin-top"
            style={{
                animation: 'eject-photo 3.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                height: '220px' // Aspect ratio similar to real polaroid
            }}
          >
              {/* The Photo Area */}
              <div className="w-full aspect-square bg-zinc-100 relative overflow-hidden shadow-inner border border-gray-200/50">
                   <img 
                        src={developingImage.data} 
                        alt="Developing" 
                        className="w-full h-full object-cover"
                        style={{
                            animation: 'develop-image 3s ease-in-out forwards'
                        }}
                   />
                   
                   {/* Light Leak Overlay (Development) */}
                   <div className="absolute inset-0 z-10 pointer-events-none" style={lightLeakOverlay}></div>

                   {/* Glossy coating */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 pointer-events-none z-20"></div>
                   
                   {/* Noise texture overlay during development */}
                   <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-30" style={{ backgroundImage: textureStyle.backgroundImage }}></div>
              </div>
              
              {/* Caption Area */}
              <div className="mt-2 flex flex-col items-center justify-center opacity-0 animate-[fade-in_1s_ease-out_2s_forwards]">
                   <div className="font-handwriting font-bold text-xl text-[#2a2a2a] opacity-85 -rotate-1" style={{ mixBlendMode: 'multiply', textShadow: '0 0 1px rgba(0,0,0,0.1)' }}>
                       {apiKeys.nickname || 'User'}
                   </div>
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
