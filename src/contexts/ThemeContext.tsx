import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme color definitions
export interface ThemeColors {
  primary: string;        // Main blue #004DB6
  secondary: string;      // Green #70C573
  accent: string;         // Sage green #5E885D
  light: string;          // Mint light #DAF9D8
  background: string;     // App background gradient
  cardBg: string;         // Card background
  text: {
    primary: string;      // Main text color (gray)
    secondary: string;    // Secondary text
    heading: string;      // Headings
  };
  border: string;         // Border colors
  shadow: string;         // Shadow color
}

// Predefined theme types
export type ThemeType = 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'custom';

// Theme configuration
export interface Theme {
  id: ThemeType;
  name: {
    en: string;
    vi: string;
  };
  colors: ThemeColors;
}

// Context type
interface ThemeContextType {
  currentTheme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  customColors: ThemeColors | null;
  setCustomColors: (colors: ThemeColors) => void;
  applyTheme: () => void;
}

// Default theme (current app colors)
const defaultTheme: Theme = {
  id: 'default',
  name: {
    en: 'Default Blue',
    vi: 'Xanh Dương Mặc Định',
  },
  colors: {
    primary: '#004DB6',
    secondary: '#70C573',
    accent: '#5E885D',
    light: '#DAF9D8',
    background: 'linear-gradient(to bottom right, #D1FAE5, #DBEAFE)',
    cardBg: '#FFFFFF',
    text: {
      primary: '#64748B',
      secondary: '#94A3B8',
      heading: '#1E293B',
    },
    border: '#E5E7EB',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
};

// Predefined themes (ready for future expansion)
export const THEMES: Record<ThemeType, Theme> = {
  default: defaultTheme,
  
  // Ocean theme - Blue tones
  ocean: {
    id: 'ocean',
    name: {
      en: 'Ocean Blue',
      vi: 'Xanh Đại Dương',
    },
    colors: {
      primary: '#0077BE',
      secondary: '#00A8E8',
      accent: '#007EA7',
      light: '#C8E9F5',
      background: 'linear-gradient(to bottom right, #C8E9F5, #E0F4FF)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#334155',
        secondary: '#64748B',
        heading: '#0F172A',
      },
      border: '#CBD5E1',
      shadow: 'rgba(0, 119, 190, 0.08)',
    },
  },

  // Forest theme - Green tones
  forest: {
    id: 'forest',
    name: {
      en: 'Forest Green',
      vi: 'Xanh Rừng',
    },
    colors: {
      primary: '#2D6A4F',
      secondary: '#52B788',
      accent: '#40916C',
      light: '#D8F3DC',
      background: 'linear-gradient(to bottom right, #D8F3DC, #E8F5E9)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#344E41',
        secondary: '#588157',
        heading: '#1B4332',
      },
      border: '#B7E4C7',
      shadow: 'rgba(45, 106, 79, 0.08)',
    },
  },

  // Sunset theme - Warm tones
  sunset: {
    id: 'sunset',
    name: {
      en: 'Sunset Orange',
      vi: 'Hoàng Hôn Cam',
    },
    colors: {
      primary: '#E76F51',
      secondary: '#F4A261',
      accent: '#E9C46A',
      light: '#FCE8DB',
      background: 'linear-gradient(to bottom right, #FCE8DB, #FFF4E6)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#5A4A42',
        secondary: '#8B7355',
        heading: '#3C2F2F',
      },
      border: '#F5DCC8',
      shadow: 'rgba(231, 111, 81, 0.08)',
    },
  },

  // Lavender theme - Purple tones
  lavender: {
    id: 'lavender',
    name: {
      en: 'Lavender Purple',
      vi: 'Tím Lavender',
    },
    colors: {
      primary: '#7B68EE',
      secondary: '#9D84B7',
      accent: '#B695C0',
      light: '#E6E1F0',
      background: 'linear-gradient(to bottom right, #E6E1F0, #F3E8FF)',
      cardBg: '#FFFFFF',
      text: {
        primary: '#4A4458',
        secondary: '#6B5D7B',
        heading: '#2D2433',
      },
      border: '#D4C5E2',
      shadow: 'rgba(123, 104, 238, 0.08)',
    },
  },

  // Custom theme (user-defined)
  custom: {
    id: 'custom',
    name: {
      en: 'Custom Theme',
      vi: 'Chủ Đề Tùy Chỉnh',
    },
    colors: defaultTheme.colors, // Will be overridden by user
  },
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('themeType');
    return (saved as ThemeType) || 'default';
  });

  const [customColors, setCustomColors] = useState<ThemeColors | null>(() => {
    // Load custom colors from localStorage
    const saved = localStorage.getItem('customColors');
    return saved ? JSON.parse(saved) : null;
  });

  // Get current theme
  const currentTheme: Theme = themeType === 'custom' && customColors
    ? { ...THEMES.custom, colors: customColors }
    : THEMES[themeType];

  // Apply theme to CSS variables
  const applyTheme = () => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set CSS custom properties for theme system
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-light', colors.light);
    root.style.setProperty('--color-card-bg', colors.cardBg);
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-text-heading', colors.text.heading);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-shadow', colors.shadow);

    // Also update the existing globals.css variables for UI components
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.secondary);
    root.style.setProperty('--muted', colors.light);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-accent', colors.light);
    root.style.setProperty('--sidebar-border', colors.accent);
    root.style.setProperty('--sidebar-ring', colors.primary);
    root.style.setProperty('--chart-1', colors.primary);
    root.style.setProperty('--chart-2', colors.secondary);
    root.style.setProperty('--chart-3', colors.accent);
    root.style.setProperty('--chart-4', colors.light);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme();
  }, [currentTheme]);

  // Save theme type to localStorage
  useEffect(() => {
    localStorage.setItem('themeType', themeType);
  }, [themeType]);

  // Save custom colors to localStorage
  useEffect(() => {
    if (customColors) {
      localStorage.setItem('customColors', JSON.stringify(customColors));
    }
  }, [customColors]);

  const value: ThemeContextType = {
    currentTheme,
    themeType,
    setThemeType,
    customColors,
    setCustomColors,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}