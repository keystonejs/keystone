import { getContext } from '@keystone-6/core/context';
import config from './keystone';
// note this will probably be @prisma/client in your project
import * as PrismaModule from '.myprisma/client';
import type { Context } from '.keystone/types';

export const keystoneContext: Context =
  (globalThis as any).keystoneContext || getContext(config, PrismaModule);

if (process.env.NODE_ENV !== 'production') (globalThis as any).keystoneContext = keystoneContext;
