import path from 'path';
import { config } from '@keystone-6/core';
import { lists } from './src/keystone/schema';
import { withAuth, session } from './src/keystone/auth';
import { seedDemoData } from './src/keystone/seed';
import { KEYSTONE_MODE } from './src/util/env';
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
    /*
      We ask Keystone to use the custom config we wrote in
      ./src/keystone/next.config.js in its Admin UI build
    */
    ui: {
      getAdditionalFiles: [
        async () => {
          /*
            Setup multizone config only in production builds.
            In local dev builds, Next.js app and Keystone app
            run on separate servers.
          */
          return [
            {
              mode: 'copy',
              inputPath: path.resolve('./src/keystone/next.config.js'),
              outputPath: 'next.config.js',
            },
          ];
        },
      ],
    },
    lists,
    session,
  })
);
