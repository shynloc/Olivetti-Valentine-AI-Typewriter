
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof enTranslations) => string;
}

const enTranslations = {
  // Lamp
  pullToStart: "PULL TO START",
  // Typewriter
  busy: "BUSY",
  manual: "MANUAL",
  thinking: "Thinking...",
  light: "Light",
  // PaperStack
  spreadOut: "Spread Out",
  trayEmpty: "Tray Empty",
  scrollToFlip: "Scroll to flip pages",
  archived: "ARCHIVED",
  ref: "REF",
  downloadMd: "Download MD",
  downloadPng: "Download PNG",
  moveToTrash: "Move to Trash",
  trash: "Trash",
  // PaperGrid
  outputTray: "Output Tray",
  trashBin: "Trash Bin",
  items: "items",
  selected: "selected",
  processing: "Processing...",
  deselectAll: "Deselect All",
  selectAll: "Select All",
  noPapers: "No papers found here.",
  downloadImage: "Download Image",
  restore: "Restore",
  destroy: "Destroy",
  // ConfidentialFolder
  classifiedConfig: "Classified Configuration",
  geminiAccess: "Project Gemini Access",
  enterKeyGemini: "Enter Key for Gemini 3.0",
  uplinkActive: ">> UPLINK: PROTOCOL 3.0 ACTIVE",
  uplinkDefault: ">> UPLINK: SYSTEM DEFAULT (FREE)",
  deepseekProtocol: "DeepSeek Protocol",
  enterKeyDeepseek: "Enter API Key",
  modelSelection: "MODEL SELECTION",
  authorize: "AUTHORIZE",
  topSecret: "TOP SECRET",
  confidential: "CONFIDENTIAL",
  nickname: "USER NICKNAME",
  enterNickname: "Enter Name for Watermark",
  // Markdown CheatSheet
  syntaxGuide: "Syntax Guide",
  header: "Header",
  bold: "Bold",
  italic: "Italic",
  listItem: "List item",
  orderedList: "Ordered List",
  blockquote: "Blockquote",
  notes: "Notes",
  // App Instructions
  instruction1: "Type to write. Toggle AI buttons on chassis to enable response.",
  instruction2: "Press ENTER to start new line (or send to AI if enabled).",
  // Thermometer
  temperature: "TEMP",
  precise: "PRECISE",
  creative: "CREATIVE",
  // Camera
  polaroid: "POLAROID I-2",
  aiPrint: "AI PRINT",
  enterPrompt: "Enter image prompt...",
  generating: "DEVELOPING...",
  shutter: "Shutter"
};

const zhCNTranslations: typeof enTranslations = {
  pullToStart: "下拉启动",
  busy: "忙碌",
  manual: "手动",
  thinking: "思考中...",
  light: "光",
  spreadOut: "展开",
  trayEmpty: "空托盘",
  scrollToFlip: "滚动翻页",
  archived: "归档",
  ref: "编号",
  downloadMd: "下载 MD",
  downloadPng: "下载 PNG",
  moveToTrash: "移至废纸篓",
  trash: "丢弃",
  outputTray: "输出托盘",
  trashBin: "废纸篓",
  items: "项",
  selected: "已选",
  processing: "处理中...",
  deselectAll: "取消全选",
  selectAll: "全选",
  noPapers: "此处无纸张",
  downloadImage: "下载图片",
  restore: "恢复",
  destroy: "销毁",
  classifiedConfig: "机密配置",
  geminiAccess: "Gemini 项目访问",
  enterKeyGemini: "输入 Gemini 3.0 密钥",
  uplinkActive: ">> 上行链路: 协议 3.0 已激活",
  uplinkDefault: ">> 上行链路: 系统默认 (免费)",
  deepseekProtocol: "DeepSeek 协议",
  enterKeyDeepseek: "输入 API 密钥",
  modelSelection: "模型选择",
  authorize: "授权",
  topSecret: "绝密",
  confidential: "机密",
  nickname: "用户昵称",
  enterNickname: "输入水印显示名称",
  syntaxGuide: "语法指南",
  header: "标题",
  bold: "粗体",
  italic: "斜体",
  listItem: "列表项",
  orderedList: "有序列表",
  blockquote: "引用",
  notes: "笔记",
  instruction1: "打字输入。切换底盘上的 AI 按钮以启用回复。",
  instruction2: "按回车键换行（或发送给 AI）。",
  temperature: "温度",
  precise: "严谨",
  creative: "创意",
  polaroid: "宝丽来 I-2",
  aiPrint: "AI 印相",
  enterPrompt: "输入画面描述...",
  generating: "显影中...",
  shutter: "快门"
};

const zhTWTranslations: typeof enTranslations = {
  pullToStart: "下拉啟動",
  busy: "忙碌",
  manual: "手動",
  thinking: "思考中...",
  light: "光",
  spreadOut: "展開",
  trayEmpty: "空托盤",
  scrollToFlip: "滾動翻頁",
  archived: "歸檔",
  ref: "編號",
  downloadMd: "下載 MD",
  downloadPng: "下載 PNG",
  moveToTrash: "移至廢紙簍",
  trash: "丟棄",
  outputTray: "輸出托盤",
  trashBin: "廢紙簍",
  items: "項",
  selected: "已選",
  processing: "處理中...",
  deselectAll: "取消全選",
  selectAll: "全選",
  noPapers: "此處無紙張",
  downloadImage: "下載圖片",
  restore: "恢復",
  destroy: "銷毀",
  classifiedConfig: "機密配置",
  geminiAccess: "Gemini 專案訪問",
  enterKeyGemini: "輸入 Gemini 3.0 金鑰",
  uplinkActive: ">> 上行鏈路: 協議 3.0 已激活",
  uplinkDefault: ">> 上行鏈路: 系統默認 (免費)",
  deepseekProtocol: "DeepSeek 協議",
  enterKeyDeepseek: "輸入 API 金鑰",
  modelSelection: "模型選擇",
  authorize: "授權",
  topSecret: "絕密",
  confidential: "機密",
  nickname: "用戶暱稱",
  enterNickname: "輸入浮水印顯示名稱",
  syntaxGuide: "語法指南",
  header: "標題",
  bold: "粗體",
  italic: "斜體",
  listItem: "列表項",
  orderedList: "有序列表",
  blockquote: "引用",
  notes: "筆記",
  instruction1: "打字輸入。切換底盤上的 AI 按鈕以啟用回复。",
  instruction2: "按回車鍵換行（或發送給 AI）。",
  temperature: "溫度",
  precise: "嚴謹",
  creative: "創意",
  polaroid: "寶麗來 I-2",
  aiPrint: "AI 印相",
  enterPrompt: "輸入畫面描述...",
  generating: "顯影中...",
  shutter: "快門"
};

const jaTranslations: typeof enTranslations = {
  pullToStart: "引いて開始",
  busy: "話中",
  manual: "手動",
  thinking: "思考中...",
  light: "照明",
  spreadOut: "広げる",
  trayEmpty: "トレイは空です",
  scrollToFlip: "スクロールしてめくる",
  archived: "アーカイブ",
  ref: "参照",
  downloadMd: "MDを保存",
  downloadPng: "PNGを保存",
  moveToTrash: "ゴミ箱へ移動",
  trash: "ゴミ箱へ",
  outputTray: "出力トレイ",
  trashBin: "ゴミ箱",
  items: "項目",
  selected: "選択中",
  processing: "処理中...",
  deselectAll: "全選択解除",
  selectAll: "すべて選択",
  noPapers: "用紙がありません",
  downloadImage: "画像を保存",
  restore: "復元",
  destroy: "破棄",
  classifiedConfig: "機密設定",
  geminiAccess: "Gemini アクセス",
  enterKeyGemini: "Gemini 3.0 キーを入力",
  uplinkActive: ">> リンク: プロトコル 3.0 アクティブ",
  uplinkDefault: ">> リンク: システムデフォルト (無料)",
  deepseekProtocol: "DeepSeek プロトコル",
  enterKeyDeepseek: "APIキーを入力",
  modelSelection: "モデル選択",
  authorize: "承認",
  topSecret: "極秘",
  confidential: "機密",
  nickname: "ユーザー名",
  enterNickname: "透かし用の名前を入力",
  syntaxGuide: "構文ガイド",
  header: "見出し",
  bold: "太字",
  italic: "斜体",
  listItem: "リスト項目",
  orderedList: "番号付きリスト",
  blockquote: "引用",
  notes: "メモ",
  instruction1: "入力して執筆。シャーシのAIボタンで応答を有効化。",
  instruction2: "ENTERで改行（有効な場合はAIに送信）。",
  temperature: "温度",
  precise: "厳格",
  creative: "独創",
  polaroid: "ポラロイド I-2",
  aiPrint: "AI 現像",
  enterPrompt: "画像のプロンプトを入力...",
  generating: "現像中...",
  shutter: "シャッター"
};

const translations = {
  'en': enTranslations,
  'zh-CN': zhCNTranslations,
  'zh-TW': zhTWTranslations,
  'ja': jaTranslations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof enTranslations) => {
    return translations[language][key] || enTranslations[key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
