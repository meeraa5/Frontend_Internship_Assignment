"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import clsx from "clsx";

const DOCK_PADDING = 24;
const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const MIN_HEIGHT = 220;
const MAX_HEIGHT = 560;
const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 380;
const STORAGE_KEY = "stackbirds-control-panel-size";
const STORAGE_KEY_COLLAPSED = "stackbirds-control-panel-collapsed";
const WIDGET_WIDTH = 56;
const WIDGET_HEIGHT = 40;

export type DockSide = "left" | "right";

type ControlPanelProps = {
  activeIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onDockChange?: (side: DockSide) => void;
  autoplayEnabled: boolean;
  autoplaySpeedSeconds: number;
  onAutoplayToggle: (enabled: boolean) => void;
  onAutoplaySpeedChange: (seconds: number) => void;
  onOpenGrid?: () => void;
};

const SPEED_OPTIONS = [2, 3, 5, 7] as const;

function loadSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT };
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const { w, h } = JSON.parse(s) as { w: number; h: number };
      return {
        w: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w)),
        h: Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h)),
      };
    }
  } catch {
    /* ignore */
  }
  return { w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT };
}

function saveSize(w: number, h: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ w, h }));
  } catch {
    /* ignore */
  }
}

function getDockZones(
  clientWidth: number,
  clientHeight: number,
  panelW: number,
  panelH: number
) {
  const left = {
    x: DOCK_PADDING,
    y: Math.max(DOCK_PADDING, (clientHeight - panelH) / 2),
    side: "left" as DockSide,
  };
  const right = {
    x: clientWidth - DOCK_PADDING - panelW,
    y: Math.max(DOCK_PADDING, (clientHeight - panelH) / 2),
    side: "right" as DockSide,
  };
  return { left, right };
}

function nearestDock(
  x: number,
  y: number,
  clientWidth: number,
  clientHeight: number,
  panelW: number,
  panelH: number
): { x: number; y: number; side: DockSide } {
  const { left, right } = getDockZones(clientWidth, clientHeight, panelW, panelH);
  const dLeft = (x - left.x) ** 2 + (y - left.y) ** 2;
  const dRight = (x - right.x) ** 2 + (y - right.y) ** 2;
  if (dLeft <= dRight) return { ...left, side: "left" };
  return { ...right, side: "right" };
}

export function ControlPanel({
  activeIndex,
  total,
  onPrev,
  onNext,
  onDockChange,
  autoplayEnabled,
  autoplaySpeedSeconds,
  onAutoplayToggle,
  onAutoplaySpeedChange,
  onOpenGrid,
}: ControlPanelProps) {
  const [size, setSize] = useState(() => ({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT }));
  const { w: panelW, h: panelH } = size;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const effectiveW = isCollapsed ? WIDGET_WIDTH : panelW;
  const effectiveH = isCollapsed ? WIDGET_HEIGHT : panelH;

  useEffect(() => {
    const saved = loadSize();
    setSize(saved);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      setIsCollapsed(raw === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setIsCollapsed(v);
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(v));
    } catch {
      /* ignore */
    }
  }, []);

  const [dock, setDock] = useState<{ x: number; y: number; side: DockSide }>({
    x: DOCK_PADDING,
    y: 120,
    side: "left",
  });

  const x = useMotionValue(dock.x);
  const y = useMotionValue(dock.y);
  const isDragging = useRef(false);
  const [isResizing, setIsResizing] = useState(false);
  const progress = total > 0 ? ((activeIndex + 1) / total) * 100 : 0;

  const updateDockPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const { left } = getDockZones(window.innerWidth, window.innerHeight, effectiveW, effectiveH);
    const initial = { ...left, side: "left" as DockSide };
    x.set(initial.x);
    y.set(initial.y);
    setDock(initial);
  }, [effectiveW, effectiveH, x, y]);

  useEffect(() => {
    updateDockPosition();
  }, [updateDockPosition]);

  const constrain = useCallback(() => {
    if (typeof window === "undefined") return;
    const wx = x.get();
    const wy = y.get();
    const nx = Math.max(0, Math.min(window.innerWidth - effectiveW, wx));
    const ny = Math.max(0, Math.min(window.innerHeight - effectiveH, wy));
    x.set(nx);
    y.set(ny);
  }, [x, y, effectiveW, effectiveH]);

  const snapToNearest = useCallback(() => {
    if (typeof window === "undefined") return;
    const wx = x.get();
    const wy = y.get();
    const { x: dx, y: dy, side } = nearestDock(
      wx,
      wy,
      window.innerWidth,
      window.innerHeight,
      effectiveW,
      effectiveH
    );
    animate(x, dx, { type: "spring", stiffness: 400, damping: 35 });
    animate(y, dy, { type: "spring", stiffness: 400, damping: 35 });
    setDock({ x: dx, y: dy, side });
    onDockChange?.(side);
  }, [x, y, effectiveW, effectiveH, onDockChange]);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined" || isDragging.current || isResizing) return;
      const { left, right } = getDockZones(
        window.innerWidth,
        window.innerHeight,
        effectiveW,
        effectiveH
      );
      const target = dock.side === "left" ? left : right;
      x.set(target.x);
      y.set(target.y);
      setDock({ ...target, side: dock.side });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dock.side, effectiveW, effectiveH, x, y, isResizing]);

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const lastSizeRef = useRef({ w: panelW, h: panelH });

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: panelW,
        startH: panelH,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panelW, panelH]
  );

  useEffect(() => {
    lastSizeRef.current = { w: panelW, h: panelH };
  }, [panelW, panelH]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const newW = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, resizeRef.current.startW + dx)
      );
      const newH = Math.max(
        MIN_HEIGHT,
        Math.min(MAX_HEIGHT, resizeRef.current.startH + dy)
      );
      lastSizeRef.current = { w: newW, h: newH };
      setSize({ w: newW, h: newH });
    };
    const onPointerUp = () => {
      if (resizeRef.current) {
        const { w: newW, h: newH } = lastSizeRef.current;
        saveSize(
          Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newW)),
          Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newH))
        );
        resizeRef.current = null;
      }
      setIsResizing(false);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed z-50 touch-none"
      style={{
        x,
        y,
        width: effectiveW,
        minHeight: effectiveH,
      }}
      drag={!isResizing}
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={() => {
        isDragging.current = false;
        constrain();
        snapToNearest();
      }}
    >
      {isCollapsed ? (
        <div
          className="h-full w-full rounded-xl border shadow-xl backdrop-blur-xl flex items-center justify-center gap-1.5 px-2 cursor-grab active:cursor-grabbing"
          style={{
            background: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
          }}
          title="Drag to move • Click arrow to expand"
        >
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--foreground)" }}>
            {activeIndex + 1}/{total}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(false);
            }}
            className="rounded p-0.5 opacity-70 hover:opacity-100 hover:text-[var(--accent)] hover:bg-black/10"
            style={{ color: "var(--foreground)" }}
            title="Expand panel"
          >
            <span className="text-xs">▶</span>
          </button>
        </div>
      ) : (
      <div
        className="h-full w-full flex flex-col rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: "var(--glass-bg)",
          borderColor: "var(--glass-border)",
          minHeight: panelH,
        }}
      >
        <div className="flex-1 flex flex-col p-4 select-none overflow-auto min-h-0" style={{ color: "var(--foreground)" }}>
          <div className="flex items-center gap-2 mb-3 opacity-70 cursor-grab active:cursor-grabbing">
            <span className="text-lg">⊞</span>
            <span className="text-xs">Drag to reposition</span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded p-1 hover:opacity-100"
              style={{ color: "var(--muted-fg)" }}
              title="Collapse to widget"
            >
              <span className="text-xs">−</span>
            </button>
          </div>

          <div className="mb-3">
            <div className="text-sm font-semibold">
              {activeIndex + 1} of {total}{" "}
              <span className="opacity-70">CURRENT SLIDE</span>
            </div>
            <div className="h-2 mt-1 rounded-full overflow-hidden" style={{ background: "var(--muted-bg)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            <div className="text-xs mt-0.5 opacity-60">
              Progress {Math.round(progress)}%
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-80">Auto-Play</span>
              <button
                type="button"
                onClick={() => onAutoplayToggle(!autoplayEnabled)}
                className={clsx(
                  "w-10 h-6 rounded-full transition-colors",
                  autoplayEnabled ? "bg-[var(--accent)]" : ""
                )}
                style={!autoplayEnabled ? { background: "var(--muted-bg)" } : undefined}
              >
                <motion.span
                  className="block w-4 h-4 rounded-full bg-white shadow mt-0.5 ml-0.5"
                  animate={{ x: autoplayEnabled ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onAutoplaySpeedChange(s)}
                className={clsx(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  autoplaySpeedSeconds === s
                    ? "bg-[var(--accent)] text-white"
                    : "opacity-90 hover:opacity-100"
                )}
                style={autoplaySpeedSeconds !== s ? { background: "var(--muted-bg)", color: "var(--foreground)" } : undefined}
                >
                  {s}s
                </button>
              ))}
            </div>
            <div className="text-xs mt-0.5 opacity-60">
              {autoplaySpeedSeconds}s per slide
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={activeIndex <= 0}
              className="flex-1 py-2 rounded-lg font-medium text-sm disabled:cursor-not-allowed transition-colors"
              style={{
                background: activeIndex <= 0 ? "var(--muted-bg)" : "var(--accent-muted)",
                color: activeIndex <= 0 ? "var(--muted-fg)" : "var(--accent)",
              }}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={activeIndex >= total - 1}
              className="flex-1 py-2 rounded-lg font-medium text-sm disabled:cursor-not-allowed transition-colors"
              style={{
                background: activeIndex >= total - 1 ? "var(--muted-bg)" : "var(--accent)",
                color: activeIndex >= total - 1 ? "var(--muted-fg)" : "white",
              }}
            >
              Next
            </button>
          </div>

          <div className="text-xs space-y-0.5 opacity-70">
            <div>Navigate: ← → keys</div>
            <div>Scroll: wheel (one step)</div>
            {onOpenGrid && (
              <button
                type="button"
                onClick={onOpenGrid}
                className="text-[var(--accent)] hover:underline mt-1"
              >
                Grid view (G)
              </button>
            )}
          </div>
        </div>

        <div
          className="h-6 shrink-0 flex items-center justify-end pr-1 pb-1 cursor-nwse-resize"
          onPointerDown={onResizePointerDown}
          title="Drag to resize panel"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-slate-500 hover:text-slate-400"
          >
            <path
              d="M14 14L10 10M14 14V10M14 14H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      )}
    </motion.div>
  );
}
