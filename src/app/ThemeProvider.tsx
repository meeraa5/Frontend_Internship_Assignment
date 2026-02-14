"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getStoredThemeId,
  setStoredThemeId,
  getStoredColorMode,
  setStoredColorMode,
  getTheme,
  applyThemeToDocument,
  type ThemeId,
  type ColorMode,
} from "@/lib/theme";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("midnight-navy");
  const [colorMode, setColorModeState] = useState<ColorMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeIdState(getStoredThemeId());
    setColorModeState(getStoredColorMode());
    setMounted(true);
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    setStoredThemeId(id);
    applyThemeToDocument(getTheme(id), colorMode);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    setStoredColorMode(mode);
    applyThemeToDocument(getTheme(themeId), mode);
  }, [themeId]);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDocument(getTheme(themeId), colorMode);
  }, [mounted, themeId, colorMode]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
