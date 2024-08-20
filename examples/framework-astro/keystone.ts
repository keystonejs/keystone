// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core'
import { lists } from './src/keystone/schema'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    // we're using sqlite for the fastest startup experience
    //   for more information on what database might be appropriate for you
    //   see https://keystonejs.com/docs/guides/choosing-a-database#title
    provider: 'sqlite',
    url: 'file:./keystone.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  server: {
    // We're using a custom port for this example so Astro and Keystone can run at the same time
    port: 4000,
  },
  lists,
})
