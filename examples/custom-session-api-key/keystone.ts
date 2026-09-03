import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { getPasswordFieldKDF } from '@keystone-6/core/fields/types/password'
import type { SessionStrategy } from '@keystone-6/core/types'
import { type Session, lists } from './schema'
import type { Context, TypeInfo } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

// statelessSessions uses cookies for session tracking
//   these cookies have an expiry, in seconds
//   we use an expiry of one hour for this example
const sessionMaxAge = 60 * 60

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // a secret field must be a password field type
  secretField: 'password',

  // initFirstItem enables the "First User" experience, this will add an interface form
  //   adding a new User item if the database is empty
  //
  // WARNING: do not use initFirstItem in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // the following fields are used by the "Create First User" form
    fields: ['name', 'password'],

    // the following fields are configured by default for this item
    itemData: {
      // isAdmin is true, so the admin can pass isAccessAllowed (see below)
      isAdmin: true,
    },
  },

  // add isAdmin to the session data
  sessionData: 'isAdmin',
})

const cookieSessionStrategy = statelessSessions<Session>({
  // the maxAge option controls how long session cookies are valid for before they expire
  maxAge: sessionMaxAge,
  // the session secret is used to encrypt cookie data
  secret: sessionSecret,
})

function getHeaderValue(header: string | string[] | undefined) {
  if (Array.isArray(header)) return
  return header
}

function getApiKeyCredentials(headers: Context['req']['headers']) {
  const itemId = getHeaderValue(headers['keystone-example-api-key-id'])
  const secret = getHeaderValue(headers['keystone-example-api-key-secret'])
  if (!itemId) return
  if (!secret) return

  return { itemId, secret }
}

const apiKeySessionStrategy = {
  async get({ context }: { context: Context }): Promise<Session | undefined> {
    if (!context.req) return

    const credentials = getApiKeyCredentials(context.req.headers)
    if (!credentials) return

    const user = await context.sudo().prisma.user.findUnique({
      where: { id: credentials.itemId },
      select: { id: true, apiKey: true, apiKeyExpiresAt: true, isAdmin: true },
    })
    if (!user?.apiKey) return
    if (!user.apiKeyExpiresAt) return
    if (new Date(user.apiKeyExpiresAt) <= new Date()) return

    const kdf = getPasswordFieldKDF(context.graphql.schema, 'User', 'apiKey')
    if (!kdf) return
    if (!(await kdf.compare(credentials.secret, user.apiKey))) return

    return {
      itemId: user.id,
      data: {
        isAdmin: user.isAdmin,
      },
    }
  },
  async start() {},
  async end() {},
} satisfies SessionStrategy<Session, TypeInfo>

const composedSessionStrategy = {
  async get({ context }: { context: Context }) {
    const apiKeySession = await apiKeySessionStrategy.get({ context })
    if (apiKeySession) return apiKeySession

    return cookieSessionStrategy.get({ context })
  },
  start: cookieSessionStrategy.start,
  end: cookieSessionStrategy.end,
} satisfies SessionStrategy<Session, TypeInfo>

export default withAuth<TypeInfo<Session>>(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

      // WARNING: this is only needed for our monorepo examples, dont do this
      prismaClientPath: 'node_modules/myprisma',
    },
    lists,
    ui: {
      // only admins can view the AdminUI
      isAccessAllowed: context => {
        return context.session?.data?.isAdmin ?? false
      },
    },
    // you can find out more at https://keystonejs.com/docs/apis/session#session-api
    session: composedSessionStrategy,
  })
)
