import { config } from '@keystone-next/keystone/schema';
import dotenv from 'dotenv';
import { lists } from './schema';

dotenv.config();

const {
  KEYSTONE_CLOUD_API_KEY = '',
  KEYSTONE_CLOUD_IMAGES_DOMAIN = '',
  KEYSTONE_CLOUD_GRAPHQL_API_ENDPOINT = '',
  KEYSTONE_CLOUD_REST_API_ENDPOINT = '',
} = process.env;

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  images: {
    upload: 'keystone-cloud',
  },
  experimental: {
    keystoneCloud: {
      apiKey: KEYSTONE_CLOUD_API_KEY,
      imagesDomain: KEYSTONE_CLOUD_IMAGES_DOMAIN,
      graphqlApiEndpoint: KEYSTONE_CLOUD_GRAPHQL_API_ENDPOINT,
      restApiEndpoint: KEYSTONE_CLOUD_REST_API_ENDPOINT,
    },
  },
});
