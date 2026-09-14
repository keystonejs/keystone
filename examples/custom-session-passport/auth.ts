import { Router } from 'express'
import { jwtSessions } from '@keystone-6/auth'
import type { KeystoneContext } from '@keystone-6/core/types'

import { Passport } from 'passport'
import type { VerifyCallback } from 'passport-oauth2'
import { Strategy, type StrategyOptions, type Profile } from 'passport-github2'

import type { Author } from './generated/prisma/client'
import type { TypeInfo } from './generated/keystone/types'

declare module './generated/keystone/types' {
  export interface Session {
    author: Author
  }
}
export const sessionStrategy = jwtSessions<{ sub: string }>({
  maxAge: 60 * 60 * 24 * 30,
  secret: process.env.SESSION_SECRET!,
})

declare global {
  namespace Express {
    // Augment the global user added by Passport to be the same as the Prisma Author
    interface User extends Author {}
  }
}

const options: StrategyOptions = {
  // see https://github.com/settings/applications/new
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3000/auth/github/callback',
}

export function passportMiddleware(commonContext: KeystoneContext<TypeInfo>): Router {
  const router = Router()
  const instance = new Passport()
  const strategy = new Strategy(
    options,
    async (_a: string, _r: string, profile: Profile, done: VerifyCallback) => {
      const author = await commonContext.prisma.author.upsert({
        where: { authId: profile.id },
        update: { name: profile.displayName },
        create: { authId: profile.id, name: profile.displayName },
      })

      return done(null, author)
    }
  )

  instance.use(strategy)
  const middleware = instance.authenticate('github', {
    session: false, // dont use express-session
  })

  router.get('/auth/github', middleware)
  router.get('/auth/github/callback', middleware, async (req, res) => {
    if (!req.user) {
      res.status(401).send('Authentication failed')
      return
    }

    const responseHeaders = new Headers()
    const context = await commonContext.withHeaders(
      new Headers(
        Object.entries(req.headers).flatMap(([key, value]): [string, string][] =>
          value ? (Array.isArray(value) ? value.map(inner => [key, inner]) : [[key, value]]) : []
        )
      ),
      responseHeaders
    )

    // starts the session, and sets the cookie on context.res
    await sessionStrategy.start({
      context,
      data: { sub: req.user.id },
    })
    for (const value of responseHeaders.getSetCookie()) res.appendHeader('Set-Cookie', value)

    res.redirect('/auth/session')
  })

  // show the current session object
  //   WARNING: this is for demonstration purposes only, probably dont do this
  router.get('/auth/session', async (req, res) => {
    const context = await commonContext.withHeaders(
      new Headers(
        Object.entries(req.headers).flatMap(([key, value]): [string, string][] =>
          value ? (Array.isArray(value) ? value.map(inner => [key, inner]) : [[key, value]]) : []
        )
      )
    )
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(context.session))
    res.end()
  })

  return router
}
