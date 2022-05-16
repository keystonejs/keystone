import { config } from '@keystone-6/core';
import { lists } from './schema';

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  storage: {
    images: {
      kind: 'local',
      type: 'image',
      generatedUrl: path => `http://localhost:3000/images${path}`,
      addServerRoute: {
        path: '/images',
      },
      storagePath: 'public/images',
      preserve: false,
    },
    files: {
      kind: 'local',
      type: 'file',
      generatedUrl: path => `http://localhost:3000/files${path}`,
      addServerRoute: {
        path: '/files',
      },
      storagePath: 'public/files',
      preserve: false,
    },
  },
});
