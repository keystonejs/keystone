import { config, graphql } from '@keystone-6/core'
import { fixPrismaPath } from '../example-utils'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'
import { KeystoneContext } from '@keystone-6/core/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  server: {
    extendHttpServer(server, context) {
      // TODO: Example. Remove this in case PR is merged
      context.logger.log('Hello from extendHttpServer')
    },
  },
  graphql: {
    // TODO: Example. Remove this in case PR is merged
    extendGraphqlSchema: graphql.extend(base => {
      return {
        query: {
          test: graphql.field({
            type: base.scalar('String'),
            resolve(parent, args, context: KeystoneContext) {
              context.logger.log('Hello from extendGraphqlSchema')
              return 'Hello from extendGraphqlSchema'
            },
          }),
        },
      };
    }),
  }
})
