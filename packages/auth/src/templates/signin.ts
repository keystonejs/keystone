import type { AuthGqlNames } from '../types'

export default function ({
  authGqlNames,
  identityField,
  secretField,
}: {
  authGqlNames: AuthGqlNames
  identityField: string
  secretField: string
}) {
  return `'use client'
import makeSigninPage from '@keystone-6/auth/pages/SigninPage'

export default makeSigninPage(${JSON.stringify({
    authGqlNames,
    identityField,
    secretField,
  })})
`
}
