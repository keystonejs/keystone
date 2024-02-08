import { list, config } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { fixPrismaPath } from '../example-utils'

import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: `file:${process.cwd()}/keystone.db`,

    ...fixPrismaPath,
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
