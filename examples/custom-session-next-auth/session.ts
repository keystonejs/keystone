import { getToken, type DefaultJWT } from 'next-auth/jwt'
import type { DefaultSession } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import type { Context } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

// see https://next-auth.js.org/configuration/options for more
export const nextAuthOptions = {
  secret: sessionSecret,
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: DefaultSession // required by next-auth, not by us
      token: DefaultJWT
    }) {
      // console.error('next-auth session', { session, token });
      return {
        ...session,
        keystone: {
          authId: token.sub,
        },
      }
    },
  },
  providers: [
    // allow anyone with a GitHub account to sign up as an author
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
}

declare module './generated/keystone/types' {
  interface Session {
    id: string
  }
}

export const nextAuthSessionStrategy = {
  async get({ context }: { context: Context }) {
    if (!context.req) return
    const token = await getToken({
      req: { headers: Object.fromEntries(context.req) } as any,
      secret: sessionSecret,
    })
    const authId = token?.sub
    if (!authId) return

    const author = await context.sudo().db.Author.findOne({
      where: { authId },
    })
    if (!author) return

    return { id: author.id }
  },

  // we don't need these as next-auth handle start and end for us
  async start() {},
  async end() {},
}
