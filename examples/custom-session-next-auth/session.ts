import { getServerSession } from 'next-auth/next'
import type { DefaultJWT } from 'next-auth/jwt'
import type { DefaultSession } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import type { Context } from '.keystone/types'

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

declare module '.keystone/types' {
  interface Session {
    id: string
  }
}

export async function nextAuthSessionStrategy({ context }: { context: Context }) {
  if (!context.req || !context.res || !context.req.nodeReq) return
  const cookie = context.req.headers.get('cookie')
  if (!cookie) return

  // next-auth needs a different cookies structure
  const cookies: Record<string, string> = {}
  for (const part of cookie.split(';')) {
    const [key, value] = part.trim().split('=')
    cookies[key] = decodeURIComponent(value)
  }

  const nextAuthSession = await getServerSession(
    { headers: context.req.nodeReq.headers, cookies } as any,
    { getHeader() {}, setCookie() {}, setHeader() {} } as any,
    nextAuthOptions
  )
  if (!nextAuthSession) return

  const { authId } = nextAuthSession.keystone
  if (!authId) return

  const author = await context.sudo().db.Author.findOne({
    where: { authId },
  })
  if (!author) return

  return { id: author.id }
}
