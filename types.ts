
export interface PaperSheet {
  id: string;
  content: string[]; // Array of lines
}

export interface KeyState {
  [key: string]: boolean; // true if pressed
}

export type AIModel = 'gemini' | 'deepseek' | null;

export interface APIKeys {
  gemini: string;
  deepseek: string;
  deepSeekModel: 'deepseek-chat' | 'deepseek-reasoner';
}

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja';

export const MAX_CHARS_PER_LINE = 48;
export const MAX_LINES_PER_PAGE = 24;
