import { getContext } from '@keystone-6/core/context'
import config from './keystone'

// WARNING: this is only needed for our monorepo examples, dont do this
import * as PrismaModule from 'myprisma'

//   do this instead
// import * as PrismaModule from '@prisma/client'

async function main () {
  const context = getContext(config, PrismaModule)

  console.log('(script.ts)', 'connect')
  await config.db.onConnect?.(context)

  const run = (Math.random() * 1e5) | 0
  for (let i = 0; i < 10; ++i) {
    console.log('(script.ts)', `Post.createOne ${i}`)
    await context.db.Post.createOne({ data: { title: `Post #${i}, run ${run}` } })
  }
}

main()
