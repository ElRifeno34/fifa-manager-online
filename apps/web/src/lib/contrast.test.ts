import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CLUBS, SCRIM, SURFACE, clubTokens } from "./clubs";
import { contrast } from "./color";

// WCAG AA: 4.5:1 for normal text, 3:1 for large text and non-text marks (rules, bars).
describe.each(CLUBS)("$name palette", (club) => {
  it.each(["light", "dark"] as const)("stays readable in %s mode", (mode) => {
    const t = clubTokens(club, mode);
    const surface = SURFACE[mode];
    expect(contrast(t.onPrimary, t.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.onSecondary, t.secondary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.ink, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentDark, SCRIM)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.accentOnPrimary, t.primary)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.rule, surface)).toBeGreaterThanOrEqual(3);
  });
});

/** Reads `--name: #hex;` from the first rule block that starts with `selector {`. */
function token(css: string, selector: string, name: string) {
  const block = css.slice(css.indexOf(`${selector} {`));
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`--${name} missing in ${selector}`);
  return match[1];
}

describe("theme tokens", () => {
  const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

  it.each([":root", ".dark"])("keeps body text readable on sheets in %s", (selector) => {
    const surface = token(css, selector, "surface");
    const raised = token(css, selector, "raised");
    for (const ink of ["ink", "ink-2", "ink-3"]) {
      expect(contrast(token(css, selector, ink), surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token(css, selector, ink), raised)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps white badge numbers readable on the danger red", () => {
    expect(contrast("#FFFFFF", token(css, ":root", "danger"))).toBeGreaterThanOrEqual(4.5);
  });
});
