import 'dotenv/config'

import { config } from '@keystone-6/core'
import { type TypeInfo } from '.keystone/types'
import { lists } from './schema'
import {
  type Session,
  session,
  passportMiddleware
} from './auth'

export default config<TypeInfo<Session>>({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  session,

  server: {
    extendExpressApp(app, context) {
      app.use(passportMiddleware(context))
    },
  },
})
