import { useEffect, useRef, type CSSProperties } from "react";
import { IMAGES } from "@/lib/season";

const BEAMS = [
  { left: "-6vw", from: "-18deg", to: "8deg", dur: "31s", delay: "-4s" },
  { left: "30vw", from: "-10deg", to: "16deg", dur: "39s", delay: "-17s" },
  { left: "52vw", from: "-14deg", to: "12deg", dur: "35s", delay: "-9s" },
];

/** Deterministic pseudo-random values so server and client markup match. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    x: `${Math.round(r(1) * 96)}%`,
    y: `${Math.round(30 + r(2) * 65)}%`,
    s: `${(2 + r(3) * 2.5).toFixed(1)}px`,
    o: (0.35 + r(4) * 0.4).toFixed(2),
    dur: `${Math.round(22 + r(5) * 24)}s`,
    delay: `-${Math.round(r(6) * 40)}s`,
    dx: `${Math.round((r(7) - 0.5) * 8)}vw`,
  };
});

/**
 * Stadium photo with a slow Ken Burns, floodlight beams, drifting particles and a
 * club-tinted sheen. Everything animated uses transform/opacity only, pauses with
 * the tab and is hidden by `html[data-bg="static"]` or prefers-reduced-motion.
 */
export function AppBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sync = () => {
      root.dataset.bgPaused = String(document.hidden);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--pitch-fallback)" }}
    >
      <div
        className="bg-photo absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGES.background}), url(${IMAGES.backgroundBlurred})`,
        }}
      />
      <div className="absolute inset-0" style={{ background: "var(--veil)" }} />

      <div className="bg-motion absolute inset-0">
        <div
          className="bg-sheen"
          style={
            {
              left: "-30vmax",
              top: "-40vmax",
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--club-primary) 22%, transparent), transparent)",
              "--dur": "38s",
            } as CSSProperties
          }
        />
        <div
          className="bg-sheen"
          style={
            {
              right: "-35vmax",
              bottom: "-45vmax",
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--club-secondary) 20%, transparent), transparent)",
              "--dur": "46s",
              "--delay": "-12s",
            } as CSSProperties
          }
        />

        {BEAMS.map((b) => (
          <div
            key={b.left}
            className="bg-beam"
            style={
              {
                left: b.left,
                "--from": b.from,
                "--to": b.to,
                "--dur": b.dur,
                "--delay": b.delay,
              } as CSSProperties
            }
          />
        ))}

        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="bg-particle"
            style={
              {
                "--x": p.x,
                "--y": p.y,
                "--s": p.s,
                "--o": p.o,
                "--dur": p.dur,
                "--delay": p.delay,
                "--dx": p.dx,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
