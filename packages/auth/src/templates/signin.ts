import type { AuthGqlNames } from '../types.ts'

export default function ({
  authGqlNames,
  identityField,
  secretField,
  persistedQueryHash,
}: {
  authGqlNames: AuthGqlNames
  identityField: string
  secretField: string
  persistedQueryHash?: string
}) {
  return `import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage(${JSON.stringify({
    authGqlNames,
    identityField,
    secretField,
    persistedQueryHash,
  })})
`
}
