"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/ThemeProvider";
import { THEMES } from "@/lib/theme";
import clsx from "clsx";

export function ThemeSwitcher() {
  const { themeId, setThemeId, colorMode, setColorMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setExpanded(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="rounded-xl border px-3 py-2 backdrop-blur-xl flex items-center gap-2 transition-colors hover:bg-white/5"
        style={{
          background: "var(--glass-bg)",
          borderColor: "var(--glass-border)",
        }}
      >
        <span
          className="w-5 h-5 rounded-full shrink-0 border border-white/20"
          style={{
            background: THEMES.find((t) => t.id === themeId)?.accent ?? "var(--accent)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Theme</span>
        <span className="text-slate-400 text-xs">{expanded ? "▼" : "▶"}</span>
      </button>

      {expanded && (
        <div
          className="absolute top-full right-0 mt-2 rounded-xl border py-3 px-3 backdrop-blur-xl shadow-2xl z-50 w-52"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Appearance</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setColorMode("dark")}
                className={clsx(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  colorMode === "dark"
                    ? "bg-[var(--accent)] text-white"
                    : "hover:opacity-100"
                )}
                style={colorMode !== "dark" ? { background: "var(--muted-bg)", color: "var(--foreground)" } : undefined}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setColorMode("light")}
                className={clsx(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  colorMode === "light"
                    ? "bg-[var(--accent)] text-white"
                    : "hover:opacity-100"
                )}
                style={colorMode !== "light" ? { background: "var(--muted-bg)", color: "var(--foreground)" } : undefined}
              >
                Light
              </button>
            </div>
          </div>
          <h3 className="text-sm font-semibold px-1 mb-0.5" style={{ color: "var(--foreground)" }}>Choose Theme</h3>
          <p className="text-xs mb-3 px-1 opacity-70" style={{ color: "var(--foreground)" }}>Select a color scheme</p>
          <div className="grid grid-cols-4 gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeId(t.id)}
                className={clsx(
                  "rounded-lg flex flex-col items-center gap-1.5 py-2 min-h-[52px] border transition-all",
                  themeId === t.id
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <span
                  className="w-6 h-6 rounded-md shrink-0 border border-white/15"
                  style={{
                    background: t.accent,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                />
                <span className="text-[10px] text-center leading-normal px-0.5 min-h-[2.25rem] flex items-center justify-center opacity-90" style={{ color: "var(--foreground)" }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-3 px-1 opacity-60" style={{ color: "var(--foreground)" }}>Theme changes apply instantly.</p>
        </div>
      )}
    </div>
  );
}
