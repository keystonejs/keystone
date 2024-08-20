import jwt from 'jsonwebtoken'
import { config } from '@keystone-6/core'
import { lists, type Session } from './schema'
import type { Context, TypeInfo } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const jwtSessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

type OurJWTClaims = {
  id: string
}

async function jwtSign (claims: OurJWTClaims) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      claims,
      jwtSessionSecret,
      {
        algorithm: 'HS256', // HMAC-SHA256
      },
      (err, token) => {
        if (err) return reject(err)
        return resolve(token)
      }
    )
  })
}

async function jwtVerify (token: string): Promise<OurJWTClaims | null> {
  return new Promise(resolve => {
    jwt.verify(
      token,
      jwtSessionSecret,
      {
        algorithms: ['HS256'],
        maxAge: '1h', // we use an expiry of 1 hour for this example
      },
      (err, result) => {
        if (err || typeof result !== 'object') return resolve(null)
        if (typeof result.id !== 'string') return resolve(null)
        return resolve(result as OurJWTClaims)
      }
    )
  })
}

const jwtSessionStrategy = {
  async get ({ context }: { context: Context }): Promise<Session | undefined> {
    if (!context.req) return

    const { cookie = '' } = context.req.headers
    const [cookieName, jwt] = cookie.split('=')
    if (cookieName !== 'user') return

    const jwtResult = await jwtVerify(jwt)
    if (!jwtResult) return

    const { id } = jwtResult
    const who = await context.sudo().db.User.findOne({ where: { id } })
    if (!who) return
    return {
      id,
      admin: who.admin,
    }
  },

  // we don't need these unless we want to support the functions
  //   context.sessionStrategy.start
  //   context.sessionStrategy.end
  //
  async start () {},
  async end () {},
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',

    onConnect: async () => {
      // WARNING: remove this
      console.error(
        'Use any of the following tokens as your `user={token}` cookie for testing this session strategy',
        {
          Alice: await jwtSign({ id: 'clh9v6pcn0000sbhm9u0j6in0' }), // admin
          Bob: await jwtSign({ id: 'clh9v762w0002sbhmhhyc0340' }),
          Eve: await jwtSign({ id: 'clh9v7ahs0004sbhmpx30w85n' }),
        }
      )
    },
  },
  lists,
  session: jwtSessionStrategy,
})
