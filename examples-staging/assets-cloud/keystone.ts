import { config } from '@keystone-next/keystone';
import dotenv from 'dotenv';
import { lists } from './schema';

dotenv.config();

const { KEYSTONE_CLOUD_API_KEY = '' } = process.env;

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  images: {
    upload: 'cloud',
    local: {
      storagePath: 'uploads/images', // defaults to 'public/images'
      baseUrl: 'http://localhost:3000/images', // defaults to `/images`
    },
  },
  files: {
    upload: 'cloud',
  },
  experimental: {
    cloud: {
      apiKey: KEYSTONE_CLOUD_API_KEY,
    },
  },
});
