
import React, { useState, useRef, useEffect } from 'react';
import { PaperSheet } from '../types';
import { playPaperCutSound, playPaperLoadSound, playCrumpleSound } from '../services/soundService';
import { useLanguage } from '../contexts/LanguageContext';

// Declare html2canvas and marked global
declare const html2canvas: any;
declare const marked: any;

interface PaperGridProps {
  sheets: PaperSheet[];
  title: string;
  isTrashMode?: boolean;
  onClose: () => void;
  onDelete: (ids: string[]) => void;
  onRestore?: (ids: string[]) => void;
}

// Internal component for Scaled Paper Thumbnail to match Zoom View exactly
const PaperThumbnail = ({ sheet, getRenderedMarkdown, t }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const update = () => {
            if(containerRef.current) {
                // Calculate scale based on container width vs standard 850px paper width
                const currentWidth = containerRef.current.offsetWidth;
                setScale(currentWidth / 850);
            }
        };
        
        update();
        const observer = new ResizeObserver(update);
        if(containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-paper-white paper-texture overflow-hidden shadow-sm">
            <div 
                style={{ 
                    width: '850px', 
                    height: '1100px', // Fixed height for thumbnail view calculation
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top left',
                }}
                className="absolute top-0 left-0 p-16 flex flex-col"
            >
                <div className="flex-1 overflow-hidden">
                     <div 
                        className="font-typewriter text-[14px] leading-relaxed text-zinc-900 markdown-content"
                        dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(sheet.content) }}
                    />
                </div>
                
                {/* Footer matching PaperStack exactly */}
                <div className="mt-16 pt-8 border-t-2 border-zinc-200 flex justify-between items-end opacity-60 shrink-0">
                    <div className="text-xs font-typewriter leading-tight text-zinc-500">
                        <span className="uppercase tracking-wider">{t('archived')}</span>: {new Date().toLocaleDateString()} <br/>
                        <span className="uppercase tracking-wider">{t('ref')}</span>: {sheet.id.substring(0,8)}
                    </div>
                    <div className="font-serif italic text-lg text-zinc-600">Olivetti Valentine AI</div>
                </div>
                
                {/* Gradient Fade for overflow text in thumbnail */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#F9F7F1] to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

const PaperGrid: React.FC<PaperGridProps> = ({ 
  sheets, 
  title, 
  isTrashMode = false, 
  onClose, 
  onDelete,
  onRestore
}) => {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hidden container for batch rendering before snapshot
  const printContainerRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sheets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sheets.map(s => s.id)));
    }
  };

  const handleDownloadMarkdown = (ids: string[]) => {
    sheets
      .filter(s => ids.includes(s.id))
      .forEach(sheet => {
        // Content is raw text
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
      });
  };

  const handleBatchDownloadImages = async (ids: string[]) => {
      if (!printContainerRef.current || isProcessing) return;
      setIsProcessing(true);

      const selectedSheets = sheets.filter(s => ids.includes(s.id));
      
      try {
          for (const sheet of selectedSheets) {
              const element = document.getElementById(`print-hidden-${sheet.id}`);
              if (element) {
                  const canvas = await html2canvas(element, {
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
                  
                  await new Promise(r => setTimeout(r, 200));
              }
          }
      } catch (e) {
          console.error("Batch download failed", e);
      } finally {
          setIsProcessing(false);
      }
  };

  const getRenderedMarkdown = (content: string[]) => {
    try {
        return marked.parse(content.join('\n'));
    } catch (e) {
        return content.join('<br/>');
    }
  };

  // Resolve title if it's a key match
  const displayTitle = title === "Output Tray" ? t('outputTray') : title === "Trash Bin" ? t('trashBin') : title;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
        
        {/* --- HIDDEN PRINT CONTAINER (Full Size for rendering images) --- */}
        <div ref={printContainerRef} className="absolute top-0 left-0 opacity-0 pointer-events-none overflow-hidden w-0 h-0">
            {sheets.map(sheet => (
                <div 
                    key={sheet.id} 
                    id={`print-hidden-${sheet.id}`}
                    className="relative w-[850px] min-h-[1100px] bg-paper-white paper-texture p-16 font-typewriter text-[14px] leading-relaxed text-zinc-900 mb-10 markdown-content"
                >
                    <div className="min-h-[800px]">
                        <div 
                            className="whitespace-pre-wrap break-words mb-1"
                            dangerouslySetInnerHTML={{ __html: getRenderedMarkdown(sheet.content) }}
                        />
                    </div>
                    <div className="mt-16 pt-8 border-t-2 border-zinc-200 flex justify-between items-end opacity-60">
                        <div className="text-xs font-typewriter leading-tight text-zinc-500">
                            <span className="uppercase tracking-wider">{t('archived')}</span>: {new Date().toLocaleDateString()} <br/>
                            <span className="uppercase tracking-wider">{t('ref')}</span>: {sheet.id}
                        </div>
                        <div className="font-serif italic text-lg text-zinc-600">Olivetti Valentine AI</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Header / Toolbar */}
        <div className="h-20 bg-zinc-900/90 flex items-center justify-center px-8 shadow-xl border-b border-white/10 relative z-50">
            <div className="absolute left-8 flex items-center gap-4">
                <h2 className="text-white font-serif text-2xl tracking-wider">{displayTitle}</h2>
                <span className="text-white/40 text-sm border-l border-white/20 pl-4">{sheets.length} {t('items')}</span>
                <span className="text-white/40 text-sm">{selectedIds.size} {t('selected')}</span>
                {isProcessing && <span className="text-yellow-500 text-xs animate-pulse">{t('processing')}</span>}
            </div>
            
            <div className="absolute right-8 flex gap-4">
                <button 
                    onClick={handleSelectAll}
                    className="text-white/70 hover:text-white text-sm uppercase tracking-widest font-bold px-4 py-2"
                >
                    {selectedIds.size === sheets.length ? t('deselectAll') : t('selectAll')}
                </button>
                
                <button 
                    onClick={onClose}
                    className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                    <span className="material-icons">close</span>
                </button>
            </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-10" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            {sheets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 font-typewriter">
                    <span className="material-icons text-6xl mb-4 opacity-50">{isTrashMode ? 'delete_outline' : 'inbox'}</span>
                    <p>{t('noPapers')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-32 max-w-[1800px] mx-auto">
                    {sheets.map((sheet, idx) => {
                        const isSelected = selectedIds.has(sheet.id);
                        return (
                            <div 
                                key={sheet.id}
                                onClick={() => toggleSelection(sheet.id)}
                                className={`
                                    relative shadow-lg cursor-pointer transition-all duration-300 group
                                    ${isSelected ? 'ring-4 ring-red-500 scale-105 z-10 shadow-2xl' : 'hover:scale-[1.02] hover:shadow-xl'}
                                `}
                                style={{
                                    aspectRatio: '850/1100', // Maintain standard aspect ratio
                                    transform: isSelected ? 'rotate(0deg)' : `rotate(${(idx % 2 === 0 ? 1 : -1) * 1}deg)`
                                }}
                            >
                                <PaperThumbnail 
                                    sheet={sheet} 
                                    getRenderedMarkdown={getRenderedMarkdown} 
                                    t={t} 
                                />

                                {/* Selection Overlay */}
                                <div className={`absolute inset-0 bg-red-900/5 transition-opacity pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`}></div>
                                
                                {/* Checkmark */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-md z-20">
                                        <span className="material-icons text-sm font-bold">check</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer Action Bar */}
        <div className={`
            absolute bottom-0 left-0 right-0 h-24 bg-zinc-900/95 backdrop-blur border-t border-white/10 
            flex items-center justify-center gap-6 transition-transform duration-300 z-50
            ${selectedIds.size > 0 ? 'translate-y-0' : 'translate-y-full'}
        `}>
             {!isTrashMode && (
                <>
                    <button 
                        onClick={() => handleBatchDownloadImages(Array.from(selectedIds))}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <span className="material-icons">image</span>
                        <span>{t('downloadImage')} ({selectedIds.size})</span>
                    </button>

                     <button 
                        onClick={() => handleDownloadMarkdown(Array.from(selectedIds))}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded shadow-lg transition-all hover:-translate-y-1"
                    >
                        <span className="material-icons">description</span>
                        <span>{t('downloadMd')} ({selectedIds.size})</span>
                    </button>

                    <button 
                        onClick={() => {
                            playCrumpleSound();
                            onDelete(Array.from(selectedIds));
                            setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/80 text-red-100 px-8 py-3 rounded shadow-lg transition-all hover:-translate-y-1"
                    >
                        <span className="material-icons">delete</span>
                        <span>{t('trash')} ({selectedIds.size})</span>
                    </button>
                </>
             )}

             {isTrashMode && (
                 <>
                     <button 
                        onClick={() => {
                            playPaperLoadSound();
                            if (onRestore) onRestore(Array.from(selectedIds));
                            setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-2 bg-green-900/50 hover:bg-green-800/80 text-green-100 px-8 py-3 rounded shadow-lg transition-all hover:-translate-y-1"
                    >
                        <span className="material-icons">restore_from_trash</span>
                        <span>{t('restore')} ({selectedIds.size})</span>
                    </button>

                    <button 
                        onClick={() => {
                            playPaperCutSound();
                            onDelete(Array.from(selectedIds));
                            setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded shadow-lg transition-all hover:-translate-y-1"
                    >
                        <span className="material-icons">delete_forever</span>
                        <span>{t('destroy')} ({selectedIds.size})</span>
                    </button>
                 </>
             )}
        </div>
    </div>
  );
};

export default PaperGrid;
