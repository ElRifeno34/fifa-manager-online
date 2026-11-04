import { IMAGES } from '@/lib/mock-data'

/**
 * Blurred stadium photo + a theme-aware veil. If the photo fails to load the
 * gradient layer underneath stays visible, so the layout never breaks.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10" style={{ background: 'var(--pitch-fallback)' }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGES.background}), url(${IMAGES.backgroundRemote})`,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'var(--veil)' }} />
    </div>
  )
}
