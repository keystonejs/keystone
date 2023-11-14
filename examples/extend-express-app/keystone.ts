import { config } from '@keystone-6/core'
import type { Request, Response } from 'express'

import { fixPrismaPath } from '../example-utils'
import { lists } from './schema'
import { getTasks } from './routes/tasks'
import { type TypeInfo, type Context } from '.keystone/types'

function withContext<F extends (req: Request, res: Response, context: Context) => void>(
  commonContext: Context,
  f: F
) {
  return async (req: Request, res: Response) => {
    return f(req, res, await commonContext.withRequest(req, res))
  }
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  server: {
    /*
      This is the main part of this example. Here we include a function that
      takes the express app Keystone created, and does two things:
      - Adds a middleware function that will run on requests matching our REST
        API routes, to get a keystone context on `req`. This means we don't
        need to put our route handlers in a closure and repeat it for each.
      - Adds a GET handler for tasks, which will query for tasks in the
        Keystone schema and return the results as JSON
    */
    extendExpressApp: (app, commonContext) => {
      app.get('/rest/tasks', withContext(commonContext, getTasks))
      // app.put('/rest/tasks', withContext(commonContext, putTask));
    },
  },
  lists,
})
