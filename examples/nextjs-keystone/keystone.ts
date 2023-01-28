import { env } from 'process';
import { config } from '@keystone-6/core';
import { lists } from './src/keystone/schema';
import { withAuth, session } from './src/keystone/auth';
import { seedDemoData } from './src/keystone/seed';
import type { Context } from '.keystone/types';

// Next.js deploys need absolute path to sqlite db file
const dbFilePath = `${process.cwd()}/keystone.db`;

// Prioritize vercel url (if available) over env variable
const publicUrl = env.NEXT_PUBLIC_VERCEL_URL ?? env.PUBLIC_URL ?? 'http://localhost:4000';

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: `file:${dbFilePath}`,
      onConnect: async (context: Context) => {
        await seedDemoData(context);
      },
    },
    lists,
    session,
    storage: {
      my_images: {
        kind: 'local',
        type: 'image',
        generateUrl: path => `${publicUrl}/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
      },
    },
  })
);
