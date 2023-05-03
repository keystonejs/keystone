import { config } from '@keystone-6/core';
import { fixNextConfig, fixPrismaPath } from '../example-utils';
import { lists } from './schema';
import { getTasks } from './routes/tasks';
import { TypeInfo } from '.keystone/types';

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  ui: {
    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixNextConfig,
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
      app.use('/rest', async (req, res, next) => {
        /*
          WARNING: normally if you're adding custom properties to an
          express request type, you might extend the global Express namespace...
          ... we're not doing that here because we're in a Typescript monorepo
          so we're casting the request instead :)
        */
        (req as any).context = await commonContext.withRequest(req, res);
        next();
      });

      app.get('/rest/tasks', getTasks);
    },
  },
  lists,
});
