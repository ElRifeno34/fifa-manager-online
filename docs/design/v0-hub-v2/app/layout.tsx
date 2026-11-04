import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { AppBackground } from '@/components/app-background'
import { ClubThemeProvider } from '@/components/club-theme-provider'
import { RotateOverlay } from '@/components/rotate-overlay'
import { ToastProvider } from '@/components/toast-provider'
import { DEFAULT_CLUB_ID, buildClubThemeCss, buildThemeBootScript } from '@/lib/clubs'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Online Manager — Hub du manager',
  description:
    'Prototype de direction artistique du hub d’Online Manager, un jeu de gestion de football aux couleurs de votre club.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E4E9EF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0E13' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      data-club={DEFAULT_CLUB_ID}
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} bg-base`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildClubThemeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: buildThemeBootScript() }} />
      </head>
      <body>
        <ClubThemeProvider>
          <ToastProvider>

            <AppBackground />
            {children}
            <RotateOverlay />
          </ToastProvider>
        </ClubThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
