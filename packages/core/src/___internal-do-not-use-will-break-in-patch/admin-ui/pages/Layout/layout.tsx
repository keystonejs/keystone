'use client'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ErrorBoundary } from '../../../../admin-ui/components'
import { KeystoneProvider } from '../../../../admin-ui/context'
import { KeystoneLayout } from '../../../../admin-ui/components/PageContainer'
import { usePathname, useSelectedLayoutSegments } from 'next/navigation'

export function Layout(props: {
  children: ReactNode
  config: Omit<Parameters<typeof KeystoneProvider>[0]['config'], 'basePath'>
}) {
  const pathname = usePathname()
  const innerSegments = useSelectedLayoutSegments()
    .filter(x => !x.startsWith('('))
    .join('/')
  const basePath = pathname
    .slice(0, innerSegments.length ? -innerSegments.length : undefined)
    .replace(/\/$/, '')
  const config = useMemo(() => ({ ...props.config, basePath }), [basePath, props.config])
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    <html>
      <head>
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <KeystoneProvider config={config}>
          <ErrorBoundary>
            {isClient && <KeystoneLayout>{props.children}</KeystoneLayout>}
          </ErrorBoundary>
        </KeystoneProvider>
      </body>
    </html>
  )
}
