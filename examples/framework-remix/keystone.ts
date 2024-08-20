import { list, config } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    // we're using sqlite for the fastest startup experience
    //   for more information on what database might be appropriate for you
    //   see https://keystonejs.com/docs/guides/choosing-a-database#title
    provider: 'sqlite',
    url: `file:${process.cwd()}/keystone.db`,

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  server: {
    port: 4000,
  },
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        name: text(),
        content: text(),
      },
    }),
  },
})
