
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; 
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export type Page = 'home' | 'chat' | 'faq';
