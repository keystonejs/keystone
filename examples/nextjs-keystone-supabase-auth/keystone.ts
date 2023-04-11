import dotenv from 'dotenv';
import { config } from '@keystone-6/core';
import { lists } from './keystone/schema';
import { TypeInfo } from '.keystone/types';

dotenv.config();

export default config<TypeInfo>({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/.myprisma/client',
  },
  lists,
});
