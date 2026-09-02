import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { generateKeyPair } from 'jose/key/generate/keypair'
import { SignJWT } from 'jose/jwt/sign'
import { jwtVerify } from 'jose/jwt/verify'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: persist and securely load your key pair in production. This example
// generates a new key pair on startup, invalidating existing sessions.

// you also likely shouldn't actually use ML-DSA for session cookies since the signatures are very large
// this is just to demonstrate how you could use an alternative JWT algorithm with keystone
// besides the HS256 which jwtSessions uses
const alg = 'ML-DSA-65'
const jwtSessionKeyPair = generateKeyPair(alg)

type OurJWTClaims = {
  sub: string
}

async function jwtSign(claims: OurJWTClaims) {
  const { privateKey } = await jwtSessionKeyPair
  return new SignJWT(claims).setProtectedHeader({ alg }).setIssuedAt().sign(privateKey)
}

async function verifyJwt(token: string): Promise<OurJWTClaims | null> {
  try {
    const { publicKey } = await jwtSessionKeyPair
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: [alg],
      maxTokenAge: '1h', // we use an expiry of 1 hour for this example
    })
    if (typeof payload.sub !== 'string') return null
    return { sub: payload.sub }
  } catch {
    return null
  }
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
  async getSession({ context }) {
    if (!context.req) return

    const cookie = context.req.get('cookie') ?? ''
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
})
