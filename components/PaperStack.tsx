
import React, { useState, useEffect, useRef } from 'react';
import { PaperSheet } from '../types';
import { playCrumpleSound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

// Declare html2canvas and marked globals
declare const html2canvas: any;
declare const marked: any;

interface PaperStackProps {
  sheets: PaperSheet[];
  onOpenGrid: () => void;
  onDelete?: (id: string) => void;
}

const PaperStack: React.FC<PaperStackProps> = ({ sheets, onOpenGrid, onDelete }) => {
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
    // Content is already stored as raw text lines for Markdown
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
      });
      
      const image = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = image;
      a.download = `valentine-scan-${sheet.id}.png`;
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

  const zoomedSheet = zoomedId ? sheets.find(s => s.id === zoomedId) : null;

  return (
    <>
      {/* --- TRAY BACKGROUND LAYER --- */}
      <div className="absolute right-[2%] top-[15%] w-80 h-96 perspective-1000 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#2d1e1a] shadow-inner rounded-sm" style={woodTextureStyle}></div>
        <div className="absolute top-0 left-0 right-0 h-5 bg-[#4e342e] shadow-md origin-top transform rotate-x-90"></div>
        <div className="absolute top-0 bottom-0 left-0 w-5 bg-[#3e2723] shadow-md border-r border-[#5d4037]"></div>
        <div className="absolute top-0 bottom-0 right-0 w-5 bg-[#3e2723] shadow-md border-l border-[#5d4037]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#5d4037] shadow-lg border-t border-[#795548]"></div>
        <div className="absolute inset-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none rounded-sm z-10"></div>
      </div>

      {/* --- INTERACTIVE STACK LAYER --- */}
      <div className="absolute right-[2%] top-[15%] w-80 h-96 z-10">
        
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

            return (
              <div
                key={sheet.id}
                onClick={() => setZoomedId(sheet.id)}
                className={`
                  absolute top-0 left-0 w-[90%] h-[90%] bg-paper-white paper-texture shadow-md 
                  transition-all duration-300 ease-out p-6 font-typewriter text-[10px] text-zinc-800 overflow-hidden border border-gray-200/50
                  hover:shadow-xl leading-relaxed cursor-pointer group-hover:scale-[1.02] markdown-content
                `}
                style={{
                  transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px) scale(${isActive ? 1.05 : 1})`,
                  zIndex: zIndex,
                  opacity: opacity
                }}
              >
                <div 
                    className="whitespace-pre-wrap break-words opacity-60 mb-1"
                    dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(sheet.content) }}
                />
                <div className="absolute bottom-2 right-2 opacity-30 text-[6px] border-t border-black/10 pt-1">ID: {sheet.id.toUpperCase()}</div>
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
                fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm 
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
                    relative w-[850px] min-h-[1100px] max-h-[90vh] bg-paper-white paper-texture shadow-2xl p-16 font-typewriter text-[14px] leading-relaxed text-zinc-900 overflow-y-auto rounded-sm 
                    transition-all duration-500 ease-in-out transform origin-center markdown-content
                    ${deletingId === zoomedSheet.id ? 'scale-0 rotate-[720deg] opacity-0' : 'scale-100 rotate-0'}
                `}
            >
               <div className="min-h-[800px]">
                    <div 
                        className="whitespace-pre-wrap break-words mb-1"
                        dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(zoomedSheet.content) }}
                    />
               </div>
              
              <div className="mt-16 pt-8 border-t-2 border-zinc-200 flex justify-between items-end opacity-60">
                 <div className="text-xs leading-relaxed font-typewriter text-zinc-500">
                    <span className="uppercase tracking-wider">{t('archived')}</span>: {new Date().toLocaleDateString()}
                    <br/>
                    <span className="uppercase tracking-wider">{t('ref')}</span>: {zoomedSheet.id}
                 </div>
                 <div className="font-serif italic text-lg text-zinc-600">Olivetti Valentine AI</div>
              </div>
           </div>

           {/* Actions Bar */}
           <div className="relative z-50 mt-6 flex gap-4">
               <button 
                  onClick={() => downloadMarkdown(zoomedSheet)}
                  className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                  title={t('downloadMd')}
               >
                  <span className="material-icons">description</span>
                  <span className="text-sm font-medium">MD</span>
               </button>
               
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
