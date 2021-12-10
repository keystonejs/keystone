import { config } from '@keystone-6/core';
import dotenv from 'dotenv';
import { lists } from './schema';

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = '',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = '',
  S3_SECRET_ACCESS_KEY: secretAccessKey = '',
} = process.env;

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  lists,
  images: {
    upload: 's3',
  },
  files: {
    upload: 's3',
  },
  experimental: {
    s3: {
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
    },
  },
});
