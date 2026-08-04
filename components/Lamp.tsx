
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LampType } from '../types';

interface LampProps {
  isOn: boolean;
  onToggle: () => void;
  type?: LampType;
}

const Lamp: React.FC<LampProps> = ({ isOn, onToggle, type = 'industrial' }) => {
  const [isPulling, setIsPulling] = useState(false);
  const { t } = useLanguage();

  // Dragging State
  // Initial position matches the previous CSS layout (approx left -100, top -50)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);

  const handlePull = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop drag start
    setIsPulling(true);
    onToggle();
    setTimeout(() => setIsPulling(false), 200);
  };

  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
      // Prevent drag if clicking the pull string (handled by stopPropagation above, but safety check)
      if ((e.target as HTMLElement).closest('.group\\/string')) return;
      
      if (e.button !== 0) return;
      e.preventDefault();
      
      isDown.current = true;
      
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      // Since the component is scaled, we need to handle coordinates carefully.
      // However, we are moving the container's left/top, so clientX/Y deltas work best.
      dragOffset.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
      };
  };

  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (!isDown.current) return;
          
          if (!isDragging) setIsDragging(true);

          let newX = e.clientX - dragOffset.current.x;
          let newY = e.clientY - dragOffset.current.y;
          
          // Relaxed boundaries for the lamp to allow it to be placed "off desk" slightly
          setPosition({ x: newX, y: newY });
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
  }, [isDragging, position.x, position.y]);

  // --- STYLE CONFIGURATIONS ---
  const isBanker = type === 'banker';
  const isPixar = type === 'pixar';
  const isRetro = type === 'retro';
  const isModern = type === 'modern';
  
  // Specific Glow Styles
  const getGlowStyle = () => {
      if (isBanker) {
          return {
              background: 'radial-gradient(ellipse at center, rgba(100, 255, 100, 0.4) 0%, rgba(253, 224, 71, 0.2) 40%, transparent 70%)',
              top: '120px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px'
          };
      }
      if (isRetro) {
          return {
              background: 'radial-gradient(circle, rgba(255, 160, 50, 0.6) 0%, rgba(255, 100, 50, 0.1) 60%, transparent 70%)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px'
          };
      }
      if (isModern) {
          return {
              background: 'linear-gradient(to bottom, rgba(200, 220, 255, 0.5) 0%, transparent 80%)',
              top: '40px', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '200px', borderRadius: '20px'
          };
      }
      // Default / Industrial / Pixar
      return {
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.5) 0%, transparent 70%)',
          top: '80px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px'
      };
  };

  return (
    <div 
        ref={componentRef}
        // z-[110] places it above Typewriter(30) and PaperStack(10) but below Thermometer(120), Folder(150), and Overlays(200)
        className={`
            absolute z-[110] flex flex-col items-center transform scale-[2.4] origin-top-left 
            ${isDragging ? 'cursor-grabbing' : 'cursor-move'}
            select-none
        `}
        style={{ 
            left: -100 + position.x,
            top: -50 + position.y,
            transition: isDragging ? 'none' : 'transform 0.1s' 
        }}
        onMouseDown={handleMouseDown}
    >
      
      {/* --- LIGHT EMISSION (GLOW) --- */}
      {/* pointer-events-none is CRITICAL to ensure the glow doesn't block clicks on underlying layers */}
      <div 
        className="absolute transition-opacity duration-700 pointer-events-none mix-blend-screen z-0"
        style={{ 
            ...getGlowStyle(),
            opacity: isOn ? 1 : 0
        }}
      />

      {/* --- LAMP HEAD STRUCTURE --- */}
      <div className="relative group flex justify-center z-20">
        
        {/* 1. BANKER'S LAMP SHADE */}
        {isBanker && (
            <div className={`
                relative w-48 h-20 rounded-t-lg z-20 transition-colors duration-500 overflow-hidden
                shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_-5px_10px_rgba(0,0,0,0.5)]
                ${isOn ? 'bg-emerald-500' : 'bg-emerald-900'}
            `}>
                {/* Glass Gradient simulating cylinder */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>
                {/* Glossy Highlight */}
                <div className="absolute top-2 left-4 right-4 h-3 bg-white/20 rounded-full blur-[2px]"></div>
                
                {/* Brass End Caps */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-12 bg-yellow-600 rounded-r-md border-l border-yellow-800 shadow-md"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-12 bg-yellow-600 rounded-l-md border-r border-yellow-800 shadow-md"></div>
            </div>
        )}

        {/* 2. PIXAR / INDUSTRIAL CONE */}
        {(isPixar || type === 'industrial') && (
            <div className={`
                relative w-40 h-32 rounded-t-[80px] rounded-b-[20px] z-20 transition-colors duration-500
                flex items-end justify-center shadow-xl
                ${isPixar 
                    ? (isOn ? 'bg-slate-200' : 'bg-slate-300') 
                    : (isOn ? 'bg-zinc-700' : 'bg-zinc-800')}
            `}>
                {/* Rim */}
                <div className={`absolute bottom-0 w-[105%] h-4 rounded-full border-t border-black/10 ${isPixar ? 'bg-slate-400' : 'bg-zinc-900'}`}></div>
                {/* Top Cap */}
                <div className={`absolute -top-3 w-10 h-6 rounded-t-lg ${isPixar ? 'bg-slate-400' : 'bg-zinc-900'} shadow-sm`}></div>
            </div>
        )}

        {/* 3. RETRO SPHERE */}
        {isRetro && (
            <div className={`
                relative w-40 h-40 rounded-full z-20 transition-colors duration-500
                shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_-10px_20px_rgba(0,0,0,0.5)]
                ${isOn ? 'bg-orange-500' : 'bg-orange-700'}
                border-4 border-[#222] overflow-hidden
            `}>
                {/* Plastic Specular Highlight */}
                <div className="absolute top-6 left-8 w-12 h-8 bg-white/40 rounded-full blur-sm rotate-[-30deg]"></div>
                {/* Inner Glow */}
                <div className={`absolute inset-0 bg-radial-gradient from-yellow-300/50 to-transparent transition-opacity ${isOn ? 'opacity-100' : 'opacity-0'}`}></div>
                {/* Cutout bottom */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-20 bg-black/30 blur-md rounded-full"></div>
            </div>
        )}

        {/* 4. MODERN LED BAR */}
        {isModern && (
            <div className={`
                relative w-56 h-4 rounded-full z-20 transition-colors duration-500
                shadow-lg flex items-center justify-center
                ${isOn ? 'bg-zinc-800' : 'bg-black'}
                border border-zinc-700
            `}>
                {/* The LED Strip */}
                <div className={`
                    w-[90%] h-[2px] rounded-full transition-all duration-300
                    ${isOn ? 'bg-blue-100 shadow-[0_0_10px_#bfdbfe]' : 'bg-zinc-900'}
                `}></div>
            </div>
        )}

        {/* --- BULB (Inside Shade) --- */}
        {/* Only visible for styles with open bottoms */}
        {!isRetro && !isModern && (
            <div className={`
                absolute z-10 transition-all duration-300
                ${isBanker ? 'top-10 w-32 h-8 rounded-full' : 'bottom-[-10px] w-16 h-16 rounded-full'}
                ${isOn ? 'bg-[#fffeb0] shadow-[0_0_20px_#fffeb0]' : 'bg-gray-400/20'}
            `}></div>
        )}

        {/* --- PULL STRING SWITCH --- */}
        <div 
            className="absolute z-10 cursor-pointer flex flex-col items-center origin-top group/string"
            style={{
                 top: isBanker ? '60px' : isModern ? '10px' : '90%', 
                 left: isBanker ? '20px' : isPixar ? '30px' : '40px',
                 transform: isPulling ? 'translateY(15px)' : 'translateY(0)',
                 transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={handlePull}
            onMouseDown={(e) => e.stopPropagation()} // Extra safety to prevent dragging when clicking string
        >
            <div className={`w-[1px] ${isModern ? 'h-32' : 'h-16'} ${isBanker ? 'bg-yellow-600' : 'bg-zinc-400'} shadow-sm`}></div>
            <div className={`
                w-3 h-3 rounded-full -mt-[1px] shadow-md transition-colors
                ${isBanker ? 'bg-yellow-500 ring-1 ring-yellow-700' : 'bg-zinc-300 ring-1 ring-zinc-400'}
                group-hover/string:bg-white
            `}></div>
        </div>

      </div>

      {/* --- NECK --- */}
      <div className={`relative z-10 -mt-2 flex flex-col items-center`}>
          {isBanker && (
              <div className="w-2 h-32 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-600 shadow-lg"></div>
          )}
          
          {isPixar && (
              <div className="relative w-4 h-36 bg-slate-300 border-x border-slate-400 shadow-md flex flex-col justify-between py-4 items-center">
                  {/* Springs */}
                  <div className="absolute -left-2 top-4 w-2 h-16 border-l-2 border-dashed border-zinc-500 opacity-50"></div>
                  <div className="absolute -right-2 top-4 w-2 h-16 border-r-2 border-dashed border-zinc-500 opacity-50"></div>
                  {/* Joint */}
                  <div className="w-6 h-6 rounded-full bg-slate-400 border border-slate-500 shadow-sm z-20"></div>
              </div>
          )}

          {(type === 'industrial' || isRetro) && (
              <div className={`
                  w-4 h-32 shadow-lg
                  ${isRetro ? 'bg-zinc-800' : 'bg-zinc-900'}
              `}>
                  {/* Flexible gooseneck ribs */}
                  <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_3px)]"></div>
              </div>
          )}

          {isModern && (
              <div className="w-1 h-40 bg-zinc-800 shadow-sm opacity-80"></div>
          )}
      </div>

      {/* --- BASE --- */}
      <div className="relative z-20 -mt-2">
          
          {isBanker && (
              <div className="w-32 h-8 rounded-[50%] bg-gradient-to-r from-yellow-800 via-yellow-500 to-yellow-800 shadow-[0_5px_10px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.4)] border border-yellow-900"></div>
          )}

          {isPixar && (
              <div className="w-36 h-8 rounded-[40%] bg-slate-300 shadow-[0_5px_15px_rgba(0,0,0,0.4)] border-t border-white relative">
                  <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-12 h-6 bg-slate-400 rounded-full"></div>
              </div>
          )}

          {isRetro && (
              <div className="w-32 h-12 rounded-t-full bg-orange-700 shadow-lg border-t border-orange-600"></div>
          )}

          {isModern && (
              <div className="w-24 h-2 bg-zinc-900 shadow-md"></div>
          )}

          {type === 'industrial' && (
              <div className="w-32 h-8 rounded-full bg-zinc-800 border-t border-zinc-600 shadow-xl"></div>
          )}
      </div>

      {/* Click/Drag hint */}
      <div className={`absolute -bottom-10 left-10 text-[8px] font-typewriter text-white/40 transition-opacity duration-500 whitespace-nowrap ${isOn ? 'opacity-0' : 'opacity-100'}`}>
        {t('pullToStart')}
      </div>
    </div>
  );
};

export default Lamp;
