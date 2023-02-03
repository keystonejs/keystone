import { getContext } from '@keystone-6/core/context';
import { posts } from '../example-data';
import config from './keystone';
import * as PrismaModule from '.prisma/client';

async function main() {
  const context = getContext(config, PrismaModule);

  console.log(`🌱 Inserting seed data`);
  for (const post of posts) {
    console.log(`📝 Adding post: ${post.title}`);

    await context.db.Post.createOne({
      data: {
        ...post,
        version: 1,
      },
    });
  }

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
}

main();
