
import React, { useState, useEffect, useRef } from 'react';
import { PaperSheet, APIKeys } from '../types';
import { playCrumpleSound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

// Declare html2canvas and marked globals
declare const html2canvas: any;
declare const marked: any;

interface PaperStackProps {
  sheets: PaperSheet[];
  onOpenGrid: () => void;
  onDelete?: (id: string) => void;
  nickname: string; // User nickname for watermark
}

const PaperStack: React.FC<PaperStackProps> = ({ sheets, onOpenGrid, onDelete, nickname }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedId, setZoomedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Reset active index when new sheet is added
  useEffect(() => {
    if (sheets.length > 0) {
      setActiveIndex(sheets.length - 1);
    }
  }, [sheets.length]);

  const handleWheel = (e: React.WheelEvent) => {
    if (sheets.length <= 1) return;
    
    if (e.deltaY > 0) {
      setActiveIndex(prev => (prev + 1) % sheets.length);
    } else {
      setActiveIndex(prev => (prev - 1 + sheets.length) % sheets.length);
    }
  };

  const handleZoomWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (sheets.length <= 1) return;
    const currentSheet = sheets.find(s => s.id === zoomedId);
    if (!currentSheet) return;
    const currentIdx = sheets.indexOf(currentSheet);
    let newIdx;
    if (e.deltaY > 0) {
         newIdx = (currentIdx + 1) % sheets.length;
    } else {
         newIdx = (currentIdx - 1 + sheets.length) % sheets.length;
    }
    setZoomedId(sheets[newIdx].id);
  };

  const downloadMarkdown = (sheet: PaperSheet) => {
    if (sheet.type === 'image') return; // Images don't download as MD
    
    const text = sheet.content.join('\n');
        
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valentine-note-${sheet.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadImage = async (sheet: PaperSheet) => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, 
        backgroundColor: null,
        useCORS: true,
        allowTaint: true
      });
      
      const image = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = image;
      a.download = `valentine-${sheet.type === 'image' ? 'photo' : 'scan'}-${sheet.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  const handleDelete = (id: string) => {
      setDeletingId(id);
      playCrumpleSound();
      setTimeout(() => {
          if (onDelete) onDelete(id);
          setDeletingId(null);
          setZoomedId(null);
      }, 500); 
  };

  const getRenderedMarkdown = (content: string[]) => {
      try {
          return marked.parse(content.join('\n'));
      } catch (e) {
          return content.join('<br/>');
      }
  };

  const woodTextureStyle = {
    backgroundColor: '#3e2723',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
  };

  const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  const zoomedSheet = zoomedId ? sheets.find(s => s.id === zoomedId) : null;

  // Updated 90s Lo-fi Aesthetic Filter - High Saturation
  const vintageFilterStyle = {
      filter: 'contrast(1.1) brightness(0.95) saturate(1.5) sepia(0.2) hue-rotate(-5deg) blur(0.5px)'
  };
  
  const lightLeakOverlay = {
      background: 'linear-gradient(45deg, rgba(255,100,50,0.1) 0%, transparent 20%, transparent 80%, rgba(255,200,100,0.15) 100%)',
      mixBlendMode: 'screen' as const
  };

  return (
    <>
      {/* --- TRAY BACKGROUND LAYER --- */}
      <div className="absolute right-[2%] top-[45%] w-80 h-96 perspective-1000 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#2d1e1a] shadow-inner rounded-sm" style={woodTextureStyle}></div>
        <div className="absolute top-0 left-0 right-0 h-5 bg-[#4e342e] shadow-md origin-top transform rotate-x-90"></div>
        <div className="absolute top-0 bottom-0 left-0 w-5 bg-[#3e2723] shadow-md border-r border-[#5d4037]"></div>
        <div className="absolute top-0 bottom-0 right-0 w-5 bg-[#3e2723] shadow-md border-l border-[#5d4037]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#5d4037] shadow-lg border-t border-[#795548]"></div>
        <div className="absolute inset-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none rounded-sm z-10"></div>
      </div>

      {/* --- INTERACTIVE STACK LAYER --- */}
      <div className="absolute right-[2%] top-[45%] w-80 h-96 z-10">
        
        {sheets.length > 0 && (
           <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onOpenGrid();
             }}
             className="absolute -bottom-6 right-4 z-50 bg-zinc-800 hover:bg-red-900 text-white/90 text-[11px] font-serif uppercase tracking-widest px-6 py-2 rounded shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-black/50 transform hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-inner cursor-pointer"
           >
             {t('spreadOut')}
           </button>
        )}

        <div 
          className="absolute inset-0 pl-4 pt-4 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
        >
           {sheets.map((sheet, index) => {
            const isActive = index === activeIndex;
            const dist = (index - activeIndex + sheets.length) % sheets.length;
            
            if (dist > 4 && !isActive) return null;

            const rotation = (index * 33 % 6) - 3; 
            const zIndex = isActive ? 100 : 10 - dist;
            const opacity = isActive ? 1 : 0.8 - (dist * 0.15);
            const translateY = isActive ? 0 : dist * 5;
            const translateX = isActive ? 0 : dist * 2;

            const isImage = sheet.type === 'image';

            return (
              <div
                key={sheet.id}
                onClick={() => setZoomedId(sheet.id)}
                className={`
                  absolute top-0 left-0 w-[90%] h-[90%] 
                  ${isImage ? 'bg-white p-3 pb-8 border border-gray-300' : 'bg-paper-white paper-texture p-6 border border-gray-200/50'}
                  shadow-md transition-all duration-300 ease-out font-typewriter text-[10px] text-zinc-800 overflow-hidden
                  hover:shadow-xl leading-relaxed cursor-pointer group-hover:scale-[1.02] markdown-content
                `}
                style={{
                  transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px) scale(${isActive ? 1.05 : 1})`,
                  zIndex: zIndex,
                  opacity: opacity
                }}
              >
                {isImage ? (
                    // POLAROID THUMBNAIL PREVIEW
                    <div className="flex flex-col h-full w-full">
                        <div className="flex-1 bg-zinc-100 overflow-hidden relative mb-1 border border-gray-100 shadow-inner">
                            <div className="relative w-full h-full">
                                <img 
                                    src={sheet.content[0]} 
                                    className="w-full h-full object-cover relative z-0"
                                    style={vintageFilterStyle}
                                    alt="Polaroid" 
                                />
                                {/* Light Leak Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none" style={lightLeakOverlay}></div>
                                {/* Grain */}
                                <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-20" style={{ backgroundImage: noiseTexture }}></div>
                            </div>
                            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none z-30"></div>
                        </div>
                         {/* Thumbnail Watermark - Simplified */}
                         <div className="text-[10px] font-handwriting font-bold text-[#2a2a2a] opacity-80 text-center -mb-1 truncate px-1 -rotate-1" style={{ mixBlendMode: 'multiply' }}>
                            {nickname || 'User'}
                         </div>
                    </div>
                ) : (
                    // TEXT THUMBNAIL PREVIEW
                    <>
                        <div 
                            className="whitespace-pre-wrap break-words opacity-60 mb-1"
                            dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(sheet.content) }}
                        />
                        <div className="absolute bottom-2 right-2 opacity-30 text-[6px] border-t border-black/10 pt-1">ID: {sheet.id.toUpperCase()}</div>
                    </>
                )}
              </div>
            );
          })}

           {sheets.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-white/20 font-typewriter text-xs pointer-events-none">
                  {t('trayEmpty')}
               </div>
           )}
        </div>
      </div>

      {/* Zoomed Lightbox Modal */}
      {zoomedSheet && (
        <div 
            className={`
                fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm 
                transition-opacity duration-300
                ${deletingId === zoomedSheet.id ? 'opacity-0 pointer-events-none' : 'animate-in fade-in opacity-100'}
            `}
            onWheel={handleZoomWheel}
        >
           
           <div className="absolute inset-0 cursor-pointer" onClick={() => setZoomedId(null)}>
                <div className="absolute top-8 right-8 text-white/30 text-sm font-typewriter">
                    {t('scrollToFlip')}
                </div>
           </div>
           
           <div 
                ref={printRef} 
                className={`
                    relative bg-paper-white paper-texture shadow-2xl font-typewriter text-[18px] leading-relaxed text-zinc-900 overflow-y-auto rounded-sm 
                    transition-all duration-500 ease-in-out transform origin-center markdown-content
                    ${deletingId === zoomedSheet.id ? 'scale-0 rotate-[720deg] opacity-0' : 'scale-100 rotate-0'}
                    ${zoomedSheet.type === 'image' ? 'w-[600px] h-[720px] p-6 pb-16 bg-white' : 'w-[850px] min-h-[1100px] max-h-[90vh] p-16'}
                `}
            >
               {zoomedSheet.type === 'image' ? (
                   // POLAROID ZOOM VIEW
                   <div className="flex flex-col h-full w-full bg-white">
                        {/* Image Area - Square */}
                        <div className="aspect-square w-full bg-zinc-100 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.15)] border border-gray-200">
                            <img 
                                src={zoomedSheet.content[0]} 
                                className="w-full h-full object-cover relative z-0"
                                style={vintageFilterStyle}
                                alt="Polaroid" 
                            />
                            {/* Light Leak Overlay */}
                            <div className="absolute inset-0 z-10 pointer-events-none" style={lightLeakOverlay}></div>
                            {/* Gloss Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay z-20"></div>
                            {/* Grain */}
                             <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-30" style={{ backgroundImage: noiseTexture }}></div>
                        </div>
                        
                        {/* Caption / Frame Bottom */}
                        <div className="flex-1 flex flex-col items-center justify-center pt-6 relative">
                             {/* Enhanced Hand-written Watermark */}
                             <div 
                                className="font-handwriting font-bold text-5xl text-[#2a2a2a] opacity-85 transform -rotate-2 mb-2 tracking-wide"
                                style={{ 
                                  textShadow: '0px 0px 1px rgba(0,0,0,0.1)', 
                                  mixBlendMode: 'multiply',
                                  filter: 'blur(0.2px)'
                                }}
                             >
                                {nickname || 'User'}
                             </div>
                             
                             {/* Subtitle/Prompt */}
                             <div className="text-xs text-zinc-400 font-sans tracking-widest uppercase max-w-[90%] truncate opacity-60">{zoomedSheet.content[1]}</div>
                             
                             {/* Embossed Tech Specs */}
                             <div className="absolute bottom-0 right-0 text-[8px] text-zinc-200 font-sans font-bold uppercase tracking-[0.2em] opacity-80 select-none">
                                 Polaroid I-2 • AI Print
                             </div>
                        </div>
                   </div>
               ) : (
                   // STANDARD TEXT PAPER
                   <>
                       <div className="min-h-[800px]">
                            <div 
                                className="whitespace-pre-wrap break-words mb-1"
                                dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(zoomedSheet.content) }}
                            />
                       </div>
                      
                      <div className="mt-16 pt-8 border-t-2 border-zinc-200 flex justify-between items-end opacity-60">
                         <div className="text-xs leading-relaxed font-typewriter text-zinc-500">
                            <span className="uppercase tracking-wider">{t('archived')}</span>: {new Date(zoomedSheet.timestamp).toLocaleDateString()}
                            <br/>
                            <span className="uppercase tracking-wider">{t('ref')}</span>: {zoomedSheet.id}
                         </div>
                         <div className="font-serif italic text-lg text-zinc-600">Olivetti Valentine AI</div>
                      </div>
                   </>
               )}
           </div>

           {/* Actions Bar */}
           <div className="relative z-50 mt-6 flex gap-4">
               {zoomedSheet.type !== 'image' && (
                   <button 
                      onClick={() => downloadMarkdown(zoomedSheet)}
                      className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                      title={t('downloadMd')}
                   >
                      <span className="material-icons">description</span>
                      <span className="text-sm font-medium">MD</span>
                   </button>
               )}
               
               <button 
                  onClick={() => downloadImage(zoomedSheet)}
                  className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                  title={t('downloadPng')}
               >
                  <span className="material-icons">image</span>
                  <span className="text-sm font-medium">PNG</span>
               </button>

               <button 
                  onClick={() => handleDelete(zoomedSheet.id)}
                  className="group flex items-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-red-100 px-6 py-3 rounded-full transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                  title={t('moveToTrash')}
               >
                  <span className="material-icons">delete</span>
                  <span className="text-sm font-medium">{t('trash')}</span>
               </button>
               
               <button 
                  onClick={() => setZoomedId(null)}
                  className="bg-transparent hover:bg-white/10 text-white/50 hover:text-white p-3 rounded-full transition-all"
               >
                  <span className="material-icons">close</span>
               </button>
           </div>

           {/* Pagination Dots */}
           <div className="absolute bottom-10 flex gap-2">
               {sheets.map(s => (
                   <div 
                     key={s.id} 
                     className={`w-2 h-2 rounded-full transition-all ${s.id === zoomedId ? 'bg-white scale-125' : 'bg-white/20'}`}
                   />
               ))}
           </div>

        </div>
      )}
    </>
  );
};

export default PaperStack;
