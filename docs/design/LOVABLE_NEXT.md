# Prochain message pour Lovable

État au 2026-11-05 : Lovable a commencé à porter la v3 de v0 (voir [HUB_V3.md](HUB_V3.md)) puis
s'est arrêté, faute de crédits, avec des **erreurs de build** (notamment `calendar-panel.tsx`).
Son script de portage a aussi modifié l'identité v3 (papier gris froid, espacement des lettres
supprimé, badges gris…). Message à envoyer tel quel au retour des crédits :

---

Yes, please continue and finish. In this order:

1. **Fix the build errors** (calendar-panel.tsx and any others) so the preview runs.

2. **Revert the deviations from v3** — Step 1 was "port exactly"; these changes in the port script
   altered the identity and must be undone (use the values from v0-v3-source.md):
   - Paper surface back to `#F5F3EF` and raised to `#EBE8E2` (not the cool greys `#F4F5F6` /
     `#E9ECEF`); keep `--ink-3` only if the AA fix requires it.
   - Label letter-spacing back to `0.08em` (uppercase condensed labels need the tracking).
   - Badges back to **red** squares with white mono numbers (`bg-danger` / `text-inverse`), not grey.
   - News meta line back in **club secondary/accent** (`text-club-accent-dark`), headline style as
     in v3.
   - The "Nouveau" tag on social posts back to the club secondary fill.
   - Keep the rem-scaling root font-size from v3 (`clamp(11px, min(1.25vw, 2.2222vh), 24px)` with
     the 16px override on `short:`), so 1920×1080 scales up like v3; don't hard-set 16px everywhere.
   - Don't wrap every `<button>` in a custom Button if it changes v3's styling; apply interaction
     states via CSS instead.
   - The coarse-pointer landscape layout you added (2-column grid in the left column) changes the v3
     layout — remove it; keep v3's `short:` layout and just ensure 44px touch targets where it fits.

3. **Then complete Step 2** (UI/UX improvements) on top of the exact v3 look: Avancer readiness line
   - confirm dialog, "Voir tout →" on every panel header, focus/hover/pressed states, Ctrl/⌘+K
     command palette with a top-bar search button, shared inbox read state, skeletons and empty
     states, skip link, AA contrast via derived tones, club-dependent next opponent (already started
     — keep it).

4. **Verify** with screenshots (1920×1080, 1280×720, 844×390, 667×375; Real Madrid light,
   FC Barcelone dark; `/messagerie`, `/medias/fil`, command palette, confirm dialog), confirm the left
   column fits without scrolling, and list anything not verified.
