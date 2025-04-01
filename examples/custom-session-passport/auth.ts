import { Router } from 'express'
import expressSession from 'express-session'
import { type KeystoneContext } from '@keystone-6/core/types'

import { Passport } from 'passport'
import { type VerifyCallback } from 'passport-oauth2'
import { Strategy, type StrategyOptions, type Profile } from 'passport-github2'

import { type Author } from 'myprisma'
import type { Context, TypeInfo } from '.keystone/types'

declare module '.keystone/types' {
  export interface Session extends Author {}
}

declare global {
  namespace Express {
    interface User extends Author {}
  }
}

export async function session({ context }: { context: Context }) {
  return (context.req?.nodeReq as any)?.user as Author
}

const options: StrategyOptions = {
  // see https://github.com/settings/applications/new
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3000/auth/github/callback',
}

export function passportMiddleware(commonContext: KeystoneContext<TypeInfo>): Router {
  const router = Router()
  const passport = new Passport()
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

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser(async (user, done) => {
    if (typeof user !== 'string') {
      done(null)
      return
    }
    const author = await commonContext.prisma.author.findUnique({
      where: { id: user },
    })
    if (!author) {
      return done(null)
    }
    return done(null, author)
  })

  passport.use(strategy)
  router.use(
    expressSession({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false })
  )
  router.use(passport.authenticate('session'))
  const middleware = passport.authenticate('github', {
    successRedirect: '/auth/session',
  })

  router.get('/auth/github', middleware)
  router.get('/auth/github/callback', middleware)

  // show the current session object
  //   WARNING: this is for demonstration purposes only, probably dont do this
  router.get('/auth/session', async (req, res) => {
    const context = await commonContext.withNodeRequest(req)
    const session = context.session
    console.log('session', req.session)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(session))
    res.end()
  })

  return router
}
