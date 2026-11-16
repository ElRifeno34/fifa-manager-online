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
- The career treatment uses shared semantic CSS tokens, a stadium-backed rounded workspace and CareerShell navigation/date/continue header, preserving all route actions and session logic — updates every screen coherently without duplicating UI or native dependencies.
- CareerShell bypasses its chrome only for the exact home path, keeping the shared providers mounted — makes the start menu autonomous without changing career controls or session state.
