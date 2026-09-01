// Welcome to some authentication for Keystone
//
// This is using @keystone-6/auth to add the following
// - A sign-in page for your Admin UI
// - A cookie-based JWT session strategy
//    - Using a User email as the identifier
//    - 30 day cookie expiration
//
// This file does not configure what Users can do, and the default for this starter
// project is to allow anyone - logged-in or not - to do anything.
//
// If you want to prevent random people on the internet from accessing your data,
// you can find out how by reading https://keystonejs.com/docs/guides/auth-and-access-control
//
// If you want to learn more about how our out-of-the-box authentication works, please
// read https://keystonejs.com/docs/apis/auth#authentication-api

import { createAuth, jwtSessions } from '@keystone-6/auth'
import type { Context } from './generated/keystone/types'

const sessionStrategy = jwtSessions({
  maxAge: 60 * 60 * 24 * 30,
  secret: process.env.SESSION_SECRET,
})

export async function getUserIdForSession(context: Context) {
  return (await sessionStrategy.get({ context }))?.sub
}

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',

  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})

export { withAuth }
