import type { Ref } from "react";
import { Link } from "react-router";
import { ArrowRight, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuTileProps {
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** Two-digit mono index shown on rows (matches the keyboard digit). */
  index?: string;
  href?: string;
  onClick?: () => void;
  /** Keyboard shortcut, exposed to assistive tech and in the tooltip. */
  shortcut?: string;
  ref?: Ref<HTMLElement>;
}

/** Compact menu row: mono index, label, badge and a discreet icon. */
export function MenuTile({
  label,
  icon: Icon,
  badge,
  index,
  href,
  onClick,
  shortcut,
  ref,
}: MenuTileProps) {
  const className = cn(
    "row-pill group relative flex h-[2.25rem] w-auto min-w-0 shrink-0 items-center gap-2.5 px-2.5 text-left outline-none transition-colors duration-150 motion-reduce:transition-none",
    "hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-club-ink active:bg-raised",
    "short:h-auto short:min-h-0 short:flex-1 short:gap-1.5 short:px-2",
  );

  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-club-rule opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="w-5 shrink-0 font-mono text-[0.6875rem] font-medium text-ink-3 transition-colors duration-150 group-hover:text-club-ink group-focus-visible:text-club-ink short:w-4 short:text-[0.625rem]"
      >
        {index}
      </span>
      <span className="min-w-0 flex-1 truncate text-[0.875rem] font-semibold leading-tight text-ink-2 transition-colors duration-150 group-hover:text-ink group-focus-visible:text-ink short:text-[0.6875rem]">
        {label}
      </span>
      {badge ? <Badge count={badge} /> : null}
      <Icon className="size-4 shrink-0 text-ink-3 short:size-3.5" strokeWidth={1.5} aria-hidden />
    </>
  );

  const common = {
    className,
    onClick,
    title: shortcut ? `${label} (${shortcut})` : undefined,
    "aria-keyshortcuts": shortcut,
  };

  if (href) {
    return (
      <Link to={href} ref={ref as Ref<HTMLAnchorElement>} {...common}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" ref={ref as Ref<HTMLButtonElement>} {...common}>
      {content}
    </button>
  );
}

interface AdvanceBlockProps {
  subline: string;
  warnings: string[];
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The main call to action. It says what advancing does (next fixture) and, before the match,
 * what still needs attention, so the manager never advances blind.
 */
export function AdvanceBlock({ subline, warnings, onClick, ref }: AdvanceBlockProps) {
  const describedBy = warnings.length ? "advance-warnings" : undefined;
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      aria-keyshortcuts="Space 1"
      aria-describedby={describedBy}
      title="Avancer (Espace)"
      className="group flex w-full min-w-0 shrink-0 flex-col justify-center gap-1 rounded-xl bg-club bg-[linear-gradient(160deg,rgb(255_255_255/0.14),transparent_55%)] shadow-[var(--block-shadow),inset_0_1px_0_rgb(255_255_255/0.18)] px-3.5 py-2.5 text-left text-club-on outline-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[color-mix(in_oklab,var(--club-primary)_90%,black)] motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-ink active:bg-[color-mix(in_oklab,var(--club-primary)_78%,black)] motion-reduce:transition-none short:flex-row short:items-center short:py-1.5 short:px-2.5"
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-display text-[1.375rem] font-bold uppercase leading-none tracking-tight short:text-[0.9375rem]">
          Avancer
        </span>
        <ArrowRight
          className="size-6 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none short:size-4"
          strokeWidth={2}
          aria-hidden
        />
      </span>
      <span className="block w-full truncate font-mono text-[0.625rem] font-medium uppercase opacity-90 short:hidden">
        {subline}
      </span>
      {warnings.length > 0 && (
        // One compact tag keeps the block short; the detail is in the tooltip and the confirm dialog.
        <span
          id="advance-warnings"
          title={warnings.join(" · ")}
          className="caps inline-flex w-fit items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--club-on-primary)_16%,transparent)] px-2 py-0.5 text-[0.625rem] text-club-on short:hidden"
        >
          <TriangleAlert className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          <span aria-hidden>
            {warnings.length} point{warnings.length > 1 ? "s" : ""} à vérifier
          </span>
          <span className="sr-only">À vérifier avant le match : {warnings.join(", ")}</span>
        </span>
      )}
    </button>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-danger px-1.5 font-mono text-[0.6875rem] font-bold leading-none text-inverse short:h-3.5 short:min-w-3.5 short:px-0.5 short:text-[0.625rem]"
      aria-label={`${count} notification${count > 1 ? "s" : ""}`}
    >
      {count}
    </span>
  );
}
