export type SquadSection = "first-team" | "reserve" | "loan-out";

export interface WikiPlayer {
  /** Article title, or null when the player has no linked article. */
  title: string | null;
  name: string;
  number: number | null;
  /** GK, DF, MF or FW. */
  line: string;
  nationality: string;
  section: SquadSection;
}

/** Index just after the template opened before `start`, honouring nested {{ }}. */
function templateEnd(text: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < text.length && depth > 0) {
    if (text.startsWith("{{", i)) {
      depth++;
      i += 2;
    } else if (text.startsWith("}}", i)) {
      depth--;
      i += 2;
    } else i++;
  }
  return i;
}

/** Splits template parameters on top-level pipes, leaving links and nested templates whole. */
function templateParams(body: string): Record<string, string> {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < body.length; i++) {
    const pair = body.slice(i, i + 2);
    if (pair === "{{" || pair === "[[") {
      depth++;
      current += pair;
      i++;
    } else if (pair === "}}" || pair === "]]") {
      depth--;
      current += pair;
      i++;
    } else if (body[i] === "|" && depth === 0) {
      parts.push(current);
      current = "";
    } else current += body[i];
  }
  parts.push(current);

  const params: Record<string, string> = {};
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq > 0) params[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim();
  }
  return params;
}

export function parsePlayerName(raw: string): { title: string | null; name: string } {
  const cleaned = raw.replace(/<ref[\s\S]*?(<\/ref>|\/>)/g, "").trim();
  const link = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/.exec(cleaned);
  if (link?.[1]) {
    const title = link[1].trim();
    return { title, name: (link[2] ?? title.replace(/\s*\(.*\)$/, "")).trim() };
  }
  const sortname = /\{\{\s*sortname\s*\|([^|}]+)\|([^|}]+)(?:\|([^|}]*))?/i.exec(cleaned);
  if (sortname?.[1] && sortname[2]) {
    const name = `${sortname[1].trim()} ${sortname[2].trim()}`;
    const target = sortname[3]?.trim();
    return { title: target && target !== "nolink" ? target : name, name };
  }
  return { title: null, name: cleaned.replace(/\{\{[^}]*\}\}/g, "").trim() };
}

/** Second teams go by many names: Jong Genk, Paderborn II, Brentford B, Primavera, Next Gen… */
const RESERVE_HEADING =
  /reserve|academy|youth|second team|\bb( team)?$|\bii$|\bu-?\d{2}\b|under[- ]\d{2}|\bjong\b|young reds|sl16|primavera|next gen|futuro|\beds\b|castilla|mestalla/;

/** Maps a section heading to a squad group, or null for sections that are not squad lists. */
export function classifyHeading(heading: string): SquadSection | null {
  const h = heading.toLowerCase();
  if (/\bloans? in\b|staff|retired|former|records|transfers?\b/.test(h)) return null;
  if (/loan/.test(h)) return "loan-out";
  if (RESERVE_HEADING.test(h)) return "reserve";
  if (/squad|first.team|players|under contract|roster/.test(h)) return "first-team";
  return null;
}

export interface KitColors {
  primary: string;
  secondary: string;
}

/** Reads the home kit of a club infobox. Colours written as names are not handled. */
export function parseKitColors(wikitext: string): KitColors | null {
  const color = (key: string) => {
    const match = new RegExp(`\\|\\s*${key}\\s*=\\s*#?([0-9a-f]{6})\\b`, "i").exec(wikitext);
    return match?.[1] ? `#${match[1].toUpperCase()}` : null;
  };
  const primary = color("body1");
  if (!primary) return null;
  const others = [color("shorts1"), color("socks1"), color("leftarm1")];
  const secondary = others.find((c) => c && c !== primary);
  return { primary, secondary: secondary ?? (primary === "#FFFFFF" ? "#121A23" : "#FFFFFF") };
}

/** Reads every squad table of a club or season page. */
export function parseSquad(wikitext: string): WikiPlayer[] {
  const players: WikiPlayer[] = [];
  const seen = new Set<string>();
  const token = /^={2,6}\s*(.+?)\s*={2,6}\s*$|\{\{\s*(?:fs|football squad) player\s*\|/gim;
  let section: SquadSection | null = null;

  for (let match = token.exec(wikitext); match; match = token.exec(wikitext)) {
    if (match[1] !== undefined) {
      section = classifyHeading(match[1]);
      continue;
    }
    const start = match.index + match[0].length;
    const end = templateEnd(wikitext, start);
    token.lastIndex = end;
    if (!section) continue;

    const params = templateParams(wikitext.slice(start, end - 2));
    const { title, name } = parsePlayerName(params.name ?? "");
    if (!name) continue;
    const key = title ?? name;
    if (seen.has(key)) continue;
    seen.add(key);

    const number = Number.parseInt(params.no ?? "", 10);
    const onLoanElsewhere = /^\s*(\{\{small\|)?\s*at \[\[/i.test(params.other ?? "");
    players.push({
      title,
      name,
      number: Number.isNaN(number) ? null : number,
      line: (params.pos ?? "").toUpperCase(),
      nationality: (params.nat ?? "").toUpperCase(),
      section: onLoanElsewhere ? "loan-out" : section,
    });
  }
  return players;
}
