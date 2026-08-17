import { parse } from 'graphql'
import type { AuthGqlNames } from './types.ts'

export function getSigninPageQuery({
  authGqlNames,
  identityField,
  secretField,
}: {
  authGqlNames: AuthGqlNames
  identityField: string
  secretField: string
}) {
  const {
    authenticateItemWithPassword,
    ItemAuthenticationWithPasswordSuccess: successTypename,
    ItemAuthenticationWithPasswordFailure: failureTypename,
  } = authGqlNames

  return parse(`
      mutation KsAuthSignin($identity: String!, $secret: String!) {
        authenticate: ${authenticateItemWithPassword}(${identityField}: $identity, ${secretField}: $secret) {
          ... on ${successTypename} {
            item {
              id
            }
          }
          ... on ${failureTypename} {
            message
          }
          __typename
        }
      }
    `)
}
