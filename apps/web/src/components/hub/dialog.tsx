import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Id of the element that names the dialog. */
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
  /** Where the panel sits: centered (confirmations) or near the top (search). */
  placement?: "center" | "top";
}

const FOCUSABLE = "button:not([disabled]), [href], input, [tabindex]:not([tabindex='-1'])";

/** Modal layer: traps focus, closes on Escape or backdrop click, then returns focus to the trigger. */
export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  className,
  placement = "center",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE)
    )?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      returnTo?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center px-4",
        placement === "center" ? "items-center" : "items-start pt-[12vh] short:pt-3",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-scrim/45 animate-in fade-in duration-150"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={cn(
          "layer relative w-full overflow-hidden rounded-xl border-t-2 border-club-rule bg-surface animate-in fade-in zoom-in-95 duration-150",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
