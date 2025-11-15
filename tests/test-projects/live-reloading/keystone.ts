import { config } from '@keystone-6/core'
import { fixPrismaPath } from '../../sandbox/utils'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./test.db',

    // WARNING: this is only needed for examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  graphql: {
    extendGraphqlSchema,
  },
  ui: {
    getAdditionalFiles: () => [
      {
        mode: 'write',
        src: "export async function GET() { return new Response('something')}",
        overwrite: true,
        outputPath: 'api/blah/[...rest]/route.js',
      },
    ],
  },
})
