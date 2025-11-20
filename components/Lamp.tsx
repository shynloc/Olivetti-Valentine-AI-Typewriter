
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LampProps {
  isOn: boolean;
  onToggle: () => void;
}

const Lamp: React.FC<LampProps> = ({ isOn, onToggle }) => {
  const [isPulling, setIsPulling] = useState(false);
  const { t } = useLanguage();

  const handlePull = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPulling(true);
    onToggle();
    setTimeout(() => setIsPulling(false), 200);
  };

  return (
    <div className="absolute left-[-100px] top-[-50px] z-20 flex flex-col items-center transform scale-[2.4] origin-top-left pointer-events-auto">
      {/* Lamp Shade Group */}
      <div className="relative group">
        
        {/* The actual light bulb glow effect (behind the bulb) */}
        <div 
          className={`absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full transition-all duration-700 pointer-events-none
            ${isOn ? 'bg-yellow-200/20 shadow-lamp-glow-intense' : 'opacity-0'}
          `}
        />

        {/* Lamp Head/Shade */}
        <div className={`
            w-40 h-32 bg-zinc-800 rounded-t-full rounded-b-lg shadow-2xl relative z-10
            border-b-4 border-zinc-900 transition-colors duration-500
            ${isOn ? 'bg-zinc-700' : 'bg-zinc-800'}
        `}>
           <div className="absolute inset-0 rounded-t-full bg-gradient-to-br from-white/10 to-black/40 pointer-events-none"></div>
        </div>

        {/* Bulb */}
        <div className={`
            absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-16 h-12 rounded-b-full z-0 transition-all duration-300
            ${isOn ? 'bg-yellow-100 shadow-[0_0_20px_rgba(255,255,200,1)]' : 'bg-gray-400/30'}
        `}></div>

        {/* Pull String Switch - Moved to the LEFT side and hanging down visibly */}
        <div 
            className="absolute top-24 left-14 z-0 cursor-pointer flex flex-col items-center origin-top group/string"
            onClick={handlePull}
            style={{
                 transform: isPulling ? 'translateY(10px)' : 'translateY(0)',
                 transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
        >
            {/* The String */}
            <div className="w-[1.5px] h-16 bg-zinc-400/80 shadow-[1px_0_2px_rgba(0,0,0,0.5)] origin-top"></div>
            
            {/* The Knob */}
            <div className="w-3 h-4 bg-[#e0e0d0] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(0,0,0,0.2)] -mt-1 relative z-10 group-hover/string:bg-white transition-colors border border-zinc-400"></div>
        </div>
      </div>

      {/* Neck / Arm */}
      <div className="w-4 h-40 bg-zinc-900 -mt-2 relative z-0 shadow-lg">
         <div className="absolute left-0 top-0 w-1 h-full bg-white/10"></div>
      </div>

      {/* Base */}
      <div className="w-32 h-8 bg-zinc-800 rounded-full -mt-2 shadow-xl border-t border-zinc-700 relative z-10">
        <div className="absolute top-1 left-10 right-10 h-4 bg-black/20 rounded-full blur-sm"></div>
      </div>
      
      {/* Click hint (only if off) */}
      <div className={`absolute -bottom-10 left-14 text-[8px] font-typewriter text-white/40 transition-opacity duration-500 ${isOn ? 'opacity-0' : 'opacity-100'}`}>
        {t('pullToStart')}
      </div>
    </div>
  );
};

export default Lamp;
