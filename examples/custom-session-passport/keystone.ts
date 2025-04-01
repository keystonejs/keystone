import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import 'dotenv/config'

import { config } from '@keystone-6/core'
import type { TypeInfo } from './generated/keystone/types'
import { lists } from './schema'
import { session, passportMiddleware } from './auth'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./keystone.db' }),
    }),
  },
  lists,
  getSession: session.get,

  server: {
    extendExpressApp(app, context) {
      app.use(passportMiddleware(context))
    },
  },
})
