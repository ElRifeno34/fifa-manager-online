# Online Manager Hub

Build a front-end-only UI prototype for "Online Manager", a football (soccer) manager game for **mobile phones in landscape orientation**. This first iteration is about the **art direction and design system**, plus one screen: the **club hub**. The attached image is the Figma mockup of the hub — match it closely.

## Hard constraints
- Front-end only: **no backend, no Supabase, no auth, no database**. All data is hardcoded mock data in a `src/data/mock.ts` file.
- React + Vite + TypeScript + Tailwind + shadcn/ui.
- UI text in **French**.
- Target viewport: **844×390 landscape** (iPhone). Layout must also work from 667×375 up to 932×430. Respect safe areas with `env(safe-area-inset-left/right/bottom)` (the rail must not sit under the notch).
- In portrait, show a full-screen overlay: "Tournez votre téléphone" with a rotate icon.
- No real club logos: crests are circles with the club's initials in club colors.
- Touch targets ≥ 44px.

## Art direction
Sober and professional, inspired by the FIFA 16 Career Mode and PES 2021 Master League menus (inspiration only — no copied assets). Dark background, flat panels with a 1px border, small radii, a single vivid accent color, condensed uppercase titles, dense but readable data. Subtle transitions only (tile fade/slide-in on load, 150–250ms).

## Design tokens (expose as CSS variables and map them in tailwind.config)
Colors:
- `--color-bg-base` #0A0E13 · `--color-bg-surface` #111821 · `--color-bg-raised` #18212D · `--color-bg-overlay` #1F2A38 · `--color-bg-accent-subtle` #10332A
- `--color-border-default` #263243 · `--color-border-strong` #34445A
- `--color-text-primary` #F1F4F8 · `--color-text-secondary` #A3AFBF · `--color-text-muted` #677487 · `--color-text-on-accent` #06120D
- `--color-accent-default` #2BE3A0 · `--color-accent-hover` #5CEDB8
- `--color-status-success` #33D17A · `--color-status-warning` #FFB020 · `--color-status-danger` #FF4D5E · `--color-status-info` #4DA3FF
- Ratings: low (<60) #FF4D5E · mid (60–69) #FFB020 · good (70–79) #C9E34B · great (80+) #33D17A
Spacing: 2xs 2, xs 4, sm 8, md 12, lg 16, xl 24, 2xl 32 (px). Radius: sm 2, md 4, lg 8, full 999.

Typography (Google Fonts: **Barlow** and **Barlow Condensed**):
- Display/Score: Barlow Condensed Bold 40/100%, uppercase
- Title/L: Barlow Condensed SemiBold 24/110%, uppercase, letter-spacing 1%
- Title/M: Barlow Condensed SemiBold 18/115%, uppercase, letter-spacing 2%
- Label/S: Barlow Condensed Medium 12/120%, uppercase, letter-spacing 8%
- Body/M: Barlow Regular 14/140% · Body/S: Barlow Regular 12/140%
- Data/M: Barlow SemiBold 14 · Data/L: Barlow Bold 20 — use tabular numbers for all data.

## Components to build (in `src/components/om/`)
- `Button` — variants `primary` (accent fill, on-accent text) and `secondary` (transparent, strong border, primary text); Title/M text.
- `NavRail` + `NavItem` — 72px-wide left rail; item 72×56 with icon (lucide-react) + Label/S; active state = accent-subtle background, 3px accent bar on the left, accent icon, primary text. Items: Accueil (home), Effectif (users), Tactique (clipboard), Compétition (list-ordered), Presse (newspaper), Fil (message-circle).
- `Tile` — surface background, 1px border, radius md, padding md, Label/S header in secondary color; optional 2px accent top border.
- `RatingBadge` — 32×24, colored by level, Data/M in on-accent color.
- `StandingRow` — position, club, points; `highlight` state for the player's club (accent-subtle background, accent position number).
- `FormChips` — last 5 results as 14px squares: V (success), N (warning), D (danger).
- `Crest` — initials in a circle, club colors.

## Hub screen (route `/`) — see attached mockup
- Left: NavRail (Accueil active).
- Header: crest + "REAL MADRID" (Title/L) + "LaLiga · Journée 12 · Saison 2026/27 · 2e" (Body/S); right side "Budget transferts" label + "84,5 M€" (Data/L).
- Tiles row:
  1. **Prochain match** (accent top border): Real Madrid vs FC Barcelone, "Dim. 21:00", "Bernabéu", crests, form chips under each team, footer "El Clásico · Domicile · Forme sur 5 matchs".
  2. **Classement · LaLiga**: top 5 (FC Barcelone 29, Real Madrid 27 highlighted, Atlético 24, Villarreal 21, Athletic 20).
  3. Right column: **À la une · Marca** tile (headline "Le Real fait plier Valence", lead "Doublé de Mbappé, le Bernabéu rêve déjà du Clásico.") and **Fil · Tendances** tile ("#ElClásico" in accent, "48,2 k").
- Bottom bar: warning dot + "2 titulaires fatigués : Valverde (78 %), Rüdiger (71 %)", then buttons "Simuler" (secondary) and "Continuer" (primary), bottom-right.

## Design system page (route `/design-system`)
A landscape page showcasing every token (color swatches with names and hex, type ramp, spacing, radii) and every component in all its states. Add a small link to it from the hub (e.g. long-press or a discreet icon in the header is fine — keep it unobtrusive).

Keep the code clean and componentized: these components will be reused for all other screens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f47bb220-b1c6-4061-b2d6-4594a960bef9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
