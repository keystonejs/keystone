import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { SignJWT } from 'jose/jwt/sign'
import { jwtVerify } from 'jose/jwt/verify'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { Context, TypeInfo, Session } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const jwtSessionSecret = new TextEncoder().encode('-- DEV COOKIE SECRET; CHANGE ME --')

type OurJWTClaims = {
  sub: string
}

async function jwtSign(claims: OurJWTClaims) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' }) // HMAC-SHA256
    .setIssuedAt()
    .sign(jwtSessionSecret)
}

async function verifyJwt(token: string): Promise<OurJWTClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSessionSecret, {
      algorithms: ['HS256'],
      maxTokenAge: '1h', // we use an expiry of 1 hour for this example
    })
    if (typeof payload.sub !== 'string') return null
    return { sub: payload.sub }
  } catch {
    return null
  }
}

const jwtSessionStrategy = {
  async get({ context }: { context: Context }): Promise<Session | undefined> {
    if (!context.req) return

    const { cookie = '' } = context.req.headers
    const [cookieName, jwt] = cookie.split('=')
    if (cookieName !== 'user') return

    const jwtResult = await verifyJwt(jwt)
    if (!jwtResult) return

    const { sub } = jwtResult
    const who = await context.sudo().db.User.findOne({ where: { id: sub } })
    if (!who) return
    return {
      id: sub,
      admin: who.admin,
    }
  },

  // we don't need these unless we want to support the functions
  //   context.sessionStrategy.start
  //   context.sessionStrategy.end
  //
  async start() {},
  async end() {},
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      }),
    }),

    onConnect: async () => {
      // WARNING: remove this
      console.error(
        'Use any of the following tokens as your `user={token}` cookie for testing this session strategy',
        {
          Alice: await jwtSign({ sub: 'clh9v6pcn0000sbhm9u0j6in0' }), // admin
          Bob: await jwtSign({ sub: 'clh9v762w0002sbhmhhyc0340' }),
          Eve: await jwtSign({ sub: 'clh9v7ahs0004sbhmpx30w85n' }),
        }
      )
    },
  },
  lists,
  session: jwtSessionStrategy,
})
