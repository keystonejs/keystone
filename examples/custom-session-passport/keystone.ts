import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import 'dotenv/config'

import { config } from '@keystone-6/core'
import { type TypeInfo } from '.keystone/types'
import { lists } from './schema'
import { type Session, session, passportMiddleware } from './auth'

export default config<TypeInfo<Session>>({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./keystone.db' }),
    }),
  },
  lists,
  session,

  server: {
    extendExpressApp(app, context) {
      app.use(passportMiddleware(context))
    },
  },
})
