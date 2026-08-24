import type { AppProps } from 'next/app.js'
import type { AdminConfig, FieldViews } from '../../../types/index.ts'
import { ErrorBoundary } from '../../../admin-ui/components/index.ts'
import { KeystoneProvider } from '../../../admin-ui/context.tsx'
import { useNextPagesRouter } from '../../../admin-ui/next-pages-router.ts'

type AppConfig = {
  adminConfig: AdminConfig
  fieldViews: FieldViews
  apiPath: string
}

export const getApp =
  (props: AppConfig) =>
  ({ Component, pageProps }: AppProps) => {
    const { router, isReady } = useNextPagesRouter()

    // mount the provider straight away so adminMeta is fetched while the router gets ready,
    // only the page needs to wait for the router
    return (
      <KeystoneProvider {...props} router={router}>
        {isReady && (
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        )}
      </KeystoneProvider>
    )
  }
