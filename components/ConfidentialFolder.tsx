import React, { useState, useEffect, useRef } from 'react';
import { APIKeys, PadType } from '../types';
import { playSwitchSound, playKeySound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfidentialFolderProps {
  apiKeys: APIKeys;
  onSave: (keys: APIKeys) => void;
  padType?: PadType;
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

// Helper Components for Device Styling
const SettingsForm = ({ apiKeys, localKeys, setLocalKeys, onSave, onSleep, styleType }: any) => {
    // Styles for inputs based on OS type
    const getInputClass = () => {
        switch(styleType) {
            case 'newton': return "w-full bg-transparent border-b border-dotted border-[#1a2b15] text-[#1a2b15] font-serif outline-none placeholder-[#1a2b15]/30 focus:bg-[#1a2b15]/5";
            case 'p900': return "w-full bg-white border-b-2 border-blue-300 text-[#003366] text-xs font-sans p-1 outline-none rounded-none";
            case 'blackberry': return "w-full bg-white/10 border-b border-zinc-500 text-white text-xs font-sans p-2 outline-none focus:border-blue-500";
            case 'vaio': return "w-full bg-white border border-[#2b5c92] text-black text-xs font-sans p-1 shadow-sm outline-none";
            case 'treo': return "w-full bg-white border border-zinc-400 rounded-sm text-black text-xs font-mono p-1 shadow-inner outline-none";
            default: return "";
        }
    };

    const getLabelClass = () => {
        switch(styleType) {
            case 'newton': return "text-[9px] font-bold text-[#1a2b15] uppercase block mb-0.5";
            case 'p900': return "text-[10px] font-bold text-[#003366] uppercase mb-0.5 block";
            case 'blackberry': return "text-[10px] font-medium text-zinc-400 uppercase mb-1 block";
            case 'vaio': return "text-[10px] text-[#2b5c92] mb-0.5 block font-sans";
            case 'treo': return "text-[10px] font-bold text-zinc-700 uppercase mb-0.5 block";
            default: return "";
        }
    };

    const getButtonClass = (type: 'save' | 'sleep') => {
        const base = "px-4 py-2 text-[10px] font-bold uppercase transition-all active:scale-95 ";
        if (type === 'save') {
            switch(styleType) {
                case 'newton': return "px-3 py-1 bg-[#1a2b15] text-[#9ea78e] border border-[#1a2b15] rounded shadow-[1px_1px_0_rgba(0,0,0,0.5)] text-[10px] font-bold uppercase active:translate-y-[1px] active:shadow-none hover:opacity-90";
                case 'p900': return base + "bg-gradient-to-b from-[#f0f0f0] to-[#d0d0d0] text-black border border-gray-400 rounded-sm shadow-sm";
                case 'blackberry': return base + "bg-[#0070f3] text-white w-full rounded-none border-t border-white/20";
                case 'vaio': return base + "bg-gradient-to-b from-[#f3f8fc] to-[#c7d5ed] border border-[#7c9bc3] rounded-[2px] text-black hover:bg-[#ffe48d]";
                case 'treo': return base + "bg-zinc-800 text-white rounded-full border border-black shadow";
            }
        } else {
             switch(styleType) {
                case 'newton': return "px-3 py-1 border border-[#1a2b15] rounded shadow-[1px_1px_0_#1a2b15] text-[10px] font-bold uppercase active:translate-y-[1px] active:shadow-none hover:bg-white/20";
                case 'p900': return base + "text-[#003366] underline";
                case 'blackberry': return base + "text-zinc-500 hover:text-white";
                case 'vaio': return base + "text-red-700 hover:underline";
                case 'treo': return base + "text-zinc-500 border border-zinc-300 rounded-full";
            }
        }
        return base;
    };

    const textColor = styleType === 'blackberry' ? 'text-white' : styleType === 'newton' ? 'text-[#1a2b15]' : 'text-black';

    return (
        <form onSubmit={onSave} className="flex flex-col gap-3 h-full">
            <div className="flex-1 overflow-y-auto pr-1">
                <div className="mb-3">
                    <label className={getLabelClass()}>User Nickname</label>
                    <input type="text" value={localKeys.nickname} onChange={e => setLocalKeys({...localKeys, nickname: e.target.value})} className={getInputClass()} maxLength={12} placeholder="User" />
                </div>
                <div className="mb-3">
                    <label className={getLabelClass()}>Gemini API Key</label>
                    <input type="password" value={localKeys.gemini} onChange={e => setLocalKeys({...localKeys, gemini: e.target.value})} className={getInputClass()} placeholder="Required" />
                </div>
                <div className="mb-3">
                    <label className={getLabelClass()}>Gemini Model</label>
                    <div className={`flex gap-2 text-[10px] ${textColor}`}>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <div className={`w-3 h-3 border border-current flex items-center justify-center ${styleType === 'newton' ? 'bg-white' : ''}`}>
                                {localKeys.geminiModel === 'gemini-2.5-flash' && <div className={`w-2 h-2 ${styleType === 'newton' ? 'bg-[#1a2b15]' : 'bg-current'}`}></div>}
                            </div>
                            Flash
                            <input type="radio" className="hidden" checked={localKeys.geminiModel === 'gemini-2.5-flash'} onChange={() => setLocalKeys({...localKeys, geminiModel: 'gemini-2.5-flash'})}/>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                             <div className={`w-3 h-3 border border-current flex items-center justify-center ${styleType === 'newton' ? 'bg-white' : ''}`}>
                                {localKeys.geminiModel === 'gemini-3-pro-preview' && <div className={`w-2 h-2 ${styleType === 'newton' ? 'bg-[#1a2b15]' : 'bg-current'}`}></div>}
                            </div>
                            Pro
                            <input type="radio" className="hidden" checked={localKeys.geminiModel === 'gemini-3-pro-preview'} onChange={() => setLocalKeys({...localKeys, geminiModel: 'gemini-3-pro-preview'})}/>
                        </label>
                    </div>
                </div>
                <div className="mb-3">
                    <label className={getLabelClass()}>DeepSeek API Key</label>
                    <input type="password" value={localKeys.deepseek} onChange={e => setLocalKeys({...localKeys, deepseek: e.target.value})} className={getInputClass()} placeholder="Optional" />
                </div>
                 <div className="mb-1">
                    <label className={getLabelClass()}>DeepSeek Model</label>
                    <div className={`flex gap-2 text-[10px] ${textColor}`}>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <div className={`w-3 h-3 border border-current flex items-center justify-center ${styleType === 'newton' ? 'bg-white' : ''}`}>
                                {localKeys.deepSeekModel === 'deepseek-chat' && <div className={`w-2 h-2 ${styleType === 'newton' ? 'bg-[#1a2b15]' : 'bg-current'}`}></div>}
                            </div>
                            Chat
                            <input type="radio" className="hidden" checked={localKeys.deepSeekModel === 'deepseek-chat'} onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-chat'})}/>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                             <div className={`w-3 h-3 border border-current flex items-center justify-center ${styleType === 'newton' ? 'bg-white' : ''}`}>
                                {localKeys.deepSeekModel === 'deepseek-reasoner' && <div className={`w-2 h-2 ${styleType === 'newton' ? 'bg-[#1a2b15]' : 'bg-current'}`}></div>}
                            </div>
                            Reason
                            <input type="radio" className="hidden" checked={localKeys.deepSeekModel === 'deepseek-reasoner'} onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-reasoner'})}/>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto flex justify-between items-center pt-2 border-t border-black/5">
                <button type="button" onClick={onSleep} className={getButtonClass('sleep')}>Sleep</button>
                <button type="submit" className={getButtonClass('save')}>Save</button>
            </div>
        </form>
    );
}

const ConfidentialFolder: React.FC<ConfidentialFolderProps> = ({ apiKeys, onSave, padType = 'newton' }) => {
  const { t } = useLanguage();
  const [isOn, setIsOn] = useState(false);
  const [localKeys, setLocalKeys] = useState<APIKeys>(apiKeys);
  
  // Dragging State - Fixed position to Top Left
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const isDown = useRef(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Update local keys when prop changes
      setLocalKeys(apiKeys);
  }, [apiKeys]);

  const handleTogglePower = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMoved.current) return;
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

  // Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('label')) return;
      if (e.button !== 0) return;
      
      isDown.current = true;
      hasMoved.current = false;
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      startPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (!isDown.current || !componentRef.current) return;
          const dx = e.clientX - startPos.current.x;
          const dy = e.clientY - startPos.current.y;
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
              hasMoved.current = true;
              if (!isDragging) setIsDragging(true);
          }
          if (hasMoved.current) {
              let newX = e.clientX - dragOffset.current.x;
              let newY = e.clientY - dragOffset.current.y;
              newX = Math.max(0, Math.min(newX, window.innerWidth - 300));
              newY = Math.max(0, Math.min(newY, window.innerHeight - 400));
              setPosition({ x: newX, y: newY });
          }
      };
      
      const handleGlobalUp = () => {
          isDown.current = false;
          if (isDragging) setTimeout(() => setIsDragging(false), 50);
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

  // --- RENDERERS ---

  // 1. Apple Newton MessagePad (The "Original" Style)
  const renderNewton = () => (
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
                                    
                                    <SettingsForm apiKeys={apiKeys} localKeys={localKeys} setLocalKeys={setLocalKeys} onSave={handleSave} onSleep={handleTogglePower} styleType="newton" />
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
  );

  // 2. Sony Ericsson P900 (Symbian UIQ)
  const renderP900 = () => (
      <div className="w-[260px] h-[480px] bg-gradient-to-b from-[#a0aab5] via-[#cfd6dd] to-[#9ea9b5] rounded-[10px] shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-3 flex flex-col relative border border-[#7c8996]">
          {/* Top Speaker Grill */}
          <div className="h-8 w-full flex justify-center items-start gap-1">
              <div className="w-10 h-1 bg-black/40 rounded-full"></div>
              <div className="w-10 h-1 bg-black/40 rounded-full"></div>
          </div>

          {/* Screen */}
          <div className="flex-1 bg-[#bccad6] border-2 border-gray-400 shadow-inner relative overflow-hidden">
               <div className={`w-full h-full bg-white transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-10'}`}>
                   {/* UIQ Header */}
                   <div className="h-6 bg-gradient-to-r from-[#5a7d9a] to-[#7fa0bd] flex items-center px-2">
                       <span className="text-white font-sans text-[10px] font-bold">Preferences</span>
                       <div className="ml-auto w-3 h-3 bg-white/20 rounded-sm"></div>
                   </div>
                   {/* Content */}
                   <div className="p-3 bg-[#f0f4f8] h-full flex flex-col font-sans">
                       <div className="border-b-2 border-[#5a7d9a] mb-2 text-[#003366] text-xs font-bold">Accounts</div>
                       <div className="flex-1 overflow-y-auto">
                           <SettingsForm apiKeys={apiKeys} localKeys={localKeys} setLocalKeys={setLocalKeys} onSave={handleSave} onSleep={handleTogglePower} styleType="p900" />
                       </div>
                   </div>
                   {/* Touch Keypad Hint */}
                   <div className="absolute bottom-0 w-full h-8 bg-[#dbe4eb] border-t border-[#a0b0c0] flex justify-around items-center">
                       <span className="text-[10px] text-[#5a7d9a] font-bold">Done</span>
                       <span className="text-[10px] text-[#5a7d9a] font-bold">Cancel</span>
                   </div>
               </div>
          </div>

          {/* Bottom Flip / Keypad (Closed State Simulation) */}
          <div className="h-16 mt-2 bg-[#1a2b3c] rounded-[4px] flex flex-col items-center justify-center gap-1 border-t-2 border-[#a0aab5]">
              <div className="text-[8px] text-white/50 uppercase tracking-widest font-bold">Sony Ericsson</div>
              <div className="flex gap-2">
                  <div className="w-8 h-4 bg-[#2c4054] rounded-sm border border-[#3e566d]"></div>
                  <div className="w-8 h-4 bg-[#2c4054] rounded-sm border border-[#3e566d]"></div>
                  <div className="w-8 h-4 bg-[#2c4054] rounded-sm border border-[#3e566d]"></div>
              </div>
          </div>
          
          {/* Side Jog Dial (Visual) */}
          <div className="absolute -left-2 top-20 w-2 h-10 bg-gray-700 rounded-l border border-gray-600"></div>
          {/* Power Button */}
          <div onClick={handleTogglePower} className="absolute -right-1 top-12 w-2 h-6 bg-red-800 rounded-r cursor-pointer hover:bg-red-600 border border-red-900"></div>
      </div>
  );

  // 3. BlackBerry Passport (BB10)
  const renderBlackberry = () => (
      <div className="w-[340px] h-[400px] bg-[#111] rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col relative border-x-[4px] border-zinc-400">
          {/* Top Bezel */}
          <div className="h-8 flex justify-center items-center">
              <span className="text-zinc-500 font-sans font-bold text-[8px] tracking-[0.2em] uppercase">BlackBerry</span>
          </div>

          {/* Screen (Square) */}
          <div className="w-full aspect-square bg-black relative">
              <div className={`w-full h-full transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-0'}`}>
                  {/* BB10 UI */}
                  <div className="w-full h-full bg-cover relative p-6 flex flex-col" style={{ backgroundImage: 'linear-gradient(to bottom right, #2b0042, #000)' }}>
                      <div className="text-white text-2xl font-light mb-4 border-b border-white/20 pb-2">Settings</div>
                      <div className="flex-1">
                          <SettingsForm apiKeys={apiKeys} localKeys={localKeys} setLocalKeys={setLocalKeys} onSave={handleSave} onSleep={handleTogglePower} styleType="blackberry" />
                      </div>
                      {/* Gesture Bar */}
                      <div className="h-1 w-20 bg-white/20 rounded-full mx-auto mt-2"></div>
                  </div>
              </div>
              
              {/* Wake overlay */}
              {!isOn && <div className="absolute inset-0 cursor-pointer" onClick={handleTogglePower}></div>}
          </div>

          {/* Physical Keyboard (Visual Only) */}
          <div className="flex-1 bg-[#0a0a0a] p-2 flex flex-col justify-end gap-[1px]">
              {[1, 2, 3].map(row => (
                  <div key={row} className="flex justify-between gap-[1px] h-full">
                      {Array.from({length:10}).map((_,k) => (
                          <div key={k} className="flex-1 bg-[#1a1a1a] rounded-[2px] border-b-2 border-[#050505] flex items-center justify-center shadow-inner">
                              <div className="text-[6px] text-white/60 font-bold">T</div>
                          </div>
                      ))}
                  </div>
              ))}
          </div>
          
          {/* Power Button Top */}
          <div onClick={handleTogglePower} className="absolute top-[-2px] right-8 w-8 h-1 bg-zinc-400 cursor-pointer hover:bg-zinc-200"></div>
      </div>
  );

  // 4. Sony Vaio UX17 (UMPC)
  const renderVaio = () => (
      <div className="w-[360px] h-[240px] bg-[#e0e0e0] rounded-[8px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-1 flex relative border border-gray-400">
          {/* Left Controls */}
          <div className="w-12 bg-[#111] rounded-l-[4px] flex flex-col items-center justify-center gap-2 p-1">
              <div className="w-8 h-8 rounded-full bg-[#222] border border-[#444] shadow-inner flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#333] rounded-full"></div>
              </div>
              <div className="w-6 h-2 bg-zinc-600 rounded-full"></div>
              <div className="w-6 h-2 bg-zinc-600 rounded-full"></div>
          </div>

          {/* Screen Frame */}
          <div className="flex-1 bg-black border-[4px] border-[#111] relative overflow-hidden">
              <div className={`w-full h-full bg-[#245edb] transition-opacity duration-200 ${isOn ? 'opacity-100' : 'opacity-0'}`} style={{backgroundImage: 'linear-gradient(135deg, #245edb 0%, #aebdda 100%)'}}>
                  {/* Windows XP Style Window */}
                  <div className="absolute top-4 left-4 right-4 bottom-4 bg-[#ece9d8] rounded-t-lg shadow-lg flex flex-col font-sans border border-[#0055ea]">
                      <div className="h-6 bg-gradient-to-r from-[#0058ee] to-[#3f93ff] flex items-center justify-between px-2 rounded-t-[4px]">
                          <span className="text-white text-xs font-bold shadow-sm">System Properties</span>
                          <div className="w-4 h-4 bg-[#e64024] border border-white rounded-[2px] text-white flex items-center justify-center text-[8px] cursor-pointer" onClick={handleTogglePower}>X</div>
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                          <SettingsForm apiKeys={apiKeys} localKeys={localKeys} setLocalKeys={setLocalKeys} onSave={handleSave} onSleep={handleTogglePower} styleType="vaio" />
                      </div>
                  </div>
              </div>
              {!isOn && <div className="absolute inset-0 bg-black cursor-pointer flex items-center justify-center" onClick={handleTogglePower}><span className="text-white/20 font-bold italic tracking-widest">VAIO</span></div>}
          </div>

          {/* Right Controls */}
          <div className="w-12 bg-[#111] rounded-r-[4px] flex flex-col items-center justify-center gap-2">
               <div className="w-8 h-8 grid grid-cols-2 gap-1">
                   <div className="bg-[#222] rounded-sm"></div><div className="bg-[#222] rounded-sm"></div>
                   <div className="bg-[#222] rounded-sm"></div><div className="bg-[#222] rounded-sm"></div>
               </div>
               <div className="mt-4 w-2 h-8 bg-blue-500/50 rounded-full shadow-[0_0_5px_blue]"></div>
          </div>
      </div>
  );

  // 5. Palm Treo 700 (Palm OS)
  const renderTreo = () => (
      <div className="w-[260px] h-[460px] bg-[#c0c0c0] rounded-[30px] shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col items-center p-2 border-b-4 border-gray-500 relative">
          {/* Antenna Stub */}
          <div className="absolute -top-4 right-6 w-6 h-8 bg-[#a0a0a0] rounded-t-lg z-[-1] border border-gray-400"></div>

          {/* Earpiece */}
          <div className="w-16 h-2 bg-gray-400 rounded-full mb-3 mt-2 shadow-inner"></div>

          {/* Screen Area */}
          <div className="w-[220px] h-[220px] bg-[#9ca4a3] rounded-lg border-2 border-gray-400 shadow-inner relative overflow-hidden">
              <div className={`w-full h-full bg-white transition-opacity duration-200 ${isOn ? 'opacity-100' : 'opacity-10'}`}>
                  {/* Palm OS Title Bar */}
                  <div className="h-5 bg-black text-white flex items-center px-1 justify-between">
                      <span className="font-bold text-[10px] ml-1">Prefs</span>
                      <span className="text-[9px]">12:00</span>
                  </div>
                  <div className="p-2 h-full flex flex-col bg-white">
                      <div className="border-b border-black mb-2 text-[10px] font-bold">Connection Settings</div>
                      <div className="flex-1 overflow-y-auto">
                          <SettingsForm apiKeys={apiKeys} localKeys={localKeys} setLocalKeys={setLocalKeys} onSave={handleSave} onSleep={handleTogglePower} styleType="treo" />
                      </div>
                  </div>
              </div>
              {!isOn && <div className="absolute inset-0 cursor-pointer" onClick={handleTogglePower}></div>}
          </div>

          {/* Navigation Controls */}
          <div className="w-full h-16 flex justify-center items-center gap-4 mt-2">
              <div className="w-10 h-6 bg-zinc-300 rounded-full shadow border border-gray-400"></div>
              <div className="w-12 h-12 rounded-full border border-gray-400 bg-zinc-200 flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-zinc-400 rounded-full shadow-inner"></div>
              </div>
              <div className="w-10 h-6 bg-zinc-300 rounded-full shadow border border-gray-400"></div>
          </div>

          {/* Thumb Keyboard (Visual) */}
          <div className="w-full flex-1 bg-[#d0d0d0] rounded-b-[20px] mt-2 p-1 grid grid-cols-4 gap-[2px]">
              {Array.from({length: 20}).map((_,i) => (
                  <div key={i} className="bg-[#e0e0e0] rounded-[4px] shadow-[0_1px_0_#999] border-t border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div 
        ref={componentRef}
        className={`
            absolute z-[170] flex flex-col items-center perspective-1000
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
        {padType === 'newton' && renderNewton()}
        {padType === 'p900' && renderP900()}
        {padType === 'blackberry' && renderBlackberry()}
        {padType === 'vaio' && renderVaio()}
        {padType === 'treo' && renderTreo()}
    </div>
  );
};

export default ConfidentialFolder;