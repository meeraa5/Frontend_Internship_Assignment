# Stackbirds Rolodex

Rolodex-style slide viewer with step-based navigation and a draggable, dockable control panel. Next.js, TypeScript, Tailwind, Framer Motion.

```bash
npm install && npm run dev
```

---

## How Rolodex scroll + snap was implemented

- **Single index**: One state value `activeIndex` (0..n-1). All navigation (wheel, arrows, buttons, grid) updates this; cards are rendered by offset `i - activeIndex`.
- **Step-based wheel**: Wheel/trackpad `deltaY` is accumulated in a ref. When the sum crosses a threshold (80px), the index moves by ±1 and the accumulator resets. This avoids free-scrolling and guarantees one card per gesture.
- **Lockout**: After each index change, a ~450ms lockout prevents further wheel/key/button steps so the spring animation can finish without double-advances.
- **Depth animation**: Framer Motion `animate` variants are keyed by offset: active card (offset 0) gets scale 1, opacity 1, x 0; neighbors get smaller scale, lower opacity, and x ±280 / ±440. Spring transition for smooth snap.
- **Bounds**: Index is clamped to `[0, n-1]` on every change so it never goes out of range.

---

## How drag + dock snapping was implemented

- **Dock zones**: Two zones are computed from the viewport: left (padding from left edge, vertically centered) and right (padding from right edge). Each zone has a target (x, y) for the panel’s top-left corner, using the panel’s current width and height so it fits.
- **On drag end**: The panel’s current (x, y) is compared to both zone centers. The zone whose center is closest (by Euclidean distance) is chosen, and the panel is animated to that zone’s (x, y) with a Framer Motion spring.
- **Constraining**: Before snapping, the position is clamped so the panel stays fully inside the viewport (no negative x/y, and x + width ≤ window width, etc.). That way the panel can’t be dragged off-screen.
- **Viewer offset**: The main page keeps a “dock side” (left/right). When the panel is docked left, the rolodex viewer is shifted right (and vice versa) so the active card isn’t covered.
- **Resize and widget**: Panel supports diagonal resize (bottom-right handle) and a collapsed “widget” mode. Dock zones and constraints use the current effective size (widget size when collapsed, panel size when expanded).

---

## Tradeoffs and what I’d improve next

**Tradeoffs**

- **Scroll**: Fixed threshold + lockout instead of velocity or gesture-based logic. Simple and predictable, but a fast flick doesn’t advance multiple cards; touch/swipe isn’t handled.
- **Docking**: Only left and right zones; no corners or bottom docking. Panel position is restored on window resize using the same dock side.
- **Hydration**: Panel size and collapsed state are read from `localStorage` only after mount so server and client first paint match; there can be a brief flash before the saved layout applies.
- **Accessibility**: Keyboard (arrows, G for grid) and mouse work; there’s no live region for slide changes or reduced-motion handling.

**Improvements I’d do next**

1. **Velocity-aware scroll**: Use wheel delta and/or timing to allow “faster scroll = skip ahead” or a small amount of inertia.
2. **Touch support**: Swipe left/right to change slides with the same step + snap behavior.
3. **More dock options**: Optional bottom-left / bottom-right zones and maybe a “remember custom position” mode.
4. **A11y**: `aria-live` for current slide, `prefers-reduced-motion` to shorten or disable spring animations, and clearer focus management in the grid modal and control panel.
