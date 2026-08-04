import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

// Configure the premium industrial font
const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
})

// Define base URL for canonical links and OpenGraph card resolution
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eravault.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EraVault — Professional Image Hosting & AI Asset Management',
    template: '%s | EraVault',
  },
  description:
    'Professional digital asset management. Engineered for zero-compression media retention, clean direct web URLs, and automated computer vision tagging.',
  keywords: [
    'Digital Asset Management',
    'DAM',
    'Zero Compression Image Hosting',
    'RAW Photography Hosting',
    'Computer Vision Tagging',
    'Edge Media Delivery',
    'TypeScript',
    'Next.js 15',
    'Enterprise Media Architecture',
  ],
  authors: [
    {
      name: 'Osman Ahmed Khan',
      url: 'https://github.com/OsmanKhan276',
    },
  ],
  creator: 'Osman Ahmed Khan',
  publisher: 'EraVault',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'EraVault — Professional Image Hosting & AI Asset Management',
    description:
      'Engineered for zero-compression media retention, clean direct web URLs, and automated computer vision tagging.',
    siteName: 'EraVault',
    images: [
      {
        url: '/og-image.png', // Fallback preview image in public/og-image.png
        width: 1200,
        height: 630,
        alt: 'EraVault — Enterprise Digital Asset Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EraVault — Professional Image Hosting & AI Asset Management',
    description:
      'Engineered for zero-compression media retention, clean direct web URLs, and automated computer vision tagging.',
    creator: '@OsmanKhan', // Replace with your X handle if applicable
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} min-h-screen bg-neutral-950 text-neutral-50 antialiased`}>
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}