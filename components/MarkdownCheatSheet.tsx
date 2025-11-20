
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const MarkdownCheatSheet: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="absolute bottom-[5%] left-[35%] z-0 pointer-events-none transform -rotate-2 opacity-90">
      <div className="relative w-56 h-48 bg-[#f4f4f0] paper-texture shadow-md p-4 rotate-3 border border-gray-300/50 rounded-sm">
         {/* Pin */}
         <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-800 shadow-sm z-10"></div>
         
         <div className="font-handwriting text-zinc-700 text-lg leading-tight">
            <h3 className="text-xl font-bold border-b border-zinc-400/30 mb-2 pb-1 text-center">{t('syntaxGuide')}</h3>
            <ul className="space-y-1">
                <li># {t('header')}</li>
                <li>**{t('bold')}**</li>
                <li>*{t('italic')}*</li>
                <li>- {t('listItem')}</li>
                <li>1. {t('orderedList')}</li>
                <li>&gt; {t('blockquote')}</li>
            </ul>
            <div className="mt-3 text-right opacity-60 text-sm">
                ~ {t('notes')}
            </div>
         </div>
         
         {/* Tape effect */}
         <div className="absolute -top-3 left-10 w-12 h-6 bg-white/40 backdrop-blur-[1px] rotate-[-5deg] shadow-sm"></div>
      </div>
    </div>
  );
};

export default MarkdownCheatSheet;
