import { config } from '@keystone-next/keystone/schema';
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
  cloud: {
    apiKey: KEYSTONE_CLOUD_API_KEY,
  },
  images: {
    upload: 'cloud',
  },
});
