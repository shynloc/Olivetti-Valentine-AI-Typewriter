
import React, { useState } from 'react';
import { APIKeys } from '../types';
import { playPaperLoadSound, playSwitchSound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfidentialFolderProps {
  apiKeys: APIKeys;
  onSave: (keys: APIKeys) => void;
}

const ConfidentialFolder: React.FC<ConfidentialFolderProps> = ({ apiKeys, onSave }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [localKeys, setLocalKeys] = useState<APIKeys>(apiKeys);

  const toggleFolder = () => {
    playSwitchSound();
    setTimeout(() => {
      playPaperLoadSound();
      setIsOpen(!isOpen);
    }, 100);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localKeys);
    // Close animation
    setTimeout(() => {
        playPaperLoadSound();
        setIsOpen(false);
    }, 200);
  };

  return (
    <div className="absolute left-[2%] bottom-[10%] z-40 flex flex-col items-center perspective-1000 group">
      
      {/* The Settings Paper (Slides out of folder) */}
      <div 
        className={`
            absolute bottom-[20px] z-0 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) origin-bottom
            ${isOpen ? 'translate-y-[-320px] opacity-100 rotate-[-1deg]' : 'translate-y-0 opacity-0 rotate-0'}
        `}
      >
         <div className="w-80 bg-[#f4f4f0] paper-texture shadow-2xl border border-zinc-300 p-8 relative font-typewriter text-xs rotate-1">
             {/* Paper Clip */}
             <div className="absolute -top-3 right-6 w-4 h-10 border-2 border-zinc-400 rounded-full bg-transparent z-20"></div>

             <h3 className="font-bold text-center border-b-2 border-double border-black/20 pb-2 mb-6 text-zinc-800 tracking-widest uppercase">
                {t('classifiedConfig')}
             </h3>
             
             <form onSubmit={handleSave} className="flex flex-col gap-5">
                {/* Gemini Section */}
                <div className="relative p-4 bg-red-50/50 border border-red-100/50 rounded">
                    <label className="block mb-2 text-[10px] font-bold text-red-900/60 uppercase tracking-wider">
                        {t('geminiAccess')}
                    </label>
                    <input 
                        type="password" 
                        value={localKeys.gemini}
                        onChange={e => setLocalKeys({...localKeys, gemini: e.target.value})}
                        placeholder={t('enterKeyGemini')}
                        className="w-full bg-white border-b border-red-200 p-2 text-[10px] outline-none focus:border-red-500 placeholder-zinc-300 text-zinc-700"
                    />
                    <div className="text-[8px] text-zinc-400 mt-2 italic">
                        {localKeys.gemini ? t('uplinkActive') : t('uplinkDefault')}
                    </div>
                </div>

                {/* DeepSeek Section */}
                <div className="relative p-4 bg-blue-50/50 border border-blue-100/50 rounded">
                    <label className="block mb-2 text-[10px] font-bold text-blue-900/60 uppercase tracking-wider">
                        {t('deepseekProtocol')}
                    </label>
                    <input 
                        type="password" 
                        value={localKeys.deepseek}
                        onChange={e => setLocalKeys({...localKeys, deepseek: e.target.value})}
                        placeholder={t('enterKeyDeepseek')}
                        className="w-full bg-white border-b border-blue-200 p-2 text-[10px] outline-none focus:border-blue-500 placeholder-zinc-300 text-zinc-700 mb-3"
                    />
                    
                    {/* Replacement for buggy <select> */}
                    <div className="flex flex-col gap-2 border-t border-blue-200/50 pt-2">
                        <span className="text-[9px] font-bold text-zinc-500">{t('modelSelection')}:</span>
                        
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`
                                w-3 h-3 border border-zinc-400 flex items-center justify-center bg-white
                                group-hover:border-blue-500 transition-colors
                            `}>
                                {localKeys.deepSeekModel === 'deepseek-chat' && <div className="w-2 h-2 bg-zinc-800"></div>}
                            </div>
                            <input 
                                type="radio" 
                                name="deepseek_model"
                                checked={localKeys.deepSeekModel === 'deepseek-chat'}
                                onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-chat'})}
                                className="hidden"
                            />
                            <span className={`text-[10px] ${localKeys.deepSeekModel === 'deepseek-chat' ? 'font-bold text-zinc-800' : 'text-zinc-500'}`}>DEEPSEEK-V3 (CHAT)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`
                                w-3 h-3 border border-zinc-400 flex items-center justify-center bg-white
                                group-hover:border-blue-500 transition-colors
                            `}>
                                {localKeys.deepSeekModel === 'deepseek-reasoner' && <div className="w-2 h-2 bg-zinc-800"></div>}
                            </div>
                             <input 
                                type="radio" 
                                name="deepseek_model"
                                checked={localKeys.deepSeekModel === 'deepseek-reasoner'}
                                onChange={() => setLocalKeys({...localKeys, deepSeekModel: 'deepseek-reasoner'})}
                                className="hidden"
                            />
                            <span className={`text-[10px] ${localKeys.deepSeekModel === 'deepseek-reasoner' ? 'font-bold text-zinc-800' : 'text-zinc-500'}`}>DEEPSEEK-R1 (REASONER)</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="mt-2 bg-zinc-800 text-white py-3 text-[11px] tracking-[0.2em] hover:bg-red-800 transition-colors shadow-lg active:translate-y-0.5 font-bold">
                    {t('authorize')}
                </button>
             </form>
         </div>
      </div>

      {/* The Confidential Folder (Front) - Increased Size */}
      <div 
        className="relative w-96 h-64 z-20 cursor-pointer transition-transform duration-300 hover:scale-105 hover:-rotate-1"
        onClick={toggleFolder}
      >
          {/* Folder Tab */}
          <div className="absolute top-0 left-0 w-40 h-10 bg-[#e0d8b0] rounded-t-lg transform -translate-y-full border-t border-x border-[#c0b890]">
             <span className="absolute top-2 left-4 text-[10px] font-bold text-zinc-500/50 font-typewriter">{t('topSecret')}</span>
          </div>

          {/* Main Folder Body */}
          <div className={`
             relative w-full h-full bg-[#e8e0c5] rounded-r-lg rounded-bl-lg shadow-[5px_10px_20px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(0,0,0,0.05)]
             flex items-center justify-center border border-[#d0c8a0]
             transition-all duration-500 ease-out
             ${isOpen ? 'rotate-x-10 translate-y-4' : 'rotate-x-0 translate-y-0'}
          `}>
              {/* Texture */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] mix-blend-multiply rounded-lg pointer-events-none"></div>
              
              {/* Crease line near spine */}
              <div className="absolute left-8 top-2 bottom-2 w-[2px] bg-black/5 border-r border-white/20"></div>

              {/* CONFIDENTIAL STAMP - Decreased Size */}
              <div className="relative border-[4px] border-red-900/70 px-4 py-1 transform -rotate-12 mask-image-grunge opacity-80 mix-blend-multiply">
                  <span className="text-xl font-black text-red-900/80 font-serif tracking-[0.2em]">{t('confidential')}</span>
                  {/* Inner border line */}
                  <div className="absolute top-1 bottom-1 left-1 right-1 border border-red-900/50"></div>
              </div>
              
              {/* Smudge */}
              <div className="absolute bottom-10 right-10 w-20 h-20 bg-black/10 blur-xl rounded-full mix-blend-multiply"></div>
          </div>
      </div>

      {/* Shadow on Desk */}
      <div className="absolute bottom-[-20px] w-80 h-8 bg-black/40 blur-xl rounded-full z-0"></div>
    </div>
  );
};

export default ConfidentialFolder;
