import { config } from '@keystone-6/core';
import { lists } from './src/keystone/schema';
import { withAuth, session } from './src/keystone/auth';
import { seedDemoData } from './src/keystone/seed';
import type { Context } from '.keystone/types';

// Next.js deploys need absolute path to sqlite db file
const dbFilePath = `${process.cwd()}/keystone.db`;
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
        generateUrl: path => `http://localhost:4000/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
      },
    },
  })
);
