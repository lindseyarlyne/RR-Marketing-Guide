import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, IBM_Plex_Mono, Jost } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  title: 'Ritual Runway — Founder OS',
  description: 'Internal founder dashboard for Ritual Runway.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2A2A2E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jost.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} bg-background`}
    >
      <body className="font-sans antialiased min-h-screen">
        <Script
          id="rr-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=document.documentElement;var s=localStorage.getItem('rr-theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);e.setAttribute('data-theme',d?'dark':'light');e.classList.toggle('dark',d);}catch(x){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
