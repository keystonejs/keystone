import { type AuthGqlNames } from '../types'

export default ({
  listKey,
  gqlNames,
  identityField,
  secretField,
}: {
  listKey: string
  gqlNames: AuthGqlNames
  identityField: string
  secretField: string
}) => {
  return `import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage(${JSON.stringify({
  listKey,
  identityField,
  secretField,
  mutationName: gqlNames.authenticateItemWithPassword,
  successTypename: gqlNames.ItemAuthenticationWithPasswordSuccess,
  failureTypename: gqlNames.ItemAuthenticationWithPasswordFailure,
})})
`
}
