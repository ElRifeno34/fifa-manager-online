import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = join(root, "data/packs");
const outputDir = join(root, "apps/web/public/packs");

if (!existsSync(sourceDir)) {
  console.warn(
    "Aucun pack local. Génère-les avec « npm run pack:build » avant d'ouvrir les effectifs réels.",
  );
  process.exit(0);
}

mkdirSync(outputDir, { recursive: true });
const catalog = [];
for (const filename of readdirSync(sourceDir).filter(
  (name) => name.endsWith(".json") && !name.endsWith(".report.json"),
)) {
  const source = join(sourceDir, filename);
  const pack = JSON.parse(readFileSync(source, "utf8"));
  copyFileSync(source, join(outputDir, filename));
  catalog.push({
    id: pack.meta.id,
    name: pack.meta.name,
    season: pack.meta.season,
    league: pack.league.name,
    country: pack.league.country,
    clubs: pack.clubs.length,
    players: pack.players.length,
    fixtures: pack.fixtures.length,
  });
}
catalog.sort((a, b) => a.name.localeCompare(b.name, "fr"));
writeFileSync(join(outputDir, "catalog.json"), JSON.stringify(catalog));
console.log(`${catalog.length} packs prêts pour le front-end.`);

const flagSourceDir = join(root, "node_modules/flag-icons/flags/4x3");
const flagOutputDir = join(root, "apps/web/public/flags");
const fifaToIso2 = JSON.parse(
  readFileSync(join(root, "apps/web/src/lib/fifa-to-iso2.json"), "utf8"),
);
mkdirSync(flagOutputDir, { recursive: true });
for (const region of new Set(Object.values(fifaToIso2))) {
  const flag = `${region.toLowerCase()}.svg`;
  const flagSource = join(flagSourceDir, flag);
  if (existsSync(flagSource)) copyFileSync(flagSource, join(flagOutputDir, flag));
}
console.log("Drapeaux de nationalité prêts pour le front-end.");
