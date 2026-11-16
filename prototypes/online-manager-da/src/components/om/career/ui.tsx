import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/om/button";
import type { Nationality } from "@/data/mock";
export const careerPaths = [
  "/",
  "/carriere/nouvelle",
  "/carriere/sauvegardes",
  "/hub",
  "/equipe/effectif",
  "/equipe/joueur/$id",
  "/equipe/tactique",
  "/match/avant",
  "/match/direct",
  "/match/resume",
  "/saison/calendrier",
  "/saison/classement",
  "/saison/simulation",
  "/saison/bilan",
  "/equipe/entrainement",
  "/gestion/transferts",
  "/gestion/finances",
  "/gestion/discussions",
  "/gestion/presse",
  "/medias/fil",
  "/carriere/coach",
] as const;
export type CareerPath = (typeof careerPaths)[number];
export function Action({
  children,
  onClick,
  primary = false,
  disabled = false,
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <Button
      {...props}
      disabled={disabled}
      onClick={onClick}
      className={`career-action ${primary ? "is-primary" : ""}`}
    >
      {children}
    </Button>
  );
}
export function Go({
  to,
  children,
  primary = false,
  className,
  ariaLabel,
}: {
  to: Exclude<CareerPath, "/equipe/joueur/$id">;
  children: ReactNode;
  primary?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link to={to} aria-label={ariaLabel} className={`career-action ${primary ? "is-primary" : ""} ${className ?? ""}`.trim()}>
      {children}
      <ArrowRight size={16} strokeWidth={1.5} />
    </Link>
  );
}
export function Panel({
  title,
  index = "01",
  children,
  to,
  className = "",
}: {
  title: string;
  index?: string;
  children: ReactNode;
  to?: Exclude<CareerPath, "/equipe/joueur/$id">;
  className?: string;
}) {
  return (
    <section className={`career-panel ${className}`}>
      <h2 className="career-panel-heading">
        <span className="career-panel-index font-mono text-ink-3" aria-hidden="true">{index}</span>
        {to ? (
          <Link to={to} className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span>{title}</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        ) : (
          <span>{title}</span>
        )}
      </h2>
      <div className="career-panel-body">{children}</div>
    </section>
  );
}
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="career-stat">
      <span className="caps text-ink-2">{label}</span>
      <strong className="font-mono">{value}</strong>
    </div>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="career-field">
      <span className="caps text-ink-2">{label}</span>
      {children}
    </label>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="career-empty">
      <p>{children}</p>
    </div>
  );
}
export function Confirm({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="career-dialog-overlay" />
        <Dialog.Content className="career-dialog layer">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="career-dialog-title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button className="career-icon" aria-label="Fermer" title="Fermer · Échap">
                <X size={20} strokeWidth={1.5} />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="my-4 text-ink-2">{description}</Dialog.Description>
          <div className="career-actions">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function LoadingGate({ id, children }: { id: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 160);
    return () => clearTimeout(t);
  }, [id]);
  return ready ? (
    <>{children}</>
  ) : (
    <div role="status" aria-label="Chargement" className="career-loading">
      <div className="skeleton h-12" />
      <div className="skeleton h-32" />
      <div className="skeleton h-20" />
      <span className="sr-only">Chargement de la vue…</span>
    </div>
  );
}
const nationNames: Record<Nationality, string> = {
  FR: "France",
  ES: "Espagne",
  BR: "Brésil",
  DE: "Allemagne",
  PT: "Portugal",
  MA: "Maroc",
  BE: "Belgique",
};
export function Flag({ nation }: { nation: Nationality }) {
  return (
    <svg
      className={`career-flag flag-${nation}`}
      viewBox="0 0 30 20"
      role="img"
      aria-label={nationNames[nation]}
    >
      <rect className="flag-base" width="30" height="20" />
      {["FR", "BE"].includes(nation) ? (
        <>
          <rect className="flag-first" width="10" height="20" />
          <rect className="flag-third" x="20" width="10" height="20" />
        </>
      ) : nation === "DE" || nation === "ES" ? (
        <>
          <rect className="flag-first" width="30" height={nation === "ES" ? 5 : 7} />
          <rect
            className="flag-third"
            y={nation === "ES" ? 15 : 13}
            width="30"
            height={nation === "ES" ? 5 : 7}
          />
        </>
      ) : nation === "PT" ? (
        <>
          <rect className="flag-first" width="12" height="20" />
          <circle className="flag-emblem" cx="12" cy="10" r="3" />
        </>
      ) : nation === "BR" ? (
        <>
          <path className="flag-first" d="M15 2L28 10L15 18L2 10Z" />
          <circle className="flag-third" cx="15" cy="10" r="4" />
        </>
      ) : (
        <path className="flag-star" d="M15 5L18 14L10 8H20L12 14Z" />
      )}
    </svg>
  );
}
export const money = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n);
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
