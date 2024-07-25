import type { Metadata } from 'next'
import RootLayoutClient, { Html } from './layout-client'
import { siteBaseUrl } from '../../lib/og-util'

const defaultTitle = 'KeystoneJS: The superpowered Node.js Headless CMS for developers'
const defaultDescription =
  'Build faster and scale further with the programmable open source GraphQL API back-end for structured content projects.'

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: defaultTitle,
  description: defaultDescription,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: defaultTitle,
    siteName: defaultTitle,
    description: defaultDescription,
    type: 'website',
    locale: 'en',
    images: [
      {
        url: '/og-image-landscape.png',
        width: 761,
        height: 410,
        alt: defaultDescription,
      },
    ],
  },
  twitter: {
    title: defaultTitle,
    description: defaultDescription,
    card: 'summary_large_image',
    images: [
      {
        url: '/og-image-landscape.png',
        width: 761,
        height: 410,
        alt: defaultTitle,
      },
    ],
  },
  other: {
    'msapplication-TileColor': '#2684FF',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" color="#2684FF" href="/safari-pinned-tab.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#2684FF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Keystone Blog RSS Feed"
          href="/feed.xml"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function () {
                  if (typeof window !== 'undefined') {
                    const isSystemColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    const localStorageTheme = localStorage.theme;
                    if (!localStorageTheme && isSystemColorSchemeDark) {
                      document.documentElement.setAttribute('data-theme', 'dark');
                      } else if (localStorageTheme === 'dark') {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                      // we already server render light theme
                      // so this is just ensuring that
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  }
                })();
              `,
          }}
        />
      </head>
      <RootLayoutClient>{children}</RootLayoutClient>
    </Html>
  )
}
