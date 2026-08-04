export interface PaperSheet {
  id: string;
  type: 'text' | 'image'; 
  content: string[]; 
  timestamp: number;
}

export interface KeyState {
  [key: string]: boolean; 
}

export type AIModel = 'gemini' | 'deepseek' | null;

export interface APIKeys {
  gemini: string;
  deepseek: string;
  deepSeekModel: 'deepseek-chat' | 'deepseek-reasoner';
  geminiModel: 'gemini-2.5-flash' | 'gemini-3-pro-preview';
  nickname: string; 
}

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja';

export type LampType = 'industrial' | 'banker' | 'pixar' | 'retro' | 'modern';

export type DesktopType = 'wood' | 'glass' | 'black' | 'marble' | 'concrete';

export type PadType = 'newton' | 'p900' | 'blackberry' | 'vaio' | 'treo';

export type CameraType = 'i2' | 'onestep' | 'sx70' | 'coolcam' | 'impulse';

export const MAX_CHARS_PER_LINE = 48;
export const MAX_LINES_PER_PAGE = 24;