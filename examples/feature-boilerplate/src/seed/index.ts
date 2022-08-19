import fs from 'fs';
import path from 'path';
import { Context } from '.keystone/types';

const seedUsers = async (context: Context) => {
  const { query } = context.sudo();
  const rawJSONData = fs.readFileSync(path.join(process.cwd(), './src/seed/users.json'), 'utf-8');
  const seedUsers = JSON.parse(rawJSONData);

  for await (const user of seedUsers) {
    try {
      const queriedUser = await query.User.findOne({
        where: {
          email: user.email,
        },
      });

      if (!queriedUser) {
        await query.User.createOne({
          data: {
            email: user.email,
            name: user.name,
          },
        });
      }
    } catch (e) {
      console.error('Seeding user failed: ', {
        user,
        message: (e as Error).message,
      });
    }
  }
};

// seed posts and connect with users
const seedPosts = async (context: Context) => {
  const { query } = context.sudo();
  const rawJSONData = fs.readFileSync(path.join(process.cwd(), './src/seed/posts.json'), 'utf-8');
  const seedPosts = JSON.parse(rawJSONData);

  for await (const post of seedPosts) {
    try {
      const queriedPost = await query.Post.findOne({
        where: {
          slug: post.slug,
        },
      });

      if (!queriedPost) {
        await query.Post.createOne({
          data: {
            title: post.title,
            slug: post.slug,
            publishDate: post.publishDate,
            content: post.content?.document,
            ...(post.author?.connect?.email && {
              author: {
                connect: {
                  email: post.author.connect.email,
                },
              },
            }),
          },
        });
      }
    } catch (e) {
      console.error('Seeding post failed: ', {
        post,
        message: (e as Error).message,
      });
    }
  }
};

export const seedDatabase = async (context: Context) => {
  console.log(`🌱 Seeding database...`);
  await seedUsers(context);
  await seedPosts(context);
  console.log(`🌱 Seeding database completed.`);
};
