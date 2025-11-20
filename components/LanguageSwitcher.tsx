
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { playSwitchSound } from '../services/soundService';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'zh-CN', label: '简体' },
    { code: 'zh-TW', label: '繁體' },
    { code: 'ja', label: '日本語' },
  ];

  const handleSwitch = (code: Language) => {
    if (code !== language) {
      playSwitchSound();
      setLanguage(code);
    }
  };

  return (
    <div className="absolute top-6 right-6 z-50 flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSwitch(lang.code)}
          className={`
            px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border
            ${language === lang.code 
              ? 'bg-red-900 text-white border-red-800 shadow-[0_2px_5px_rgba(0,0,0,0.3)]' 
              : 'bg-black/20 text-white/50 border-transparent hover:bg-black/40 hover:text-white'}
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
