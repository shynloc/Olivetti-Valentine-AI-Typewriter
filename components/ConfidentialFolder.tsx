
import React, { useState, useEffect, useRef } from 'react';
import { APIKeys } from '../types';
import { playSwitchSound, playKeySound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfidentialFolderProps {
  apiKeys: APIKeys;
  onSave: (keys: APIKeys) => void;
}

const NewtonLogo = () => (
  <svg viewBox="0 0 100 40" className="w-20 h-8 opacity-80">
     <text x="50%" y="30" textAnchor="middle" fill="#888" fontFamily="serif" fontSize="24" fontWeight="bold" letterSpacing="1">Newton</text>
  </svg>
);

const AppleLogo = () => (
  <svg viewBox="0 0 24 30" className="w-4 h-5">
    <path d="M12.9,0.3c0.4,2.2-1.1,4.4-2.6,5.8c-1.6,1.4-3.8,2.1-5,1.7C4.6,3.4,6.6,0.9,12.9,0.3z" fill="#555"/>
    <path d="M12.6,7c-3.1,0-5.3,1.8-6.6,1.8c-1.3,0-3.3-1.7-5.4-1.7C-0.3,7.2-2.7,9.3-2.7,14c0,5.7,3.6,13.8,7,13.8 c1.3,0,1.9-0.9,3.5-0.9s2.1,0.9,3.5,0.9c3.3,0,5.9-6,7-8.3c-2.8-1.4-4.5-5-1.9-8.4C14.7,8.5,13.4,7,12.6,7z" fill="#555"/>
    {/* Rainbow Colors for Retro Look */}
    <g style={{mixBlendMode: 'overlay'}}>
       <rect y="7" width="24" height="4" fill="#60bb46"/>
       <rect y="11" width="24" height="4" fill="#fdb827"/>
       <rect y="15" width="24" height="4" fill="#f5821f"/>
       <rect y="19" width="24" height="4" fill="#e03a3e"/>
       <rect y="23" width="24" height="4" fill="#963d97"/>
       <rect y="27" width="24" height="4" fill="#009ddc"/>
    </g>
  </svg>
);

const IconBar = () => (
    <div className="w-full h-8 border-t-2 border-[#1a2b15]/30 mt-auto flex justify-around items-center px-1">
        {['Names', 'Dates', 'Extras', 'Undo', 'Find', 'Assist'].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-[1px] opacity-70 group cursor-pointer hover:opacity-100">
                <div className="w-4 h-4 border border-[#1a2b15] rounded-[2px] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#1a2b15]/20 rounded-full"></div>
                </div>
                <span className="text-[6px] font-sans font-bold uppercase tracking-tighter text-[#1a2b15]">{label}</span>
            </div>
        ))}
    </div>
);

const ConfidentialFolder: React.FC<ConfidentialFolderProps> = ({ apiKeys, onSave }) => {
  const { t } = useLanguage();
  const [isOn, setIsOn] = useState(false);
  const [localKeys, setLocalKeys] = useState<APIKeys>(apiKeys);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 550 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for logic
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const isDown = useRef(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handleTogglePower = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMoved.current) return; // Prevent toggle if dragged
    
    playSwitchSound();
    setIsOn(!isOn);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playKeySound();
    onSave(localKeys);
    setTimeout(() => {
        playSwitchSound();
        setIsOn(false);
    }, 300);
  };

  // --- Robust Dragging Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
      // Allow interacting with inputs without dragging the whole device
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('label')) {
          return;
      }

      if (e.button !== 0) return; // Left click only
      // e.preventDefault(); // allow focus

      isDown.current = true;
      hasMoved.current = false;
      
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
      startPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (!isDown.current || !componentRef.current) return;

          const dx = e.clientX - startPos.current.x;
          const dy = e.clientY - startPos.current.y;

          // Threshold for click vs drag
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
              hasMoved.current = true;
              if (!isDragging) setIsDragging(true);
          }

          if (hasMoved.current) {
              let newX = e.clientX - dragOffset.current.x;
              let newY = e.clientY - dragOffset.current.y;
              
              // Boundaries
              newX = Math.max(0, Math.min(newX, window.innerWidth - 340));
              newY = Math.max(0, Math.min(newY, window.innerHeight - 500));

              setPosition({ x: newX, y: newY });
          }
      };
      
      const handleGlobalUp = () => {
          isDown.current = false;
          if (isDragging) {
              setTimeout(() => setIsDragging(false), 50);
          }
      };

      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      
      return () => {
          window.removeEventListener('mousemove', handleGlobalMove);
          window.removeEventListener('mouseup', handleGlobalUp);
      };
  }, [isDragging]);

  const rubberTexture = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`
  };

  const lcdTexture = {
      backgroundColor: '#9ea78e',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 2px),
        repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.03) 2px)
      `
  };

  return (
    <div 
        ref={componentRef}
        className={`
            absolute z-[150] flex flex-col items-center perspective-1000
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            transition-transform duration-200 ease-out
        `}
        style={{ 
            left: position.x, 
            top: position.y,
            transform: isOn ? 'scale(1.05)' : 'scale(1.0)',
        }}
        onMouseDown={handleMouseDown}
    >
      {/* Device Shadow */}
      <div className="absolute top-4 left-4 w-full h-full bg-black/40 blur-xl rounded-[30px] pointer-events-none"></div>

      {/* Device Body (MessagePad Style) */}
      <div className="relative w-[320px] h-[480px] bg-[#2a2a2a] rounded-[24px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_0_0_1px_rgba(0,0,0,1)] flex flex-col items-center overflow-hidden border-b-4 border-black">
          
          {/* Matte Texture */}
          <div className="absolute inset-0 rounded-[24px] opacity-40 pointer-events-none" style={rubberTexture}></div>

          {/* Top Bezel Area */}
          <div className="w-full h-12 flex justify-between items-center px-6 relative z-10 bg-gradient-to-b from-[#333] to-[#2a2a2a]">
               <div className="text-[8px] font-sans font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                   <AppleLogo />
                   <span>MessagePad 120</span>
               </div>
               <NewtonLogo />
          </div>

          {/* Screen Housing */}
          <div className="w-[280px] h-[380px] bg-[#222] rounded-[4px] shadow-[inset_0_2px_10px_black] p-3 flex flex-col items-center justify-center relative">
               
               {/* THE LCD SCREEN */}
               <div className={`
                  relative w-full h-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)]
                  rounded-[2px] overflow-hidden border border-[#889078]
                  transition-all duration-500
                  ${isOn ? 'brightness-100' : 'brightness-[0.4] saturate-50'}
               `}
               style={lcdTexture}
               >
                   {/* Glare */}
                   <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-20"></div>

                   {/* Content Container */}
                   <div className="relative w-full h-full flex flex-col p-2 z-10">
                       
                       {/* Wake Screen Overlay */}
                       {!isOn && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={handleTogglePower}>
                               <div className="w-16 h-16 border-2 border-[#1a2b15]/20 rounded-full flex items-center justify-center mb-2">
                                    <span className="material-icons text-[#1a2b15]/40 text-4xl">touch_app</span>
                               </div>
                               <span className="font-serif font-bold text-[#1a2b15]/50 text-xs tracking-widest">TAP TO WAKE</span>
                           </div>
                       )}

                       {/* Active UI */}
                       {isOn && (
                           <div className="flex flex-col h-full animate-in fade-in duration-500">
                               {/* OS Header */}
                               <div className="flex justify-between items-end border-b-2 border-[#1a2b15] pb-1 mb-2 px-1">
                                   <span className="font-serif font-bold text-sm text-[#1a2b15]">Extras</span>
                                   <span className="font-sans text-[10px] text-[#1a2b15] font-bold">X</span>
                               </div>

                               {/* Settings Window */}
                               <div className="flex-1 border-2 border-[#1a2b15] bg-[#9ea78e] shadow-[4px_4px_0_rgba(0,0,0,0.1)] p-1 m-1 relative overflow-y-auto">
                                    {/* Window Title */}
                                    <div className="bg-[#1a2b15] text-[#9ea78e] text-xs font-bold px-2 py-0.5 mb-2 text-center uppercase tracking-wide">
                                        System Config
                                    </div>
                                    
                                    <form onSubmit={handleSave} className="flex flex-col gap-2 p-1">
                                        
                                        {/* Nickname */}
                                        <div className="group">
                                            <label className="text-[9px] font-bold text-[#1a2b15] uppercase block mb-0.5">User Name</label>
                                            <input 
                                                type="text" 
                                                value={localKeys.nickname}
                                                onChange={e => setLocalKeys({...localKeys, nickname: e.target.value})}
                                                className="w-full bg-transparent border-b border-dotted border-[#1a2b15] text-[#1a2b15] font-serif text-lg outline-none placeholder-[#1a2b15]/30 focus:bg-[#1a2b15]/5"
                                                placeholder="Guest"
                                                maxLength={12}
                                            />
                                        </div>

                                        {/* Gemini Key */}
                                        <div className="group mt-1">
                                            <label className="text-[9px] font-bold text-[#1a2b15] uppercase block mb-0.5">Gemini API Key</label>
                                            <input 
                                                type="password" 
                                                value={localKeys.gemini}
                                                onChange={e => setLocalKeys({...localKeys, gemini: e.target.value})}
                                                className="w-full bg-white/50 border border-[#1a2b15] text-[#1a2b15] text-[10px] p-1 outline-none shadow-inner"
                                            />
                                        </div>

                                        {/* Gemini Model Selection */}
                                        <div className="flex gap-2 mt-1 px-1 mb-2">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <div className={`w-3 h-3 border border-[#1a2b15] bg-white flex items-center justify-center`}>
                                                    {localKeys.geminiModel === 'gemini-2.5-flash' && <div className="w-2 h-2 bg-[#1a2b15]"></div>}
                                                </div>
                                                <span className="text-[9px] font-bold text-[#1a2b15]">2.5 Flash</span>
                                                <input type="radio" className="hidden" checked={localKeys.geminiModel === 'gemini-2.5-flash'} onChange={() => setLocalKeys({...localKeys, geminiModel: 'gemini-2.5-flash'})}/>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                 <div className={`w-3 h-3 border border-[#1a2b15] bg-white flex items-center justify-center`}>
                                                    {localKeys.geminiModel === 'gemini-3-pro-preview' && <div className="w-2 h-2 bg-[#1a2b15]"></div>}
                                                </div>
                                                <span className="text-[9px] font-bold text-[#1a2b15]">3.0 Pro</span>
                                                <input type="radio" className="hidden" checked={localKeys.geminiModel === 'gemini-3-pro-preview'} onChange={() => setLocalKeys({...localKeys, geminiModel: 'gemini-3-pro-preview'})}/>
                                            </label>
                                        </div>

                                        {/* DeepSeek Key */}
                                        <div className="group">
                                            <label className="text-[9px] font-bold text-[#1a2b15] uppercase block mb-0.5">DeepSeek API Key</label>
                                            <input 
                                                type="password" 
                                                value={localKeys.deepseek}
                                                onChange={e => setLocalKeys({...localKeys, deepseek: e.target.value})}
                                                className="w-full bg-white/50 border border-[#1a2b15] text-[#1a2b15] text-[10px] p-1 outline-none shadow-inner"
                                            />
                                        </div>

                                        {/* DeepSeek Model Selection */}
                                        <div className="flex gap-2 mt-1 px-1">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <div className={`w-3 h-3 border border-[#1a2b15] bg-white flex items-center justify-center`}>
                                                    {localKeys.deepSeekModel === 'deepseek-chat' && <div className="w-2 h-2 bg-[#1a2b15]"></div>}
                                                </div>
                                                <span className="text-[9px] font-bold text-[#1a2b15]">Chat</span>
                                                <input type="radio" className="hidden" checked={localKeys.deepSeekModel === 'deepseek-chat'} onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-chat'})}/>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                 <div className={`w-3 h-3 border border-[#1a2b15] bg-white flex items-center justify-center`}>
                                                    {localKeys.deepSeekModel === 'deepseek-reasoner' && <div className="w-2 h-2 bg-[#1a2b15]"></div>}
                                                </div>
                                                <span className="text-[9px] font-bold text-[#1a2b15]">Reason</span>
                                                <input type="radio" className="hidden" checked={localKeys.deepSeekModel === 'deepseek-reasoner'} onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-reasoner'})}/>
                                            </label>
                                        </div>

                                        {/* Buttons */}
                                        <div className="mt-4 flex justify-end gap-2 border-t border-dotted border-[#1a2b15] pt-2">
                                            <button 
                                                type="button" 
                                                onClick={handleTogglePower}
                                                className="px-3 py-1 border border-[#1a2b15] rounded shadow-[1px_1px_0_#1a2b15] text-[10px] font-bold uppercase active:translate-y-[1px] active:shadow-none hover:bg-white/20"
                                            >
                                                Sleep
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-3 py-1 bg-[#1a2b15] text-[#9ea78e] border border-[#1a2b15] rounded shadow-[1px_1px_0_rgba(0,0,0,0.5)] text-[10px] font-bold uppercase active:translate-y-[1px] active:shadow-none hover:opacity-90"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                               </div>

                               {/* Permanent Icon Strip */}
                               <IconBar />
                           </div>
                       )}
                   </div>
               </div>
          </div>
          
          {/* Bottom curve details */}
          <div className="w-full h-8 bg-[#252525] rounded-b-[24px] relative z-0 flex items-center justify-center border-t border-black/30">
               <div className="w-1/2 h-1 bg-black/20 rounded-full"></div>
          </div>

          {/* Stylus (Right Side) */}
          <div className="absolute -right-3 top-20 bottom-20 w-4 bg-[#1a1a1a] rounded-r-lg border-l border-black shadow-md flex flex-col items-center py-4">
              <div className="w-1 h-full bg-zinc-700/30 rounded-full"></div>
          </div>
      </div>
    </div>
  );
};

export default ConfidentialFolder;