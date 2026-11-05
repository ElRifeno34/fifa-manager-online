import { useMemo, useState } from "react";
import { CornerDownLeft, Search, type LucideIcon } from "lucide-react";
import { Dialog } from "@/components/hub/dialog";
import { cn, normalize } from "@/lib/utils";

export interface Command {
  id: string;
  label: string;
  group: string;
  icon?: LucideIcon;
  /** Extra words that should match (e.g. the sender of a message). */
  keywords?: string;
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

/** Ctrl/⌘+K search: jump anywhere in the hub with the keyboard. */
export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="palette-title"
      placement="top"
      className="max-w-[36rem]"
    >
      {/* Remounted on each open so the query and selection start fresh. */}
      {open && <PaletteBody commands={commands} onClose={onClose} />}
    </Dialog>
  );
}

function PaletteBody({ commands, onClose }: { commands: Command[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return commands;
    return commands.filter((c) => {
      const haystack = normalize(`${c.label} ${c.group} ${c.keywords ?? ""}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [commands, query]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    command.run();
  };

  return (
    <>
      <h2 id="palette-title" className="sr-only">
        Rechercher dans le hub
      </h2>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-5 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(results[active]);
            }
          }}
          placeholder="Section, message, club, joueur…"
          className="h-12 min-w-0 flex-1 bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="border border-line-strong px-1.5 font-mono text-[0.6875rem] text-ink-3">
          Échap
        </kbd>
      </div>

      <ul
        id="palette-results"
        role="listbox"
        aria-label="Résultats"
        className="max-h-[min(24rem,55vh)] overflow-y-auto py-1"
      >
        {results.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-ink-2">
            Aucun résultat pour « {query} ».
          </li>
        )}
        {results.map((c, i) => {
          const showGroup = c.group !== results[i - 1]?.group;
          const Icon = c.icon;
          return (
            <li key={c.id} role="presentation">
              {showGroup && <p className="caps px-4 pb-1 pt-2.5 text-ink-3">{c.group}</p>}
              <div
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(c)}
                className={cn(
                  "relative mx-1 flex cursor-pointer items-center gap-3 px-3 py-2 text-[0.875rem]",
                  i === active ? "bg-raised text-ink" : "text-ink-2",
                )}
              >
                {i === active && (
                  <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-club-rule" />
                )}
                {Icon && (
                  <Icon className="size-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
                {c.hint && (
                  <span className="shrink-0 font-mono text-[0.6875rem] text-ink-3">{c.hint}</span>
                )}
                {i === active && (
                  <CornerDownLeft className="size-3.5 shrink-0 text-ink-3" aria-hidden />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
