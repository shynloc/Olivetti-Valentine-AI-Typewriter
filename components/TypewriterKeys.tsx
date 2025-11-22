import React, { useState } from 'react';
import { KeyState } from '../types';
import { playKeySound } from '../services/soundService';

interface TypewriterKeysProps {
  activeKeys: KeyState;
  onKeyClick: (char: string) => void;
  isLightOn: boolean;
  isBold: boolean;
  isRed: boolean;
  isCapsLock: boolean;
  isShift: boolean;
  backlightIntensity?: number; // 0.0 to 1.0
  isDigitalMode?: boolean;
  bufferText?: string;
  onBufferChange?: (val: string) => void;
  onPrint?: () => void;
  onTriggerAI?: () => void;
  isAIActive?: boolean;
}

type KeyDef = string | { 
  label: string; 
  shiftLabel?: string; 
  code?: string; 
  width?: string;
  isFunction?: boolean;
};

const ROWS: KeyDef[][] = [
  [
    { label: '1', shiftLabel: '!' },
    { label: '2', shiftLabel: '@' },
    { label: '3', shiftLabel: '#' },
    { label: '4', shiftLabel: '$' },
    { label: '5', shiftLabel: '%' },
    { label: '6', shiftLabel: '^' },
    { label: '7', shiftLabel: '&' },
    { label: '8', shiftLabel: '*' },
    { label: '9', shiftLabel: '(' },
    { label: '0', shiftLabel: ')' },
    { label: '-', shiftLabel: '_' },
    { label: '=', shiftLabel: '+' }, 
    { label: 'BS', code: 'BS', width: 'w-[60px]' }
  ],
  [
    { label: 'TAB', code: 'Tab', width: 'w-[60px]', isFunction: true }, 
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
    { label: '[', shiftLabel: '{' },
    { label: ']', shiftLabel: '}' } // Added ]/} key
  ],
  [
    { label: 'LOCK', code: 'LOCK', width: 'w-[50px]', isFunction: true }, 
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 
    { label: ';', shiftLabel: ':' }, 
    { label: "'", shiftLabel: '"' }, 
    { label: 'ENT', code: 'ENT', width: 'w-[70px]' }
  ],
  [
    { label: 'SHIFT', code: 'SHIFT', width: 'w-[60px]', isFunction: true },
    'Z', 'X', 'C', 'V', 'B', 'N', 'M', 
    { label: ',', shiftLabel: '<' },
    { label: '.', shiftLabel: '>' }, 
    { label: '/', shiftLabel: '?' }, 
    { label: 'SHIFT', code: 'SHIFT', width: 'w-[60px]', isFunction: true }
  ]
];

const TypewriterKeys: React.FC<TypewriterKeysProps> = ({ 
  activeKeys, 
  onKeyClick, 
  isLightOn,
  isBold,
  isRed,
  isCapsLock,
  isShift,
  backlightIntensity = 0.5,
  isDigitalMode = false,
  bufferText = "",
  onBufferChange,
  onPrint,
  onTriggerAI,
  isAIActive = false
}) => {
  
  // Local state to handle animation for mouse clicks independently of parent state
  const [localActiveKeys, setLocalActiveKeys] = useState<KeyState>({});

  const triggerKeyAnimation = (code: string) => {
      setLocalActiveKeys(prev => ({ ...prev, [code]: true }));
      setTimeout(() => {
        setLocalActiveKeys(prev => ({ ...prev, [code]: false }));
      }, 150);
  };

  const handlePress = (keyDef: KeyDef) => {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
      playKeySound();
      
      const label = typeof keyDef === 'string' ? keyDef : keyDef.label;
      const code = typeof keyDef === 'string' ? keyDef : (keyDef.code || keyDef.label);

      // Trigger local animation
      triggerKeyAnimation(code);

      // Special handling for mapping event names
      let eventChar = code;
      if (code === 'ENT') eventChar = 'Enter';
      else if (code === 'BS') eventChar = 'Backspace';
      else if (code === 'BOLD') eventChar = 'TOGGLE_BOLD';
      else if (code === 'RED') eventChar = 'TOGGLE_RED';
      else if (code === 'LOCK') eventChar = 'TOGGLE_LOCK';
      else if (code === 'SHIFT') eventChar = 'TOGGLE_SHIFT';
      else if (code === 'Tab') eventChar = 'Tab';
      else if (label.length === 1) eventChar = label.toLowerCase();
      
      // In Digital Mode, redirect functionality
      if (isDigitalMode) {
          if (code === 'ENT') {
              if (onPrint) onPrint(); // Red Key acts as Print
          } else {
              onKeyClick(eventChar); // Pass other keys for generic feedback if needed, mainly for visual
          }
      } else {
          onKeyClick(eventChar);
      }
  };

  const renderKey = (keyDef: KeyDef, index: number) => {
    const label = typeof keyDef === 'string' ? keyDef : keyDef.label;
    const shiftLabel = typeof keyDef === 'string' ? undefined : keyDef.shiftLabel;
    const code = typeof keyDef === 'string' ? keyDef : (keyDef.code || keyDef.label);
    const widthClass = typeof keyDef === 'string' ? "w-11" : (keyDef.width || "w-11");
    
    // Identify special keys
    const isEnter = code === 'ENT';
    const isBackspace = code === 'BS';
    const isTab = code === 'Tab';
    const isBoldKey = code === 'BOLD';
    const isRedKey = code === 'RED';
    const isLockKey = code === 'LOCK';
    const isShiftKey = code === 'SHIFT';
    const isSpecial = isEnter || isBackspace || isTab || isBoldKey || isRedKey || isLockKey || isShiftKey;

    // State Checks (Check BOTH prop from physical keyboard AND local state from mouse click)
    const isActive = localActiveKeys[code] || 
                    activeKeys[code] || activeKeys[label.toLowerCase()] || activeKeys[label] ||
                    (isBoldKey && activeKeys['TOGGLE_BOLD']) ||
                    (isRedKey && activeKeys['TOGGLE_RED']) ||
                    (isLockKey && activeKeys['TOGGLE_LOCK']) ||
                    (isShiftKey && activeKeys['TOGGLE_SHIFT']) ||
                    (isShiftKey && (activeKeys['Shift'] || activeKeys['SHIFT']));

    // Toggle Logic
    const isToggledOn = (isBoldKey && isBold) || 
                        (isRedKey && isRed) || 
                        (isLockKey && isCapsLock) || 
                        (isShiftKey && isShift);

    // Backlight Logic
    const isBacklit = !isLightOn && !isEnter && !isRedKey;
    
    const glowOpacity = 0.3 + (backlightIntensity * 0.7); // 0.3 to 1.0
    const glowSpread = 2 + (backlightIntensity * 6); // 2px to 8px
    const glowColor = `rgba(255, 50, 50, ${glowOpacity})`;
    
    const backlightStyle = isBacklit ? {
        color: `rgba(255, ${150 + backlightIntensity * 105}, ${150 + backlightIntensity * 105}, 0.9)`,
        textShadow: `0 0 ${glowSpread}px ${glowColor}, 0 0 ${glowSpread * 2}px rgba(200,0,0,0.4)`
    } : {};

    return (
      <button
        key={`${code}-${index}`}
        className={`
          relative group ${widthClass} h-11 mx-[3px] mb-4
          outline-none perspective-500 select-none cursor-pointer
        `}
        onMouseDown={(e) => {
            e.preventDefault(); 
            handlePress(keyDef);
        }}
      >
        {/* KEY STEM - Enhanced movement range */}
        <div className={`
            absolute left-1/2 -translate-x-1/2 top-2 w-2 h-12 bg-[#111]
            transition-transform duration-75 cubic-bezier(0.2, 0, 0.4, 1) z-0
            ${isActive ? 'translate-y-6' : isToggledOn ? 'translate-y-2' : '-translate-y-1'}
        `}></div>

        {/* SHADOW - Tighter on press */}
        <div className={`
            absolute left-1 right-1 top-2 bottom-0 rounded-full
            bg-black/60 blur-[4px]
            transition-all duration-75 ease-out z-0
            ${isActive ? 'translate-y-1 opacity-0 scale-50' : 'translate-y-4 opacity-70'}
        `}></div>

        {/* KEY STRUCTURE (Cylinder) - Deeper travel and tilt */}
        <div className={`
            relative z-10 w-full h-full rounded-full
            bg-gradient-to-b from-[#222] to-[#050505]
            shadow-[0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,1)]
            transition-transform duration-50 cubic-bezier(0.2, 0, 0.2, 1)
            ${isActive 
                ? 'translate-y-[18px] scale-y-90 rotate-x-12' 
                : isToggledOn 
                    ? 'translate-y-[4px] border-b-0 shadow-none' 
                    : 'translate-y-0 scale-y-100 rotate-x-0'
            }
        `}>
            {/* KEY CAP */}
            <div className={`
                absolute inset-[1px] rounded-full
                flex items-center justify-center
                border-[0.5px] border-white/5
                ${isEnter ? 'bg-[#bb1e17]' : isRedKey ? 'bg-[#80100b]' : (isSpecial) ? 'bg-[#2a2a2a]' : 'bg-[#181818]'}
                overflow-hidden
                ${isToggledOn ? 'shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]' : !isLightOn && !isEnter ? 'shadow-[0_0_5px_rgba(200,50,50,0.05)]' : ''}
            `}>
                 {/* Concave Surface */}
                 <div className={`
                    absolute inset-0 rounded-full
                    bg-gradient-to-br 
                    ${isEnter 
                        ? 'from-[#d7261e] via-[#a61c15] to-[#80100b]' 
                        : isRedKey
                             ? 'from-[#d7261e] via-[#b0100b] to-[#600000]'
                             : 'from-[#2a2a2a] via-[#151515] to-[#050505]'}
                    shadow-[inset_0_5px_10px_rgba(0,0,0,0.9),inset_0_2px_3px_rgba(255,255,255,0.15)]
                 `}></div>
                 
                 {/* Finger Oil / Wear */}
                 <div className="absolute inset-2 rounded-full bg-white/10 blur-[3px] opacity-30"></div>
                 
                 {/* Indicator Light for Toggles */}
                 {(isBoldKey || isRedKey || isLockKey || isShiftKey) && isToggledOn && (
                     <div className="absolute top-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#4ade80] opacity-80 border border-black/50"></div>
                 )}

                 {/* Legend Content */}
                 <div className={`
                    relative z-10 flex flex-col items-center justify-center leading-none
                    transition-all duration-75
                    ${isActive ? 'scale-90 opacity-50 translate-y-[2px]' : 'scale-100'}
                 `}
                 style={{ opacity: isEnter ? 0.9 : 0.7 }}
                 >
                   {shiftLabel ? (
                      <>
                        <span 
                            className={`text-[9px] font-bold mb-[1px] transition-all duration-300 ${isShift ? 'text-white opacity-100' : 'text-[#e0e0e0] opacity-60'}`}
                            style={isBacklit && !isShift ? backlightStyle : {}}
                        >
                           {shiftLabel}
                        </span>
                        <span 
                            className={`text-[11px] font-bold transition-all duration-300 ${!isShift ? 'text-white opacity-100' : 'text-[#e0e0e0] opacity-60'}`}
                            style={isBacklit && !isShift ? backlightStyle : {}}
                        >
                           {label}
                        </span>
                      </>
                   ) : (
                      <span 
                        className={`
                            font-sans font-bold select-none transition-all duration-300
                            ${isEnter ? 'text-white/90 text-xl' : isSpecial ? 'text-[10px]' : 'text-sm'}
                            ${isRedKey && !isToggledOn ? 'text-red-500' : ''}
                            ${isRedKey && isToggledOn ? 'text-red-200 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : ''}
                            ${isEnter ? '' : isSpecial ? 'text-[#e0e0e0] opacity-90' : ''}
                        `}
                        style={isBacklit ? backlightStyle : (!isEnter && !isRedKey && !isSpecial) ? { color: '#e0e0e0', opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.9))' } : {}}
                      >
                        {code === 'BS' ? '←' : code === 'ENT' ? (isDigitalMode ? 'PRINT' : '↩') : label}
                      </span>
                   )}
                 </div>
            </div>
        </div>
      </button>
    );
  };

  // Space Row Keys definition
  const spaceRowLeft = { label: 'BOLD', code: 'BOLD', width: 'w-14' };
  const spaceRowRight = { label: 'RED', code: 'RED', width: 'w-14' };
  // Red Enter is actually ROWS[2] last item

  const isSpaceActive = localActiveKeys[' '] || activeKeys[' '];

  return (
    <div className="relative z-20 flex flex-col items-center pt-2 pb-2 w-full px-4">
         
         {/* DIGITAL MODE: Text Buffer Area */}
         {isDigitalMode && (
             <div className="w-full h-[180px] bg-[#050505] rounded-xl shadow-inner border border-zinc-800 p-4 mb-4 relative overflow-hidden group">
                 <textarea 
                    value={bufferText}
                    onChange={(e) => onBufferChange?.(e.target.value)}
                    className="w-full h-full bg-transparent text-emerald-400 font-typewriter text-[18px] outline-none resize-none placeholder-emerald-900/50"
                    placeholder="> Input buffer ready..."
                    spellCheck={false}
                 />
                 
                 {/* AI Trigger Button */}
                 {isAIActive && onTriggerAI && (
                     <button 
                        onClick={onTriggerAI}
                        className="absolute bottom-4 right-4 bg-emerald-900/80 hover:bg-emerald-700 text-emerald-100 text-[10px] px-3 py-1 rounded border border-emerald-500/30 flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all uppercase tracking-widest font-bold"
                     >
                        <span className="material-icons text-xs">send</span>
                        TRANSMIT
                     </button>
                 )}
                 
                 <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                 </div>
                 
                 {/* CRT Scanline effect */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
             </div>
         )}

         {/* MECHANICAL KEYS: Rows 1-3 (Hidden in Digital Mode) */}
         {!isDigitalMode && (
             <>
                 {/* Row 1 */}
                 <div className="flex justify-center w-full">
                     {ROWS[0].map((def, i) => renderKey(def, i))}
                 </div>
                 {/* Row 2 */}
                 <div className="flex justify-center w-full pl-0">
                     {ROWS[1].map((def, i) => renderKey(def, i))}
                 </div>
                 {/* Row 3 */}
                 <div className="flex justify-center w-full">
                     {ROWS[2].map((def, i) => renderKey(def, i))}
                 </div>
             </>
         )}

         {/* HYBRID ROW (Row 4 + Space) - Modified for Digital Mode */}
         {/* In Digital Mode, we only want the Red Enter button mainly, but showing the space bar row keeps visual anchor */}
         
         {!isDigitalMode && (
             <div className="flex justify-center w-full">
                 {ROWS[3].map((def, i) => renderKey(def, i))}
             </div>
         )}
         
         {/* SPACEBAR ROW */}
         <div className="mt-2 flex items-center justify-center gap-4">
            {/* BOLD KEY (Left) - Hide in digital? Keep for balance */}
            {!isDigitalMode && renderKey(spaceRowLeft, 0)}

            {/* SPACEBAR */}
            <button
                className={`relative outline-none group perspective-500 mx-2 cursor-pointer ${isDigitalMode ? 'w-48 h-10' : 'w-64 h-10'}`}
                onMouseDown={(e) => {
                    e.preventDefault();
                    triggerKeyAnimation(' ');

                    if(isDigitalMode && onBufferChange) {
                        onBufferChange(bufferText + ' ');
                        playKeySound();
                    } else {
                        handlePress({ label: ' ' });
                    }
                }}
            >
                <div className={`
                    absolute left-1 right-1 top-1 bottom-0 bg-black/50 rounded-full blur-sm
                    transition-all duration-100
                    ${isSpaceActive ? 'translate-y-1 opacity-0' : 'translate-y-4 opacity-50'}
                `}></div>

                 <div className={`
                    absolute inset-0 rounded-full bg-[#151515]
                    shadow-[0_1px_0_rgba(255,255,255,0.1)]
                    transition-transform duration-75 cubic-bezier(0.2, 0, 0.4, 1)
                    ${isSpaceActive ? 'translate-y-[10px] scale-y-90 rotate-x-5' : 'translate-y-0'}
                 `}>
                    <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-[#222] to-[#0a0a0a] shadow-[inset_0_3px_8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center">
                        {/* Faint Backlight on spacebar */}
                        {!isLightOn && (
                             <div 
                                className="absolute inset-0 bg-red-900/20 blur-md transition-all duration-500"
                                style={{ opacity: backlightIntensity }}
                             ></div>
                        )}
                        <div className="w-[70%] h-[60%] bg-white/5 blur-md rounded-full opacity-50"></div>
                    </div>
                 </div>
            </button>

            {/* RED KEY (Right) - Hide in digital */}
            {!isDigitalMode && renderKey(spaceRowRight, 0)}

            {/* In Digital Mode, we force the ENTER key to appear here or use a custom one */}
            {isDigitalMode && renderKey({ label: 'ENT', code: 'ENT', width: 'w-24' }, 99)}
         </div>
    </div>
  );
};

export default TypewriterKeys;