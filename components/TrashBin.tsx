
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TrashBinProps {
  count: number;
  onClick: () => void;
}

const TrashBin: React.FC<TrashBinProps> = ({ count, onClick }) => {
  const { t } = useLanguage();

  return (
    <div 
        className="absolute right-[8%] bottom-[5%] group cursor-pointer z-10 scale-110"
        style={{ perspective: '1000px' }}
        onClick={onClick}
        title={`${t('trashBin')} - Click to restore items`}
    >
      {/* Container for rotation */}
      <div className="relative w-40 h-48 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 transform-style-3d rotate-x-10">
        
        {/* --- BACK OF CYLINDER (Inside Mesh) --- */}
        <div className="absolute top-0 left-0 w-full h-full rounded-b-[50px] bg-zinc-800"
             style={{
                 boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9)',
                 transform: 'translateZ(-1px)'
             }}
        >
            {/* Inner Mesh Texture */}
            <div className="absolute inset-0 rounded-b-[50px] opacity-30"
                 style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 4px, #000 5px),
                        repeating-linear-gradient(90deg, transparent, transparent 4px, #000 5px)
                    `
                 }}
            ></div>
        </div>

        {/* --- TRASH CONTENTS (Paper Balls) --- */}
        <div className="absolute bottom-6 left-4 right-4 h-36 flex items-end justify-center content-end z-10 pointer-events-none">
             {Array.from({ length: Math.min(count, 20) }).map((_, i) => {
                const rot = (i * 137.5) % 360; // Golden angle for natural scattering
                const x = ((i * 19) % 50) - 25;
                const y = ((i * 7) % 20) * -1;
                return (
                    <div 
                        key={i}
                        className="absolute w-10 h-10 drop-shadow-xl"
                        style={{
                            bottom: `${(i * 3)}px`,
                            left: `calc(50% + ${x}px)`,
                            transform: `rotate(${rot}deg) translateY(${y}px) scale(${0.8 + (i%5)*0.1})`,
                            zIndex: i
                        }}
                    >
                        {/* Realistic Crumpled Paper Ball SVG */}
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                            <defs>
                                <radialGradient id={`ballGrad-${i}`} cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="40%" stopColor="#f0f0e8" />
                                    <stop offset="90%" stopColor="#d0d0c0" />
                                    <stop offset="100%" stopColor="#a0a090" />
                                </radialGradient>
                                <filter id={`shadow-${i}`}>
                                    <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
                                </filter>
                            </defs>
                            <g filter={`url(#shadow-${i})`}>
                                {/* Irregular Ball Shape */}
                                <path 
                                    d="M50,5 C65,2 85,10 90,30 C98,50 95,75 80,90 C60,98 35,95 15,80 C2,60 5,30 25,10 C35,5 40,8 50,5 Z" 
                                    fill={`url(#ballGrad-${i})`}
                                    stroke="#e0e0d0"
                                    strokeWidth="0.5"
                                />
                                {/* Crease Lines (Simulating folds) */}
                                <path d="M30,25 Q45,35 60,20 M20,50 Q40,60 30,80 M60,50 Q70,70 85,60 M50,40 L70,50 M35,60 L55,70" 
                                      fill="none" 
                                      stroke="rgba(0,0,0,0.15)" 
                                      strokeWidth="1.5" 
                                      strokeLinecap="round"
                                />
                                <path d="M25,40 L45,45 L40,65" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                                <path d="M70,30 L65,45 L80,50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                            </g>
                        </svg>
                    </div>
                );
            })}
            {count > 20 && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md border border-red-800 z-50 animate-bounce">
                    +{count - 20}
                </div>
            )}
        </div>

        {/* --- FRONT OF CYLINDER (Mesh Overlay) --- */}
        <div className="absolute top-0 left-0 w-full h-full rounded-b-[50px] z-20 pointer-events-none border-x border-zinc-600/50"
             style={{
                 background: `
                    repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 4px),
                    repeating-linear-gradient(-45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 4px)
                 `,
                 boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1), 5px 10px 20px rgba(0,0,0,0.5)'
             }}
        >
            {/* Vertical Ribs */}
            <div className="absolute left-1/4 top-0 bottom-4 w-[1px] bg-zinc-500/30"></div>
            <div className="absolute right-1/4 top-0 bottom-4 w-[1px] bg-zinc-500/30"></div>
            <div className="absolute left-1/2 top-0 bottom-4 w-[1px] bg-zinc-500/30"></div>
        </div>

        {/* --- TOP RIM (3D Ring) --- */}
        <div className="absolute -top-3 left-0 w-full h-8 z-30">
             {/* Outer Ring Metal */}
             <div className="absolute inset-0 rounded-[50%] bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 shadow-md border border-zinc-400"></div>
             {/* Inner Hole (Darkness) */}
             <div className="absolute top-1 left-1 right-1 bottom-1 bg-[#1a1a1a] rounded-[50%] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]"></div>
        </div>

        {/* --- BOTTOM RIM (Base) --- */}
        <div className="absolute -bottom-2 left-2 right-2 h-6 bg-zinc-600 rounded-[50%] shadow-lg z-0"></div>
      </div>
      
      {/* Floor Shadow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/60 blur-xl rounded-[50%] z-[-1]"></div>
    </div>
  );
};

export default TrashBin;
