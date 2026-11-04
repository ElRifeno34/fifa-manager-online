'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  /** Rendered when the image cannot load; defaults to a neutral gradient. */
  fallback?: ReactNode
}

export function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      fallback ?? (
        <div
          role="img"
          aria-label={alt}
          className={cn('bg-gradient-to-br from-raised to-line-strong', className)}
        />
      )
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
