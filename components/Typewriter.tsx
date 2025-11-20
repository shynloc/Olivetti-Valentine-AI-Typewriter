
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KeyState, MAX_CHARS_PER_LINE, MAX_LINES_PER_PAGE, APIKeys, AIModel } from '../types';
import TypewriterKeys from './TypewriterKeys';
import { generateAIResponse } from '../services/aiService';
import { playKeySound, playReturnSound, playPaperLoadSound, playSwitchSound, playPaperCutSound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

interface TypewriterProps {
  onPaperFull: (content: string[]) => void;
  apiKeys: APIKeys;
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
  isLightOn: boolean;
  aiTemperature: number;
}

interface Stroke {
  char: string;
  classes: string; // CSS classes for style (bold, red)
}

const GeminiLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12,2 L15,9 L22,12 L15,15 L12,22 L9,15 L2,12 L9,9 Z" />
  </svg>
);

const DeepSeekLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
     <path d="M12,2 C17.5,2 22,6.5 22,12 C22,17.5 17.5,22 12,22 C6.5,22 2,17.5 2,12 C2,6.5 6.5,2 12,2 Z M12,18 C15.3,18 18,15.3 18,12 C18,8.7 15.3,6 12,6 C8.7,6 6,8.7 6,12 C6,15.3 8.7,18 12,18 Z" opacity="0.4"/>
     <path d="M13.5,8.5 L10.5,12 L13.5,15.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Mapping for Shift + Number/Symbol Row
const SHIFT_MAP: Record<string, string> = {
  '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', 
  '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
  '-': '_', 
  '=': '+', 
  ';': ':', 
  "'": '"', 
  ',': '<', 
  '.': '>', 
  '/': '?',
  '[': '{',
  ']': '}'
};

const Typewriter: React.FC<TypewriterProps> = ({ 
  onPaperFull, 
  apiKeys, 
  selectedModel,
  onModelSelect,
  isLightOn,
  aiTemperature
}) => {
  const { t, language } = useLanguage();
  
  // State stores lines as arrays of stroke objects
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[][]>([[]]);
  const [activeKeys, setActiveKeys] = useState<KeyState>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  
  // Styling State
  const [isBold, setIsBold] = useState(false);
  const [isRed, setIsRed] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isShift, setIsShift] = useState(false);
  
  // Backlight Control
  const [backlightIntensity, setBacklightIntensity] = useState(0.6);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fix: Only focus if not interacting with form elements
    const focusInput = (e?: MouseEvent) => {
       if (e && e.target instanceof HTMLElement) {
           const tagName = e.target.tagName;
           if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || e.target.closest('input, textarea, select')) {
               return;
           }
       }
       inputRef.current?.focus();
    };
    document.addEventListener('click', focusInput as any);
    focusInput(undefined);
    return () => document.removeEventListener('click', focusInput as any);
  }, []);

  // Helper to convert strokes back to raw text strings for Markdown processing
  const serializeStrokes = useCallback((strokes: Stroke[][]): string[] => {
     return strokes.map(line => 
         line.map(s => s.char).join('')
     );
  }, []);

  // Helper to get plain text for AI prompt
  const getPlainText = useCallback(() => {
     return currentStrokes.map(line => line.map(s => s.char).join('')).join('\n');
  }, [currentStrokes]);

  const typeChar = useCallback((char: string, silent = false) => {
    if (!silent) playKeySound();
    
    let processedChar = char;

    // Handle Tab
    if (char === 'Tab') {
        // Insert 4 spaces
        for (let i=0; i<4; i++) typeChar(' ', true);
        return;
    }

    // Handle Shift Mapping for numbers/symbols
    if (isShift && SHIFT_MAP[char]) {
        processedChar = SHIFT_MAP[char];
    } 
    // Handle Case (Shift + Letters or CapsLock)
    else if (char.length === 1 && /[a-zA-Z]/.test(char)) {
        if (isShift) {
            processedChar = isCapsLock ? char.toLowerCase() : char.toUpperCase();
        } else {
            processedChar = isCapsLock ? char.toUpperCase() : char.toLowerCase();
        }
    }
    
    setCurrentStrokes(prev => {
      const newLines = [...prev];
      let lastLineIndex = newLines.length - 1;
      let lastLine = [...newLines[lastLineIndex]]; // Copy current line strokes

      if (char === 'Enter') {
         newLines.push([]);
         if (!silent) playReturnSound();
      } else if (char === 'Backspace') {
        if (lastLine.length > 0) {
            lastLine.pop();
            newLines[lastLineIndex] = lastLine;
        } else if (newLines.length > 1) {
            newLines.pop();
        }
      } else if (char.length === 1) {
        // Build stroke with current styles
        let className = "";
        if (isBold) className += "font-bold ";
        if (isRed) className += "text-red-600 ";
        
        const newStroke: Stroke = { char: processedChar, classes: className.trim() };

        if (lastLine.length >= MAX_CHARS_PER_LINE) {
          // Word wrapping logic (simplified for strokes)
          // Check for space in the last 60% of the line
          let splitIndex = -1;
          for (let i = lastLine.length - 1; i > MAX_CHARS_PER_LINE * 0.6; i--) {
              if (lastLine[i].char === ' ') {
                  splitIndex = i;
                  break;
              }
          }

          if (splitIndex !== -1) {
             // Move words
             const nextLine = lastLine.slice(splitIndex + 1);
             nextLine.push(newStroke);
             newLines[lastLineIndex] = lastLine.slice(0, splitIndex);
             newLines.push(nextLine);
          } else {
             // Force break
             newLines.push([newStroke]);
          }
          if (!silent) playReturnSound();
        } else {
          lastLine.push(newStroke);
          newLines[lastLineIndex] = lastLine;
        }
      }
      return newLines;
    });
  }, [isBold, isRed, isCapsLock, isShift]);

  const triggerEject = useCallback(() => {
     if (isEjecting) return;
     setIsEjecting(true);
     playPaperCutSound();
      
      setTimeout(() => {
          onPaperFull(serializeStrokes(currentStrokes)); 
          setCurrentStrokes([[]]); 
          setIsEjecting(false);
          playPaperLoadSound();
      }, 800);
  }, [isEjecting, currentStrokes, onPaperFull, serializeStrokes]);

  // Handle Auto Paper Full
  useEffect(() => {
    if (currentStrokes.length > MAX_LINES_PER_PAGE && !isEjecting) {
      triggerEject();
    }
  }, [currentStrokes, isEjecting, triggerEject]);

  const handleManualEject = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentStrokes.length <= 1 && currentStrokes[0].length === 0) return; 
      triggerEject();
  };

  const handleEnter = async () => {
    if (!selectedModel) return;
    if (isTyping || isThinking || isEjecting) return;
    
    const fullText = getPlainText();
    if (fullText.trim().length < 2) return;

    setIsThinking(true);
    
    // Add a temporary visual indicator directly to strokes
    const thinkingText = t('thinking');
    setCurrentStrokes(prev => {
        const loadingStroke = { char: thinkingText, classes: "text-xs italic text-gray-400" };
        return [...prev, [loadingStroke]];
    });
    
    playReturnSound();

    // Localized system instruction
    const langName = language === 'zh-CN' ? 'Simplified Chinese' : 
                     language === 'zh-TW' ? 'Traditional Chinese' : 
                     language === 'ja' ? 'Japanese' : 'English';
    
    const systemInstruction = `You are a helpful assistant typing on a vintage typewriter. Your output will be rendered using Markdown. Please use Markdown formatting (e.g., # headers, **bold**, *italics*, - lists) to structure your response nicely. Keep the tone nostalgic and concise. Please reply in ${langName}.`;
    
    const fallbackError = "Error: Ribbon jammed.";

    const response = await generateAIResponse(fullText, selectedModel, apiKeys, systemInstruction, fallbackError, aiTemperature);
    
    setCurrentStrokes(prev => {
        const newLines = [...prev];
        // Remove "Thinking..."
        newLines.pop();
        if (newLines.length > 0 && newLines[newLines.length - 1].length > 0) {
            newLines.push([]); // Ensure new line
        }
        return newLines;
    });

    setIsThinking(false);
    setIsTyping(true);

    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < response.length) {
            const char = response[i];
            const key = char === '\n' ? 'Enter' : char.toUpperCase();
            
            // Visual Key Press
            setActiveKeys(prev => ({ ...prev, [key]: true }));
            setTimeout(() => setActiveKeys(prev => ({ ...prev, [key]: false })), 80);
            
            if (char === '\n') {
                 typeChar('Enter');
            } else {
                 typeChar(char);
            }
            i++;
        } else {
            clearInterval(typeInterval);
            typeChar('Enter'); 
            typeChar('Enter'); 
            setIsTyping(false);
        }
    }, 40); // Slightly faster for AI
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isTyping || isThinking || isEjecting) {
        e.preventDefault();
        return; 
    }
    
    const key = e.key;
    let mapKey = key.toUpperCase();
    
    if (key === 'Enter') mapKey = 'ENT';
    if (key === 'Backspace') mapKey = 'BS';
    if (key === 'CapsLock') mapKey = 'LOCK';
    if (key === 'Shift') mapKey = 'SHIFT';
    if (key === 'Tab') {
        e.preventDefault(); // Prevent focus loss
        mapKey = 'Tab';
    }
    
    // Physical Shift handling
    if (key === 'Shift') {
        setIsShift(true);
        setActiveKeys(prev => ({ ...prev, 'SHIFT': true }));
        return;
    }

    // Toggle Caps Lock via physical key
    if (key === 'CapsLock') {
       playSwitchSound();
       setIsCapsLock(!isCapsLock);
    }

    // Reverse Map for Shifted symbols to light up their base key
    const reverseMap = Object.keys(SHIFT_MAP).find(k => SHIFT_MAP[k] === key);
    if (reverseMap) {
        mapKey = reverseMap;
    }

    setActiveKeys(prev => ({ ...prev, [mapKey]: true }));

    if (key === 'Enter') {
        typeChar('Enter');
        handleEnter();
    } else if (key === 'Backspace') {
        typeChar('Backspace');
    } else if (key === 'Tab') {
        typeChar('Tab');
    } else if (key.length === 1) {
        typeChar(key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    let mapKey = key.toUpperCase();
    
    if (key === 'Enter') mapKey = 'ENT';
    if (key === 'Backspace') mapKey = 'BS';
    if (key === 'CapsLock') mapKey = 'LOCK';
    if (key === 'Tab') mapKey = 'Tab';
    if (key === 'Shift') {
        mapKey = 'SHIFT';
        setIsShift(false);
    }

    const reverseMap = Object.keys(SHIFT_MAP).find(k => SHIFT_MAP[k] === key);
    if (reverseMap) mapKey = reverseMap;
    
    setActiveKeys(prev => ({ ...prev, [mapKey]: false }));
  };

  const handleVirtualKey = (char: string) => {
      if (isTyping || isThinking || isEjecting) return;
      
      if (char === 'TOGGLE_BOLD') {
          playSwitchSound();
          setIsBold(!isBold);
      } else if (char === 'TOGGLE_RED') {
          playSwitchSound();
          setIsRed(!isRed);
      } else if (char === 'TOGGLE_LOCK') {
          playSwitchSound();
          setIsCapsLock(!isCapsLock);
      } else if (char === 'TOGGLE_SHIFT') {
          playSwitchSound();
          setIsShift(!isShift);
      } else if (char === 'Enter') {
          typeChar('Enter');
          handleEnter();
      } else if (char === 'Backspace') {
          typeChar('Backspace');
      } else {
          typeChar(char);
      }
      inputRef.current?.focus();
  };

  const toggleModel = (model: AIModel) => {
      playSwitchSound();
      if (selectedModel === model) {
          onModelSelect(null);
      } else {
          onModelSelect(model);
      }
  };

  const lineHeight = 24; 
  const paperTranslationY = Math.min(0, - (currentStrokes.length * lineHeight) + 150);

  return (
    <div className="relative flex flex-col items-center w-[750px] mx-auto pt-24 select-none perspective-1000 group pointer-events-auto scale-100">
      
      <input 
        ref={inputRef}
        type="text" 
        className="opacity-0 absolute top-0 left-0 w-1 h-1 pointer-events-none"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        autoFocus
      />

      {/* --- PAPER FEED SYSTEM --- */}
      <div className={`
           absolute top-[-180px] z-10 w-[580px] flex flex-col items-center pointer-events-none 
           will-change-transform ease-in-out
           ${isEjecting ? 'transition-transform duration-700 ease-in' : 'transition-transform duration-500'}
           `}
           style={{ 
              transform: isEjecting 
                 ? `translateY(-1200px) rotate(-2deg)` 
                 : `translateY(${paperTranslationY}px)` 
           }}>
          
          {/* The Paper */}
          <div className="relative w-[520px] min-h-[650px] bg-paper-white paper-texture shadow-[0_5px_15px_rgba(0,0,0,0.2)] p-12 pt-20 text-left font-typewriter text-sm text-zinc-900 leading-[24px] origin-bottom">
               {currentStrokes.map((line, idx) => (
                   <div key={idx} className="min-h-[24px] relative whitespace-pre-wrap break-words">
                       {line.map((stroke, sIdx) => (
                           <span key={sIdx} className={stroke.classes}>{stroke.char}</span>
                       ))}
                       {/* Cursor */}
                       {idx === currentStrokes.length - 1 && !isTyping && !isThinking && !isEjecting && (
                           <span className={`absolute ml-0.5 -bottom-1 inline-block w-2 h-4 animate-pulse align-bottom ${isRed ? 'bg-red-500/50' : 'bg-black/50'}`}></span>
                       )}
                   </div>
               ))}
               <div className="absolute bottom-4 left-0 right-0 text-center text-[8px] text-gray-300 font-sans opacity-60">
                  OLIVETTI VALENTINE // {selectedModel ? selectedModel.toUpperCase() : t('manual')} // T:{aiTemperature.toFixed(1)}
               </div>
          </div>
      </div>

      {/* --- CHASSIS --- */}
      <div className="relative z-30 w-full flex flex-col items-center">

          {/* 1. PLATEN HOUSING */}
          <div className="w-[720px] h-24 bg-[#d7261e] rounded-t-[30px] shadow-[inset_0_1px_5px_rgba(255,255,255,0.2)] relative z-20 flex justify-center items-end overflow-visible">
               <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none overflow-hidden rounded-t-[30px]"
                    style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>

               {/* Return Lever */}
               <div 
                 onClick={() => { typeChar('Enter'); inputRef.current?.focus(); }}
                 className="absolute -left-8 top-8 w-4 h-32 bg-zinc-300 origin-bottom-right rotate-[-25deg] rounded-full shadow-xl z-0 cursor-pointer hover:rotate-[-20deg] active:rotate-[-15deg] transition-transform duration-200 border border-zinc-400"
               >
                   <div className="absolute top-0 left-[-20px] w-10 h-4 bg-zinc-200 rounded-full shadow-sm"></div>
               </div>
               
               {/* Eject Lever */}
               <div 
                 onClick={handleManualEject}
                 className="absolute -right-10 top-[-20px] w-20 h-40 z-50 cursor-pointer group"
               >
                    <div className="absolute inset-0 bg-transparent"></div>
                    <div className={`
                       absolute bottom-0 left-4
                       origin-bottom transition-transform duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55)
                       ${isEjecting ? 'rotate-[45deg]' : 'rotate-0 group-hover:rotate-6'}
                    `}>
                        <div className="w-2 h-24 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border-x border-zinc-500 shadow-lg rounded-full mx-auto"></div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-800 rounded-full shadow-inner border border-zinc-600"></div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-10 bg-[#d7261e] rounded-lg shadow-[inset_-2px_-2px_10px_rgba(0,0,0,0.4),2px_5px_10px_rgba(0,0,0,0.3)] border border-[#b91e17] flex items-center justify-center">
                             <div className="w-full h-full rounded-lg bg-gradient-to-br from-white/20 to-black/10 opacity-50"></div>
                             <div className="absolute w-8 h-6 border-y-2 border-black/10"></div>
                        </div>
                    </div>
               </div>

               {/* Mechanical Bay */}
               <div className="w-[600px] h-[70px] bg-[#111] rounded-t-lg shadow-[inset_0_10px_20px_rgba(0,0,0,1)] flex items-center justify-center relative top-2 border-b border-zinc-800">
                   <div className="w-[580px] h-14 bg-gradient-to-b from-[#222] via-[#111] to-[#000] rounded shadow-lg relative">
                       <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#fff_2px,#fff_3px)]"></div>
                       <div className="absolute -top-3 left-4 right-4 h-2 bg-zinc-500 rounded-t shadow-sm z-20 flex items-center justify-between px-2">
                          <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                          <div className="w-full h-[1px] bg-zinc-700 mx-2"></div>
                          <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                       </div>
                   </div>
                   <div className="absolute -left-10 w-8 h-10 bg-[#151515] rounded-l border-r border-zinc-800 shadow-md"></div>
                   <div className="absolute -right-10 w-8 h-10 bg-[#151515] rounded-r border-l border-zinc-800 shadow-md"></div>
               </div>
          </div>

          {/* 2. MAIN DECK */}
          <div className="w-[720px] h-20 bg-[#d7261e] relative z-30 shadow-[0_-1px_5px_rgba(0,0,0,0.1)] flex items-center justify-between px-16">
              <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                   style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>

              <div className="absolute left-1/2 -translate-x-1/2 top-4 text-[#d7261e] font-sans font-bold text-3xl tracking-[0.2em] lowercase scale-y-90 select-none pointer-events-none"
                   style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.2), -1px -1px 1px rgba(0,0,0,0.3)' }}>
                 valentine
              </div>

              <div className="flex gap-6 mt-6 relative z-10">
                  {['gemini', 'deepseek'].map((model) => {
                    const isActive = selectedModel === model;
                    return (
                      <div key={model} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => toggleModel(model as AIModel)}
                            className={`
                                relative w-12 h-12 rounded-full transition-all duration-150 outline-none group
                                bg-zinc-900 border-2 border-black
                                ${isActive ? 'translate-y-[4px] shadow-none' : 'shadow-[0_4px_0_#111] hover:-translate-y-0.5'}
                            `}
                          >
                              <div className="absolute inset-0.5 rounded-full bg-zinc-800 flex items-center justify-center shadow-inner">
                                 <div className={`text-zinc-300 transition-colors ${isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-30'}`}>
                                     {model === 'gemini' ? <GeminiLogo /> : <DeepSeekLogo />}
                                 </div>
                              </div>
                          </button>
                          <div className={`
                              w-2 h-2 rounded-full transition-all duration-300 border border-black/30
                              ${isActive 
                                ? 'bg-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#22c55e]' 
                                : 'bg-zinc-900 opacity-50'}
                          `}></div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex flex-col items-center mt-8 mr-4 relative z-10">
                  <div className={`
                      w-3 h-3 rounded-full border border-black/30 transition-all duration-300
                      ${isThinking ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse' : 'bg-[#4a0d0a]'}
                  `}></div>
                  <span className="text-[8px] font-bold text-[#80100b] mt-1 uppercase tracking-wider opacity-60"
                        style={{ textShadow: '0 1px 0 rgba(255,255,255,0.1)' }}>
                    {t('busy')}
                  </span>
              </div>
          </div>

          {/* 3. KEYBOARD WELL */}
          <div className="w-[720px] bg-[#d7261e] rounded-b-[40px] pb-8 px-8 pt-2 relative z-30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
              <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none rounded-b-[40px]"
                   style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'}}></div>

              <div className="bg-[#101010] rounded-[24px] p-4 pb-8 shadow-[inset_0_5px_15px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border-t border-black/50 relative z-10">
                   <TypewriterKeys 
                      activeKeys={activeKeys} 
                      onKeyClick={handleVirtualKey} 
                      isLightOn={isLightOn}
                      isBold={isBold}
                      isRed={isRed}
                      isCapsLock={isCapsLock}
                      isShift={isShift}
                      backlightIntensity={backlightIntensity}
                   />
                   
                   {/* Backlight Dimmer Control - Visible only in dark mode */}
                   {!isLightOn && (
                       <div className="absolute -right-7 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 animate-in fade-in duration-1000">
                           <div className="relative w-4 h-32 bg-zinc-900 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,1),0_0_1px_rgba(255,255,255,0.1)] border border-zinc-800 flex justify-center">
                               {/* Track */}
                               <div className="absolute top-2 bottom-2 w-1 bg-black/80 rounded-full">
                                   <div 
                                     className="absolute bottom-0 w-full bg-red-900/60 rounded-full transition-all duration-100"
                                     style={{ height: `${backlightIntensity * 100}%` }}
                                   ></div>
                               </div>
                               
                               {/* Thumb */}
                               <div 
                                 className="absolute w-8 h-4 bg-zinc-800 rounded shadow-[0_2px_5px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-zinc-600 flex items-center justify-center pointer-events-none transition-all duration-75"
                                 style={{ bottom: `calc(${backlightIntensity * 80}% + 5px)` }}
                               >
                                   <div className="w-6 h-[2px] bg-black/50"></div>
                                   {/* Glow dot on thumb */}
                                   <div className="absolute right-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_4px_rgba(255,0,0,0.8)] opacity-80"></div>
                               </div>
                               
                               {/* Vertical Range Input Overlay */}
                               <input 
                                   type="range"
                                   min="0"
                                   max="1"
                                   step="0.05"
                                   value={backlightIntensity}
                                   onChange={(e) => setBacklightIntensity(parseFloat(e.target.value))}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                                   style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                               />
                               {/* Fallback for input rotation if writing-mode fails on some browsers */}
                               <input 
                                   type="range"
                                   min="0"
                                   max="1"
                                   step="0.05"
                                   value={backlightIntensity}
                                   onChange={(e) => setBacklightIntensity(parseFloat(e.target.value))}
                                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-10 opacity-0 cursor-pointer -rotate-90"
                               />
                           </div>
                           <span className="text-[6px] font-bold text-red-900 tracking-widest uppercase rotate-90 origin-center translate-y-2">
                             {t('light')}
                           </span>
                       </div>
                   )}
              </div>

              <div className="absolute bottom-2 left-20 right-20 h-2 bg-white/10 rounded-full blur-sm"></div>
          </div>
          
          <div className="absolute -bottom-4 w-[650px] h-12 bg-black/40 blur-xl rounded-full z-0"></div>

      </div>
    </div>
  );
};

export default Typewriter;
