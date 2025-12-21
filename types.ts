
export type Role = 'user' | 'assistant';

export type VoiceName = 'Charon' | 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir';

export type AIModel = 'kimi' | 'deepseek';

export interface VoiceSettings {
  enabled: boolean;
  voiceName: VoiceName;
  autoPlay: boolean;
  speed: number;
  model: AIModel; // Nouveau : Choix du modèle IA
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; 
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export type Page = 'home' | 'chat' | 'faq';
