import { Router } from 'express'
import { statelessSessions } from '@keystone-6/core/session'
import { type KeystoneContext } from '@keystone-6/core/types'

import { Passport } from 'passport'
import { type VerifyCallback } from 'passport-oauth2'
import { Strategy, StrategyOptions, Profile } from 'passport-github2'

import { type Author } from '.myprisma/client'
import { type TypeInfo } from '.keystone/types'

export type Session = Author

export const session = statelessSessions<Session>({
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
  // https://github.com/settings/applications/new
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3000/auth/github/callback',
}

export function createAuthenticationMiddleware(
  commonContext: KeystoneContext<TypeInfo<Session>>
): Router {
  const router = Router()
  const instance = new Passport()
  const strategy = new Strategy(
    options,
    async (_a: string, _r: string, p: Profile, done: VerifyCallback) => {
      const author = await commonContext.prisma.author.upsert({
        where: { authId: p.id },
        update: { name: p.displayName },
        create: { authId: p.id, name: p.displayName },
      })

      return done(null, author)
    }
  )

  instance.use(strategy)

  const middleware = instance.authenticate('github', {
    // No need to use express-session internally
    session: false,
  })

  router.get('/auth/github', middleware)
  router.get('/auth/github/callback', middleware, async (req, res) => {
    if (!req.user) {
      res.status(401).send('Authentication failed')
      return
    }

    const context = await commonContext.withRequest(req, res)

    // Start the session in the same way authenticateItemWithPassword does
    // see: packages/auth/src/gql/getBaseAuthSchema.ts
    await context.sessionStrategy?.start({
      context,
      data: req.user,
    })

    res.redirect('/auth/session')
  })

  // This URL will show current session object
  router.get('/auth/session', async (req, res) => {
    const context = await commonContext.withRequest(req, res)
    const session = await context.sessionStrategy?.get({ context })
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(session))
    res.end()
  })

  return router
}
