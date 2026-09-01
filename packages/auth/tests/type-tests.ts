import type { BaseListTypeInfo } from '@keystone-6/core/types'
import { createAuth, jwtSessions } from '@keystone-6/auth'

const secret = 'type-test-session-secret-at-least-32-characters'

jwtSessions()

type TestList = BaseListTypeInfo<{ sub: string }> & {
  key: 'User'
  fields: 'email' | 'password'
}

const strategy = jwtSessions<{ sub: string }>({ secret })

async function getJwtSessionClaims() {
  const session = await strategy.get({ context: {} as any })
  if (!session) return
  session.iat satisfies number
  session.exp satisfies number
}

void getJwtSessionClaims

// @ts-expect-error getAuthenticatedItemId is required
createAuth<TestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: strategy,
})

type HydratedTestList = BaseListTypeInfo<{ user: { id: string } }> & {
  key: 'User'
  fields: 'email' | 'password'
}
const hydratedStrategy = jwtSessions<{ sub: string }>({ secret })

createAuth<HydratedTestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: hydratedStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})

type IncompatibleItemIdTestList = BaseListTypeInfo<{ sub: bigint }> & {
  key: 'User'
  fields: 'email' | 'password'
}
const incompatibleItemIdStrategy = jwtSessions<{ sub: string }>({ secret })

createAuth<IncompatibleItemIdTestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: incompatibleItemIdStrategy,
  // @ts-expect-error getAuthenticatedItemId must return a string, number or undefined
  getAuthenticatedItemId(context) {
    return context.session?.sub
  },
})

createAuth<TestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: strategy,
  getAuthenticatedItemId: context => context.session?.sub,
  // @ts-expect-error sessionData is no longer supported
  sessionData: 'id',
})
