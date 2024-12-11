import type { AuthGqlNames } from '../types'

export default ({
  gqlNames,
  identityField,
  secretField,
}: {
  gqlNames: AuthGqlNames
  identityField: string
  secretField: string
}) => {
  return `import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage(${JSON.stringify({
  identityField,
  secretField,
  mutationName: gqlNames.authenticateItemWithPassword,
  successTypename: gqlNames.ItemAuthenticationWithPasswordSuccess,
  failureTypename: gqlNames.ItemAuthenticationWithPasswordFailure,
})})
`
}
