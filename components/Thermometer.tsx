
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ThermometerProps {
  value: number; // 0 to 1
  onChange: (val: number) => void;
}

const Thermometer: React.FC<ThermometerProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  
  // State for Temperature Adjustment
  const [isAdjustingTemp, setIsAdjustingTemp] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // State for Component Dragging
  // Initial position changed to hover over the output tray area (bottom right)
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight * 0.5 });
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const textureStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='wood'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23wood)'/%3E%3C/svg%3E")`
  };

  // --- Temperature Adjustment Logic ---
  const handleInteraction = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const height = rect.height;
    const bottom = rect.bottom;
    
    // Calculate relative position from bottom (0 to 1)
    let newVal = (bottom - clientY) / height;
    
    // Clamp
    newVal = Math.max(0, Math.min(1, newVal));
    
    onChange(newVal);
  };

  const handleTempMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent component drag when adjusting temp
    setIsAdjustingTemp(true);
    handleInteraction(e.clientY);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isAdjustingTemp) {
        handleInteraction(e.clientY);
      }
    };

    const handleUp = () => {
      setIsAdjustingTemp(false);
    };

    if (isAdjustingTemp) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isAdjustingTemp]);

  // --- Component Dragging Logic ---
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    
    // Only start drag if we are not clicking on the temperature control
    // (Though stopPropagation in handleTempMouseDown should handle this, double check)
    
    e.preventDefault();
    
    setIsDraggingComponent(true);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
  };

  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (isDraggingComponent && componentRef.current) {
              let newX = e.clientX - dragOffset.current.x;
              let newY = e.clientY - dragOffset.current.y;

              // Boundary checks
              const width = componentRef.current.offsetWidth; 
              const height = componentRef.current.offsetHeight;
              
              newX = Math.max(0, Math.min(newX, window.innerWidth - width));
              newY = Math.max(0, Math.min(newY, window.innerHeight - height));

              setPosition({ x: newX, y: newY });
          }
      };
      
      const handleGlobalUp = () => {
          setIsDraggingComponent(false);
      };

      if (isDraggingComponent) {
          window.addEventListener('mousemove', handleGlobalMove);
          window.addEventListener('mouseup', handleGlobalUp);
      }
      
      return () => {
          window.removeEventListener('mousemove', handleGlobalMove);
          window.removeEventListener('mouseup', handleGlobalUp);
      };
  }, [isDraggingComponent]);

  // Visual scaling for the liquid height percentage
  const liquidHeight = `${value * 100}%`;

  return (
    <div 
        ref={componentRef}
        // Increased z-index to 120 to ensure it sits above PaperStack (z-100) and receives events
        className={`
            absolute z-[120] flex flex-col items-center select-none cursor-move 
            transition-transform duration-200
            ${isDraggingComponent ? 'scale-105 cursor-grabbing drop-shadow-2xl' : ''}
        `}
        style={{ 
            left: position.x, 
            top: position.y,
            // Disable layout transitions during drag for responsiveness
            transition: isDraggingComponent ? 'none' : 'box-shadow 0.2s, transform 0.2s'
        }}
        onMouseDown={handleDragStart}
    >
      {/* Wall Shadow - Adjusted to move with component */}
      <div className="absolute inset-0 translate-y-4 translate-x-4 bg-black/30 blur-md rounded-full pointer-events-none"></div>

      {/* Backing Plate (Wood/Plastic) */}
      <div className="relative w-14 h-64 bg-[#f0ebe0] rounded-full border border-zinc-300 shadow-lg flex justify-center py-4 overflow-hidden">
         
         {/* Texture overlay */}
         <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none" style={textureStyle}></div>
         
         {/* Mounting screw top */}
         <div className="absolute top-2 w-2 h-2 bg-zinc-400 rounded-full shadow-inner border border-zinc-500">
             <div className="absolute top-[40%] left-0 w-full h-[1px] bg-zinc-600 transform rotate-45"></div>
         </div>
         
         {/* Mounting screw bottom */}
         <div className="absolute bottom-2 w-2 h-2 bg-zinc-400 rounded-full shadow-inner border border-zinc-500">
              <div className="absolute top-[40%] left-0 w-full h-[1px] bg-zinc-600 transform rotate-12"></div>
         </div>

         {/* Scale Markings (Left Side) */}
         <div className="absolute left-1 top-8 bottom-8 w-4 flex flex-col justify-between items-end pr-1 font-sans text-[6px] text-zinc-600 font-bold pointer-events-none">
            <span>HOT</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>COLD</span>
         </div>

         {/* Scale Ticks (Right Side) */}
         <div className="absolute right-2 top-8 bottom-8 w-2 flex flex-col justify-between items-start border-l border-zinc-400/50 pointer-events-none">
             {Array.from({length: 21}).map((_, i) => (
                 <div key={i} className={`bg-zinc-500 ${i % 5 === 0 ? 'w-2 h-[1px]' : 'w-1 h-[0.5px]'}`}></div>
             ))}
         </div>

         {/* Glass Tube Container */}
         <div 
            className="relative w-3 h-[80%] mt-2 bg-zinc-200/50 rounded-full border border-zinc-300/50 shadow-inner cursor-ns-resize group z-20"
            ref={trackRef}
            onMouseDown={handleTempMouseDown}
            title={`${t('temperature')}: ${(value * 2).toFixed(1)}`}
         >
             {/* Glass Glare */}
             <div className="absolute left-[20%] top-0 bottom-0 w-[20%] bg-white/40 rounded-full z-20 pointer-events-none"></div>
             
             {/* Bulb at bottom */}
             <div className="absolute -bottom-3 -left-1.5 w-6 h-6 bg-red-600 rounded-full border border-red-800 shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.3)] z-10 pointer-events-none">
                  <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/30 rounded-full"></div>
             </div>

             {/* The Liquid (Mercury/Alcohol) */}
             <div 
                className="absolute bottom-0 left-0 right-0 bg-red-600 transition-all duration-100 ease-out pointer-events-none"
                style={{ height: liquidHeight }}
             >
                 {/* Meniscus */}
                 <div className="absolute -top-[2px] left-0 right-0 h-1 bg-red-500 rounded-full opacity-80"></div>
             </div>
         </div>
      </div>

      {/* Label Plate */}
      <div className="mt-2 bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-600 shadow-sm flex flex-col items-center pointer-events-none">
          <span className="text-[8px] font-bold tracking-widest">{t('temperature')}</span>
          <span className="text-[6px] text-zinc-400 uppercase">
              {value > 0.7 ? t('creative') : value < 0.3 ? t('precise') : 'BALANCED'}
          </span>
      </div>

    </div>
  );
};

export default Thermometer;