export type ThemeId = string;

export type Theme = {
  id: ThemeId;
  name: string;
  accent: string;
  muted: string;
  background: string;
  backgroundEnd: string;
  foreground: string;
  glassBg: string;
  glassBorder: string;
};

export const THEMES: Theme[] = [
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    accent: "#3b82f6",
    muted: "rgba(59, 130, 246, 0.18)",
    background: "#0f172a",
    backgroundEnd: "#020617",
    foreground: "#f1f5f9",
    glassBg: "rgba(15, 23, 42, 0.82)",
    glassBorder: "rgba(148, 163, 184, 0.12)",
  },
  {
    id: "slate",
    name: "Slate",
    accent: "#64748b",
    muted: "rgba(100, 116, 139, 0.2)",
    background: "#0f1419",
    backgroundEnd: "#1e293b",
    foreground: "#e2e8f0",
    glassBg: "rgba(30, 41, 59, 0.78)",
    glassBorder: "rgba(148, 163, 184, 0.14)",
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    accent: "#0ea5e9",
    muted: "rgba(14, 165, 233, 0.18)",
    background: "#0c1929",
    backgroundEnd: "#0f172a",
    foreground: "#e0f2fe",
    glassBg: "rgba(12, 25, 41, 0.8)",
    glassBorder: "rgba(148, 163, 184, 0.15)",
  },
  {
    id: "forest",
    name: "Forest",
    accent: "#10b981",
    muted: "rgba(16, 185, 129, 0.18)",
    background: "#052e16",
    backgroundEnd: "#0f172a",
    foreground: "#d1fae5",
    glassBg: "rgba(5, 46, 22, 0.82)",
    glassBorder: "rgba(167, 243, 208, 0.12)",
  },
  {
    id: "amber",
    name: "Amber",
    accent: "#f59e0b",
    muted: "rgba(245, 158, 11, 0.18)",
    background: "#1c1917",
    backgroundEnd: "#0f172a",
    foreground: "#fef3c7",
    glassBg: "rgba(28, 25, 23, 0.82)",
    glassBorder: "rgba(253, 230, 138, 0.12)",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    accent: "#8b5cf6",
    muted: "rgba(139, 92, 246, 0.18)",
    background: "#1e1b4b",
    backgroundEnd: "#0f172a",
    foreground: "#ede9fe",
    glassBg: "rgba(30, 27, 75, 0.82)",
    glassBorder: "rgba(196, 181, 253, 0.14)",
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    accent: "#22d3ee",
    muted: "rgba(34, 211, 238, 0.18)",
    background: "#0f0f23",
    backgroundEnd: "#0a0a14",
    foreground: "#e2e8f0",
    glassBg: "rgba(15, 23, 42, 0.78)",
    glassBorder: "rgba(148, 163, 184, 0.15)",
  },
  {
    id: "crimson",
    name: "Crimson",
    accent: "#dc2626",
    muted: "rgba(220, 38, 38, 0.18)",
    background: "#1c1917",
    backgroundEnd: "#450a0a",
    foreground: "#fef2f2",
    glassBg: "rgba(69, 10, 10, 0.8)",
    glassBorder: "rgba(254, 202, 202, 0.12)",
  },
];

const STORAGE_KEY = "stackbirds-rolodex-theme";
const STORAGE_KEY_COLOR_MODE = "stackbirds-rolodex-color-mode";

export type ColorMode = "dark" | "light";

export function getStoredThemeId(): ThemeId {
  if (typeof window === "undefined") return "midnight-navy";
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) || "midnight-navy";
}

export function setStoredThemeId(id: ThemeId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, id);
}

export function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY_COLOR_MODE) as ColorMode) || "dark";
}

export function setStoredColorMode(mode: ColorMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_COLOR_MODE, mode);
}

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[6];
}

const LIGHT_MODE = {
  background: "#f8fafc",
  backgroundEnd: "#e2e8f0",
  foreground: "#0f172a",
  glassBg: "rgba(255, 255, 255, 0.92)",
  glassBorder: "rgba(15, 23, 42, 0.14)",
  mutedBg: "rgba(15, 23, 42, 0.08)",
  mutedFg: "rgba(15, 23, 42, 0.65)",
};

export function applyThemeToDocument(t: Theme, colorMode: ColorMode = "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-color-mode", colorMode);
  if (colorMode === "light") {
    root.style.setProperty("--background", LIGHT_MODE.background);
    root.style.setProperty("--background-end", LIGHT_MODE.backgroundEnd);
    root.style.setProperty("--foreground", LIGHT_MODE.foreground);
    root.style.setProperty("--glass-bg", LIGHT_MODE.glassBg);
    root.style.setProperty("--glass-border", LIGHT_MODE.glassBorder);
    root.style.setProperty("--muted-bg", LIGHT_MODE.mutedBg);
    root.style.setProperty("--muted-fg", LIGHT_MODE.mutedFg);
  } else {
    root.style.setProperty("--background", t.background);
    root.style.setProperty("--background-end", t.backgroundEnd);
    root.style.setProperty("--foreground", t.foreground);
    root.style.setProperty("--glass-bg", t.glassBg);
    root.style.setProperty("--glass-border", t.glassBorder);
    root.style.setProperty("--muted-bg", "rgba(255, 255, 255, 0.1)");
    root.style.setProperty("--muted-fg", "rgba(248, 250, 252, 0.7)");
  }
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-muted", t.muted);
}
