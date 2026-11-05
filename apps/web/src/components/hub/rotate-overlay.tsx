import { Smartphone } from "lucide-react";

export function RotateOverlay() {
  return (
    <div
      role="alertdialog"
      aria-label="Tournez votre téléphone"
      className="fixed inset-0 z-[100] hidden flex-col items-center justify-center gap-6 bg-base px-8 text-center portrait:max-md:flex"
    >
      <Smartphone className="size-14 rotate-90 text-club-ink" strokeWidth={1.5} aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
          Tournez votre téléphone
        </p>
        <p className="text-[1rem] text-ink-2">Online Manager se joue en mode paysage.</p>
      </div>
    </div>
  );
}
