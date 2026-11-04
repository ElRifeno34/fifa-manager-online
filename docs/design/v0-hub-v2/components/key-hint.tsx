import { HINTS } from '@/lib/mock-data'

export function KeyHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded bg-inverse/15 px-1.5 py-0.5 font-sans text-xs font-semibold leading-none text-inverse">
        {keys}
      </kbd>
      <span className="text-[0.8125rem] font-medium text-inverse/80">{label}</span>
    </span>
  )
}

/** Desktop-only footer: shortcuts + a warning about the squad. Hidden on compact screens. */
export function KeyHintBar() {
  return (
    <footer
      aria-label="Raccourcis clavier"
      className="mx-auto flex items-center gap-5 rounded-full bg-overlay px-5 py-2 short:hidden"
    >
      {HINTS.map((h) => (
        <KeyHint key={h.keys} keys={h.keys} label={h.label} />
      ))}
      <span className="h-4 w-px bg-inverse/20" aria-hidden />
      <span className="flex items-center gap-2 text-[0.8125rem] font-medium text-inverse">
        <span className="size-2 rounded-full bg-warning" aria-hidden />
        2 titulaires fatigués
      </span>
    </footer>
  )
}
