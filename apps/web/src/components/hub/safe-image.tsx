import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Rendered when the image cannot load; defaults to a neutral gradient. */
  fallback?: ReactNode;
}

/** Image with a skeleton while it loads and a fallback if it fails, so the layout never breaks. */
export function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      fallback ?? (
        <div
          role="img"
          aria-label={alt}
          className={cn("bg-gradient-to-br from-raised to-line-strong", className)}
        />
      )
    );
  }

  return (
    <>
      {!loaded && <div aria-hidden className={cn("skeleton", className)} />}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "object-cover transition-opacity duration-300 motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
