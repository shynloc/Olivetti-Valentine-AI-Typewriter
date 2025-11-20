
import React, { useState } from 'react';
import { APIKeys } from '../types';
import { playPaperLoadSound, playKeySound, playSwitchSound } from '../services/soundService';

interface DrawerProps {
  apiKeys: APIKeys;
  onSave: (keys: APIKeys) => void;
}

const Drawer: React.FC<DrawerProps> = ({ apiKeys, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localKeys, setLocalKeys] = useState<APIKeys>(apiKeys);

  const toggleDrawer = () => {
    playSwitchSound();
    // Slight delay for mechanical feel
    setTimeout(() => {
      playPaperLoadSound();
      setIsOpen(!isOpen);
    }, 50);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playKeySound();
    onSave(localKeys);
    // Close animation
    setTimeout(() => {
        playPaperLoadSound();
        setIsOpen(false);
    }, 200);
  };

  return (
    <div className="absolute left-[5%] top-[55%] z-40 flex flex-col items-center perspective-1000 group">
      
      {/* The Settings Paper (Pops out of drawer) */}
      <div 
        className={`
            absolute bottom-[90%] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isOpen ? 'translate-y-0 opacity-100 rotate-[-2deg]' : 'translate-y-[100%] opacity-0 rotate-0'}
        `}
        style={{ transformOrigin: 'bottom center' }}
      >
         <div className="w-64 bg-[#f4f4f0] paper-texture shadow-md border border-gray-200 p-6 relative font-typewriter text-xs">
             <h3 className="font-bold text-center border-b border-black/10 pb-2 mb-4 text-zinc-600 tracking-widest">CONFIGURATION</h3>
             
             <form onSubmit={handleSave} className="flex flex-col gap-3">
                <div>
                    <label className="block mb-1 text-[10px] font-bold text-zinc-500 uppercase">Gemini API Key</label>
                    <input 
                        type="password" 
                        value={localKeys.gemini}
                        onChange={e => setLocalKeys({...localKeys, gemini: e.target.value})}
                        placeholder="Default"
                        className="w-full bg-white border border-zinc-300 p-2 text-[10px] outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-[10px] font-bold text-zinc-500 uppercase">DeepSeek API Key</label>
                    <input 
                        type="password" 
                        value={localKeys.deepseek}
                        onChange={e => setLocalKeys({...localKeys, deepseek: e.target.value})}
                        placeholder="Required"
                        className="w-full bg-white border border-zinc-300 p-2 text-[10px] outline-none focus:border-red-500"
                    />
                </div>

                <button type="submit" className="mt-2 bg-zinc-800 text-white py-2 text-[10px] tracking-widest hover:bg-red-700 transition-colors">
                    SAVE SETTINGS
                </button>
             </form>
         </div>
      </div>

      {/* The Drawer Unit */}
      <div 
        className="relative w-72 h-24 z-20 cursor-pointer"
        onClick={toggleDrawer}
      >
          {/* Drawer Face */}
          <div className={`
             relative w-full h-full bg-zinc-800 rounded-lg shadow-[0_20px_30px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]
             flex items-center justify-center border-t border-zinc-700
             transition-transform duration-500 ease-out
             ${isOpen ? 'translate-y-[10px]' : 'translate-y-0 hover:-translate-y-1'}
          `}>
              {/* Wood/Metal Grain Texture Overlay */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] rounded-lg pointer-events-none"></div>

              {/* Handle */}
              <div className="w-32 h-4 bg-zinc-900 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <div className="w-28 h-1 bg-black/30 rounded-full"></div>
              </div>

              {/* Label Plate */}
              <div className="absolute bottom-3 right-4 w-12 h-6 bg-yellow-600/20 border border-yellow-600/30 rounded flex items-center justify-center">
                  <span className="text-[8px] text-yellow-600/60 font-mono tracking-widest">SETUP</span>
              </div>
          </div>

          {/* Drawer Sides (3D Effect when pulled) */}
          <div className={`
              absolute top-0 left-2 right-2 h-full bg-[#111] -z-10 transform origin-bottom
              transition-all duration-500
              ${isOpen ? 'scale-y-100 translate-y-[-10px] opacity-100' : 'scale-y-0 translate-y-0 opacity-0'}
          `}></div>
      </div>

      {/* Shadow on Desk */}
      <div className="absolute bottom-[-20px] w-64 h-4 bg-black/40 blur-md rounded-full z-0"></div>
    </div>
  );
};

export default Drawer;
