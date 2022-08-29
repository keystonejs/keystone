import { config } from '@keystone-6/core';
import dotenv from 'dotenv';
import { models } from './schema';

dotenv.config();

const {
  S3_BUCKET_NAME: bucketName = 'keystone-test',
  S3_REGION: region = 'ap-southeast-2',
  S3_ACCESS_KEY_ID: accessKeyId = 'keystone',
  S3_SECRET_ACCESS_KEY: secretAccessKey = 'keystone',
} = process.env;

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
  },
  models,
  storage: {
    my_images: {
      kind: 's3',
      type: 'image',
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
      signed: { expiry: 5000 },
    },
    my_files: {
      kind: 's3',
      type: 'file',
      bucketName,
      region,
      accessKeyId,
      secretAccessKey,
      signed: { expiry: 5000 },
    },
  },
});
