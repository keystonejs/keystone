import type { AdminConfig, FieldViews } from '../../../../types'
import { ErrorBoundary } from '../../../../admin-ui/components'
import { KeystoneProvider } from '../../../../admin-ui/context'

type AdminProps = {
  children: React.ReactNode
  config: AppConfig
}

type AppConfig = {
  adminConfig: AdminConfig
  fieldViews: FieldViews
  apiPath: string
  adminPath: string
}

export function Layout({ children, config }: AdminProps) {
  return (
    <KeystoneProvider {...config}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </KeystoneProvider>
  )
}
