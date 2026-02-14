"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Screen } from "@/lib/screens";
import clsx from "clsx";

type GridModalProps = {
  open: boolean;
  onClose: () => void;
  screens: Screen[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
};

export function GridModal({
  open,
  onClose,
  screens,
  activeIndex,
  onSelectIndex,
}: GridModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "g") {
        e.preventDefault();
        onClose();
      }
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-4 z-50 flex flex-col rounded-2xl border overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              borderColor: "var(--glass-border)",
              maxWidth: 900,
              maxHeight: 600,
              margin: "auto",
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">⊞</span>
                <h2 className="text-lg font-semibold text-white">All Slides</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-slate-300 hover:bg-white/20"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-slate-400 px-4 pb-2">
              Click any slide to navigate • Press Esc or G to close
            </p>
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {screens.map((screen, i) => (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => {
                      onSelectIndex(i);
                      onClose();
                    }}
                    className={clsx(
                      "rounded-xl border-2 overflow-hidden text-left transition-all",
                      "hover:border-[var(--accent)] hover:scale-[1.02]",
                      activeIndex === i
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                        : "border-white/20"
                    )}
                  >
                    <div className="h-24 w-full overflow-hidden bg-slate-800">
                      <img
                        src={screen.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-white/5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: "var(--accent-muted)",
                          color: "var(--accent)",
                        }}
                      >
                        {screen.category}
                      </span>
                      <div className="text-sm font-semibold text-white mt-1 truncate">
                        {screen.title}
                      </div>
                      <div className="text-xs text-slate-500">Slide {i + 1}</div>
                      {activeIndex === i && (
                        <span
                          className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--accent)",
                            color: "var(--foreground)",
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
