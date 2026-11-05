import { HINTS } from '@/lib/mock-data'

export function KeyHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <kbd className="flex h-[1.125rem] min-w-[1.125rem] items-center justify-center border border-inverse/45 px-1.5 font-mono text-[0.6875rem] font-medium leading-none text-inverse">
        {keys}
      </kbd>
      <span className="caps text-inverse/75">{label}</span>
    </span>
  )
}

/** Desktop-only footer: shortcuts + a warning about the squad. Hidden on compact screens. */
export function KeyHintBar() {
  return (
    <footer
      aria-label="Raccourcis clavier"
      className="mx-auto flex items-center gap-5 bg-overlay px-5 py-2 short:hidden"
    >
      {HINTS.map((h) => (
        <KeyHint key={h.keys} keys={h.keys} label={h.label} />
      ))}
      <span className="h-4 w-px bg-inverse/25" aria-hidden />
      <span className="caps flex items-center gap-2 text-inverse">
        <span className="size-2 bg-warning" aria-hidden />
        <span>
          <span className="font-mono">2</span> titulaires fatigués
        </span>
      </span>
    </footer>
  )
}
