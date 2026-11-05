type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

function toHex(rgb: RGB) {
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear mix: 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return toHex(ca.map((v, i) => v * (1 - t) + cb[i] * t) as RGB);
}

/** Moves `color` toward `toward` until it reaches `min` contrast on `bg`. */
export function ensureContrast(color: string, bg: string, min: number, toward: string) {
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const candidate = mix(color, toward, t);
    if (contrast(candidate, bg) >= min) return candidate;
  }
  return toward;
}

/** First candidate that reaches `min` contrast on `bg`, otherwise `fallback`. */
export function firstReadable(candidates: string[], bg: string, min: number, fallback: string) {
  return candidates.find((c) => contrast(c, bg) >= min) ?? fallback;
}
