import type { AppProps } from 'next/app.js'
import type { AdminConfig, FieldViews } from '../../../../types/index.ts'
import { ErrorBoundary } from '../../../../admin-ui/components/index.ts'
import { KeystoneProvider } from '../../../../admin-ui/context.tsx'

type AppConfig = {
  adminConfig: AdminConfig
  fieldViews: FieldViews
  apiPath: string
}

export const getApp =
  (props: AppConfig) =>
  ({ Component, pageProps }: AppProps) => {
    return (
      <KeystoneProvider {...props}>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </KeystoneProvider>
    )
  }
