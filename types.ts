
export type Role = 'user' | 'assistant';

export type VoiceName = 'Charon' | 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir';

export type AIModel = 'deepseek' | 'qwen-coder' | 'gemini-3-flash';

export interface VoiceSettings {
  enabled: boolean;
  voiceName: VoiceName;
  autoPlay: boolean;
  speed: number;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; 
  reasoning_details?: any; // Pour stocker les détails de raisonnement d'OpenRouter
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model?: AIModel;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export type Page = 'home' | 'chat' | 'faq' | 'studio';
