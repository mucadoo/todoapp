import { createContext } from 'react';

export interface ThemeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
