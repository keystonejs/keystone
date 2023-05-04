import * as Path from 'path';
import { timestamp } from '@keystone-6/core/fields';
import {
  BaseKeystoneTypeInfo,
  DatabaseConfig,
  StorageConfig,
  AdminUIConfig,
} from '@keystone-6/core/types';

export const localStorageConfig: Record<string, StorageConfig> = {
  images: {
    kind: 'local',
    type: 'image',
    generateUrl: path => `/images${path}`,
    serverRoute: { path: '/images' },
    storagePath: 'public/images',
  },
  files: {
    kind: 'local',
    type: 'file',
    generateUrl: path => `/files${path}`,
    serverRoute: { path: '/files' },
    storagePath: 'public/files',
  },
};

// our monorepo tests have their @prisma/client dependencies hoisted
//   to build them and use them without conflict, we need to ensure .prisma/client
//   resolves to somewhere else
//
//   we use node_modules/.testprisma to differentiate from node_modules/.prisma, but
//   still use node_modules/... to skip the painful experience that is jest/babel
//   transforms
export const fixPrismaPath = {
  prismaClientPath: 'node_modules/.testprisma/client',
};
// we use preconstruct to build our packages, for our monorepo examples we need to use @preconstruct/next
export const fixNextConfig = {
  getAdditionalFiles: [
    () => [
      {
        mode: 'copy' as const,
        inputPath: Path.resolve('../../sandbox/test-next-config-fix.js'),
        outputPath: 'next.config.js',
      },
    ],
  ],
};

export const uiConfig: AdminUIConfig<BaseKeystoneTypeInfo> = {
  getAdditionalFiles: [
    () => [
      {
        mode: 'copy' as const,
        inputPath: Path.resolve('./test-next-config-fix.js'),
        outputPath: 'next.config.js',
      },
    ],
  ],
};

export const dbConfig: DatabaseConfig<BaseKeystoneTypeInfo> = {
  provider: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./dev.db',
  ...fixPrismaPath,
};

export const trackingFields = {
  createdAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    graphql: { omit: { create: true, update: true } },
    validation: { isRequired: true },
    defaultValue: { kind: 'now' },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  updatedAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    graphql: { omit: { create: true, update: true } },
    db: { updatedAt: true },
    validation: { isRequired: true },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
};
