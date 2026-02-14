"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RolodexViewer } from "@/components/RolodexViewer";
import { ControlPanel, type DockSide } from "@/components/ControlPanel";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { GridModal } from "@/components/GridModal";
import { FullscreenSlide } from "@/components/FullscreenSlide";
import { screens } from "@/lib/screens";

const VIEWER_OFFSET = 80;

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dockSide, setDockSide] = useState<DockSide>("left");
  const [autoplay, setAutoplay] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(3);
  const [gridOpen, setGridOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const n = screens.length;
  const clampedIndex = Math.max(0, Math.min(activeIndex, n - 1));
  const lastManualChange = useRef(Date.now());
  const PAUSE_AFTER_MANUAL_MS = 3000;

  const go = useCallback(
    (delta: number) => {
      lastManualChange.current = Date.now();
      setActiveIndex((i) => Math.max(0, Math.min(n - 1, i + delta)));
    },
    [n]
  );

  useEffect(() => {
    if (!autoplay || n === 0) return;
    const interval = setInterval(() => {
      if (Date.now() - lastManualChange.current < PAUSE_AFTER_MANUAL_MS) return;
      setActiveIndex((i) => (i + 1) % n);
    }, autoplaySpeed * 1000);
    return () => clearInterval(interval);
  }, [autoplay, autoplaySpeed, n]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "g" && !gridOpen && !isFullscreen) {
        e.preventDefault();
        setGridOpen(true);
      }
      if (isFullscreen && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        go(e.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gridOpen, isFullscreen, go]);

  const viewerOffsetX =
    dockSide === "left" ? VIEWER_OFFSET : dockSide === "right" ? -VIEWER_OFFSET : 0;

  if (isFullscreen) {
    return (
      <FullscreenSlide
        screen={screens[clampedIndex]}
        index={clampedIndex}
        total={n}
      />
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col" style={{ color: "var(--foreground)" }}>
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl opacity-80">◉</span>
          <div>
            <h1 className="text-lg font-bold">Enterprise Dashboard</h1>
            <p className="text-xs opacity-70">Strategic Business Overview</p>
          </div>
          <span className="text-sm hidden sm:inline opacity-60">
            {clampedIndex + 1}/{n}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs hidden md:inline opacity-60">
            Sat, Feb 14, 2026
          </span>
          <button
            type="button"
            onClick={() => setGridOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-slate-300 hover:bg-white/20"
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-slate-300 hover:bg-white/20"
          >
            Fullscreen
          </button>
        </div>
      </header>

      <div className="relative flex-1 flex items-center justify-center">
        <RolodexViewer
          screens={screens}
          activeIndex={clampedIndex}
          onIndexChange={(i) => {
            lastManualChange.current = Date.now();
            setActiveIndex(i);
          }}
          viewerOffsetX={viewerOffsetX}
        />
      </div>

      <ControlPanel
        activeIndex={clampedIndex}
        total={n}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onDockChange={setDockSide}
        autoplayEnabled={autoplay}
        autoplaySpeedSeconds={autoplaySpeed}
        onAutoplayToggle={setAutoplay}
        onAutoplaySpeedChange={setAutoplaySpeed}
        onOpenGrid={() => setGridOpen(true)}
      />

      <aside
        className="fixed top-20 right-4 z-30"
        style={{ marginLeft: "auto" }}
      >
        <ThemeSwitcher />
      </aside>

      <GridModal
        open={gridOpen}
        onClose={() => setGridOpen(false)}
        screens={screens}
        activeIndex={clampedIndex}
        onSelectIndex={(i) => {
          setActiveIndex(i);
          lastManualChange.current = Date.now();
        }}
      />
    </main>
  );
}
