import type { BaseListTypeInfo } from '@keystone-6/core/types'
import type { AuthConfig } from '../types'

export default function ({
  listKey,
  initFirstItem
}: {
  listKey: string
  initFirstItem: NonNullable<AuthConfig<BaseListTypeInfo>['initFirstItem']>
}) {
  return `import makeSigninPage from '@keystone-6/auth/pages/InitPage'

export default makeSigninPage(${JSON.stringify({
  listKey,
  fieldPaths: initFirstItem.fields,
  enableWelcome: !initFirstItem.skipKeystoneWelcome,
})})
`
}
