import { timestamp } from '@keystone-6/core/fields';
import { BaseKeystoneTypeInfo, DatabaseConfig, StorageConfig } from '@keystone-6/core/types';

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

export const dbConfig: DatabaseConfig<BaseKeystoneTypeInfo> = {
  provider: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./dev.db',
};

export const trackingFields = {
  createdAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    validation: { isRequired: true },
    defaultValue: { kind: 'now' },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  updatedAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    db: { updatedAt: true },
    validation: { isRequired: true },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
};
