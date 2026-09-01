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

// @ts-expect-error getAuthenticatedItemId is required when the session has no sub
createAuth<HydratedTestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: hydratedStrategy,
})

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

// @ts-expect-error getAuthenticatedItemId is required when session.sub is incompatible
createAuth<IncompatibleItemIdTestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: incompatibleItemIdStrategy,
})

createAuth<TestList>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy: strategy,
  // @ts-expect-error sessionData is no longer supported
  sessionData: 'id',
})
