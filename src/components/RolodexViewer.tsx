"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Screen } from "@/lib/screens";
import clsx from "clsx";

const LOCKOUT_MS = 450;
const WHEEL_THRESHOLD = 80;

type RolodexViewerProps = {
  screens: Screen[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  viewerOffsetX?: number;
};

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const CARD_MAX_WIDTH = 720;
const CARD_MIN_HEIGHT = 420;

function cardVariant(offset: number) {
  if (offset === 0) {
    return {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 20,
      filter: "blur(0px)",
      transition: spring,
    };
  }
  if (Math.abs(offset) === 1) {
    return {
      x: offset * 280,
      scale: 0.88,
      opacity: 0.65,
      zIndex: 10,
      filter: "blur(1px)",
      transition: spring,
    };
  }
  return {
    x: offset * 440,
    scale: 0.74,
    opacity: 0.35,
    zIndex: 5,
    filter: "blur(2px)",
    transition: spring,
  };
}

export function RolodexViewer({
  screens,
  activeIndex,
  onIndexChange,
  viewerOffsetX = 0,
}: RolodexViewerProps) {
  const n = screens.length;
  const clampedIndex = Math.max(0, Math.min(activeIndex, n - 1));
  const [locked, setLocked] = useState(false);
  const wheelAccum = useRef(0);

  const go = useCallback(
    (delta: number) => {
      if (locked || n === 0) return;
      const next = Math.max(0, Math.min(clampedIndex + delta, n - 1));
      if (next !== clampedIndex) {
        onIndexChange(next);
        setLocked(true);
        setTimeout(() => setLocked(false), LOCKOUT_MS);
      }
    },
    [clampedIndex, locked, n, onIndexChange]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (locked || n === 0) return;
      wheelAccum.current += e.deltaY;
      if (wheelAccum.current >= WHEEL_THRESHOLD) {
        wheelAccum.current = 0;
        go(1);
        setLocked(true);
        setTimeout(() => setLocked(false), LOCKOUT_MS);
      } else if (wheelAccum.current <= -WHEEL_THRESHOLD) {
        wheelAccum.current = 0;
        go(-1);
        setLocked(true);
        setTimeout(() => setLocked(false), LOCKOUT_MS);
      }
    },
    [go, locked, n]
  );

  const visibleRange = 2;
  const indices = Array.from({ length: n }, (_, i) => i).filter(
    (i) => Math.abs(i - clampedIndex) <= visibleRange
  );

  return (
    <div
      className="relative w-full flex-1 flex items-center justify-center overflow-hidden"
      style={{ perspective: "1200px" }}
      onWheel={onWheel}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: `translateX(${viewerOffsetX}px)`,
          width: `min(92vw, ${CARD_MAX_WIDTH + 48}px)`,
          minHeight: CARD_MIN_HEIGHT + 48,
        }}
      >
        <AnimatePresence initial={false}>
          {indices.map((i) => {
            const offset = i - clampedIndex;
            const screen = screens[i];
            const isActive = offset === 0;
            return (
              <motion.div
                key={screen.id}
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={cardVariant(offset)}
                style={{
                  width: "100%",
                  maxWidth: CARD_MAX_WIDTH,
                  originX: "center",
                  originY: "center",
                }}
              >
                <div
                  className={clsx(
                    "w-full rounded-2xl overflow-hidden border shadow-2xl",
                    "bg-slate-900/95 border-white/10 backdrop-blur-sm"
                  )}
                  style={{
                    minHeight: CARD_MIN_HEIGHT,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="relative h-52 sm:h-60 w-full shrink-0 overflow-hidden">
                    <img
                      src={screen.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 30%, rgba(15,23,42,0.85) 85%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-md"
                        style={{
                          background: "var(--accent-muted)",
                          color: "var(--accent)",
                        }}
                      >
                        {screen.category}
                      </span>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--accent)] text-slate-900"
                        >
                          ACTIVE
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col min-h-[200px]">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {screen.title}
                    </h2>
                    <p className="text-sm text-slate-300 flex-1 line-clamp-3">
                      {screen.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                      <span>DATE {screen.date}</span>
                      <span>STATUS {screen.status}</span>
                      <span>PRIORITY {screen.priority}</span>
                    </div>
                    <div className="mt-3 text-center text-sm text-slate-500">
                      {i + 1}/{n}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
