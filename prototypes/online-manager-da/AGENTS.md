<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Front-end only prototype: all data lives in src/data/mock.ts (no backend) — scope of this iteration.
- Reusable v0 game UI components live in src/components/om/ and use the semantic tokens and font utilities from src/styles.css — preserves the supplied reference consistently.
- Pure club/color utilities generate static theme CSS; the root shell provides club and toast contexts, without stage scaling — preserves SSR and the reference rem-based layout.
- Persist only presentation preferences in localStorage; game data remains hardcoded — keeps this iteration front-end only.
- Use SectionHeader for programme panels and InboxPanel for hub message previews — keeps panel hierarchy consistent without duplicating header styling.
- Career V1 uses distinct TanStack leaf routes in a shared CareerShell and a memory-only CareerProvider; all scenario data stays in mock.ts — enables linked demonstrations without persistence or a game engine.
- Career panels use the shared unframed, indexed Panel primitive and graphical Flag primitive — keeps Material page hierarchy consistent and avoids nested cards or emoji nationality rendering.
- CareerShell owns compact labeled nine-destination navigation with focus shortcuts and an all-destinations Plus menu; HubView composes session-aware match preparation, news, standings and agenda — keeps the mobile manager workflow explicit without duplicating state.
- CareerShell bypasses its chrome only for the exact home path, keeping the shared providers mounted — makes the start menu autonomous without changing career controls or session state.
- Live-match replay is a local journal viewer and MatchPitch reads fixed illustrative positions from mock data — adds match inspection without simulating tracking or mutating career progression.
- Shared career content styles are scoped to CareerShell's career-screen in screens.css, with narrow-screen stacking and dense accessible controls — keeps all leaf screens coherent without changing the autonomous home or hub.
- The all-pages navigation uses Radix Dialog for focus containment, Escape and trigger restoration — preserves accessible mobile navigation without custom focus traps.
- Tactical advisor inputs are memory-only and generation remains explicitly unavailable until Cloud is enabled from the main chat — prevents exposing gateway credentials or fabricating AI results in the draft.
