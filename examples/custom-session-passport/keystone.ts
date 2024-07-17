import 'dotenv/config'

import { config } from '@keystone-6/core'
import { type TypeInfo } from '.keystone/types'
import { lists } from './schema'
import {
  type Session,
  session,
  passportMiddleware
} from './auth'
import { fixPrismaPath } from '../example-utils'

export default config<TypeInfo<Session>>({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  session,

  server: {
    extendExpressApp(app, context) {
      app.use(passportMiddleware(context))
    },
  },
})
