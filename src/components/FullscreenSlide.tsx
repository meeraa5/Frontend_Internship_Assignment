"use client";

import type { Screen } from "@/lib/screens";

type FullscreenSlideProps = {
  screen: Screen;
  index: number;
  total: number;
};

export function FullscreenSlide({ screen, index, total }: FullscreenSlideProps) {
  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-slate-950">
      <div className="flex-1 relative flex flex-col min-h-0">
        <div className="absolute inset-0">
          <img
            src={screen.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 20%, rgba(15,23,42,0.92) 75%)",
            }}
          />
        </div>
        <div className="relative flex-1 flex flex-col justify-end p-8 md:p-12 max-w-4xl mx-auto w-full">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-md w-fit mb-2"
            style={{
              background: "var(--accent-muted)",
              color: "var(--accent)",
            }}
          >
            {screen.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {screen.title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            {screen.description}
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
            <span>DATE {screen.date}</span>
            <span>STATUS {screen.status}</span>
            <span>PRIORITY {screen.priority}</span>
          </div>
          <div className="mt-6 text-slate-500 text-sm">
            {index + 1} / {total}
          </div>
        </div>
      </div>
    </div>
  );
}
