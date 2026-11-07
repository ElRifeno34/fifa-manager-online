import { describe, expect, it } from "vitest";
import { ATTRIBUTES } from "../schema.ts";
import { parseCsvLine } from "./csv.ts";
import {
  clubReputation,
  deriveAttributes,
  estimateMissingOverall,
  estimateOverall,
  estimatePotential,
  median,
  toPosition,
} from "./level.ts";
import { classifyHeading, parsePlayerName, parseSquad } from "./wikitext.ts";

describe("parseCsvLine", () => {
  it("handles quotes, commas and escaped quotes", () => {
    expect(parseCsvLine('"a,b",c,"d ""e"""')).toEqual(["a,b", "c", 'd "e"']);
  });
  it("keeps empty fields", () => {
    expect(parseCsvLine("a,,")).toEqual(["a", "", ""]);
  });
});

describe("parsePlayerName", () => {
  it("reads piped and plain links", () => {
    expect(parsePlayerName("[[Gavi (footballer)|Gavi]]")).toEqual({
      title: "Gavi (footballer)",
      name: "Gavi",
    });
    expect(parsePlayerName("[[Pedri]]")).toEqual({ title: "Pedri", name: "Pedri" });
  });
  it("drops the disambiguation from an unpiped link", () => {
    expect(parsePlayerName("[[Juanmi (footballer, born 1993)]]").name).toBe("Juanmi");
  });
  it("reads sortname and plain text", () => {
    expect(parsePlayerName("{{sortname|Iker|Muñoz}}").name).toBe("Iker Muñoz");
    expect(parsePlayerName("Jon Doe")).toEqual({ title: null, name: "Jon Doe" });
  });
});

describe("classifyHeading", () => {
  it("recognises squad groups", () => {
    expect(classifyHeading("First-team squad")).toBe("first-team");
    expect(classifyHeading("Current squad")).toBe("first-team");
    expect(classifyHeading("Other players under contract")).toBe("first-team");
    expect(classifyHeading("Reserve and Academy teams")).toBe("reserve");
    expect(classifyHeading("Out on loan")).toBe("loan-out");
  });
  it("recognises second teams under their local names", () => {
    for (const heading of [
      "Jong Genk",
      "SC Paderborn II",
      "Brentford B",
      "Young Reds Antwerp",
      "Under-23 squad",
      "Zebra Elites (second team)",
      "Juventus Next Gen and youth sector",
    ]) {
      expect(classifyHeading(heading)).toBe("reserve");
    }
  });
  it("ignores everything else", () => {
    expect(classifyHeading("Current technical staff")).toBeNull();
    expect(classifyHeading("Loans in")).toBeNull();
    expect(classifyHeading("Honours")).toBeNull();
  });
});

describe("parseSquad", () => {
  const wikitext = `
==Players==
===First-team squad===
{{Fs start}}
{{Fs player|no=1|nat=CZE|pos=GK|name=[[Jiří Letáček]]}}
{{Fs player|no=2|nat=TOG|pos=DF|name=[[Dakonam Djené]]|other={{small|[[Captain (association football)|captain]]}}}}
{{Fs player|no=|nat=NGA|pos=MF|name=[[Christantus Uche]]}}
{{Fs player|no=30|pos=FW|nat=ARG|name=[[Franco Mastantuono]]|other=at [[ACF Fiorentina|Fiorentina]] until 30 June 2027}}
{{Fs end}}
===Reserve team===
{{Fs player|no=27|nat=GAM|pos=FW|name=[[Ebrahima Drammeh Jaiteh|Ebrahima Drammeh]]}}
===Out on loan===
{{Fs player|no=|nat=ESP|pos=DF|name=[[Gorka Rivera]]|other=at [[Unionistas de Salamanca CF|Unionistas]] until 30 June 2027}}
==Honours==
{{Fs player|no=9|nat=ESP|pos=FW|name=[[Someone Else]]}}
`;
  const squad = parseSquad(wikitext);

  it("reads groups and skips tables outside squad sections", () => {
    expect(squad.map((p) => p.section)).toEqual([
      "first-team",
      "first-team",
      "first-team",
      "loan-out",
      "reserve",
      "loan-out",
    ]);
  });
  it("reads fields, whatever their order", () => {
    expect(squad[0]).toMatchObject({ number: 1, line: "GK", nationality: "CZE" });
    expect(squad[1]?.name).toBe("Dakonam Djené");
    expect(squad[2]?.number).toBeNull();
  });
  it("treats a player listed elsewhere as loaned out", () => {
    expect(squad[3]).toMatchObject({ name: "Franco Mastantuono", section: "loan-out" });
  });
});

describe("level", () => {
  const input = { position: "BU", age: 26, squad: "first-team" } as const;

  it("grows with market value", () => {
    const low = estimateOverall({ ...input, marketValueEur: 1e6 });
    const high = estimateOverall({ ...input, marketValueEur: 100e6 });
    expect(low).toBe(62);
    expect(high).toBe(88);
  });
  it("discounts youth and credits veterans at equal value", () => {
    const value = { marketValueEur: 20e6 };
    expect(estimateOverall({ ...input, ...value, age: 19 })).toBeLessThan(
      estimateOverall({ ...input, ...value }),
    );
    expect(estimateOverall({ ...input, ...value, age: 34 })).toBeGreaterThan(
      estimateOverall({ ...input, ...value }),
    );
  });
  it("falls back on the squad role without a value", () => {
    expect(estimateOverall({ ...input, marketValueEur: null })).toBe(62);
    expect(estimateOverall({ ...input, marketValueEur: null, squad: "reserve" })).toBe(52);
  });
  it("leaves room to grow only for young players", () => {
    expect(estimatePotential(70, 19)).toBeGreaterThan(75);
    expect(estimatePotential(70, 31)).toBe(70);
    expect(estimatePotential(70, null)).toBe(70);
  });
  it("maps positions and club value", () => {
    expect(toPosition("Left Winger", "FW")).toBe("AG");
    expect(toPosition(undefined, "GK")).toBe("GB");
    expect(clubReputation(86)).toBe(5);
    expect(clubReputation(65)).toBe(1);
  });
  it("places players without a value relative to their club", () => {
    expect(median([70, 60, 80])).toBe(70);
    expect(estimateMissingOverall(72, 10)).toBe(71);
    expect(estimateMissingOverall(72, 30)).toBe(58);
    expect(estimateMissingOverall(60, null)).toBe(56);
  });
});

describe("deriveAttributes", () => {
  const striker = {
    id: "tm-1",
    position: "BU",
    overall: 85,
    age: 26,
    heightCm: 182,
    performance: null,
  } as const;

  it("is deterministic and stays in range", () => {
    const attributes = deriveAttributes(striker);
    expect(attributes).toEqual(deriveAttributes(striker));
    for (const a of ATTRIBUTES) {
      expect(attributes[a]).toBeGreaterThanOrEqual(1);
      expect(attributes[a]).toBeLessThanOrEqual(20);
    }
  });
  it("shapes a striker and a keeper differently", () => {
    const keeper = deriveAttributes({ ...striker, position: "GB" });
    const forward = deriveAttributes(striker);
    expect(forward.finishing).toBeGreaterThan(forward.tackling);
    expect(keeper.reflexes).toBeGreaterThan(keeper.finishing);
    expect(forward.reflexes).toBeLessThan(keeper.reflexes);
  });
  it("rewards real scoring output", () => {
    const performance = { minutes: 3000, goals: 30, assists: 0, yellowCards: 0 };
    const prolific = deriveAttributes({ ...striker, performance });
    const quiet = deriveAttributes({ ...striker, performance: { ...performance, goals: 2 } });
    expect(prolific.finishing).toBeGreaterThan(quiet.finishing);
  });
});
