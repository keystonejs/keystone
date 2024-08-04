import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { fixPrismaPath } from '../example-utils'
import { lists } from './schema'
import type {TypeInfo } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

// statelessSessions uses cookies for session tracking
//   these cookies have an expiry, in seconds
//   we use an expiry of one hour for this example
const sessionMaxAge = 60 * 60

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  session: statelessSessions({
    // the maxAge option controls how long session cookies are valid for before they expire
    maxAge: sessionMaxAge,
    // the session secret is used to encrypt cookie data
    secret: sessionSecret,
  }),
})
