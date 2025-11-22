
export interface PaperSheet {
  id: string;
  type: 'text' | 'image'; // New field to distinguish content type
  content: string[]; // For text sheets, lines of text. For image sheets, [0] is base64/url, [1] is prompt/caption
  timestamp: number;
}

export interface KeyState {
  [key: string]: boolean; // true if pressed
}

export type AIModel = 'gemini' | 'deepseek' | null;

export interface APIKeys {
  gemini: string;
  deepseek: string;
  deepSeekModel: 'deepseek-chat' | 'deepseek-reasoner';
  geminiModel: 'gemini-2.5-flash' | 'gemini-3-pro-preview';
  nickname: string; // Added user nickname
}

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja';

export const MAX_CHARS_PER_LINE = 48;
export const MAX_LINES_PER_PAGE = 24;