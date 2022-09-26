import { getContext } from '@keystone-6/core/system';
import config from './keystone';
import * as PrismaModule from '.prisma/client';

async function main() {
  const { connect, context, disconnect } = getContext(config, PrismaModule);

  console.log('(script.ts)', 'connect');

  // if you don't call connect, db.onConnect will not be run
  // but Prisma will automatically connect when Prisma is used
  await connect();

  const run = (Math.random() * 1e5) | 0;
  for (let i = 0; i < 10; ++i) {
    console.log('(script.ts)', `Post.createOne ${i}`);
    await context.db.Post.createOne({ data: { title: `Post #${i}, run ${run}` } });
  }

  console.log('(script.ts)', 'disconnect');
  await disconnect();
}

main();
