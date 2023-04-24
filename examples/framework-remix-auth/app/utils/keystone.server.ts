import { getContext } from '@keystone-6/core/context';
import config from '../../keystone';
import { requireUserId } from './session.server';
import * as PrismaModule from '.myprisma/client';
import type { Context } from '.keystone/types';

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
  (globalThis as any).keystoneContext || getContext(config, PrismaModule);

if (process.env.NODE_ENV !== 'production') (globalThis as any).keystoneContext = keystoneContext;

export async function getSessionContext(request: Request) {
  // Get the user id from the Remix Session and create a Keystone Context with it
  const userId = await requireUserId(request);

  return keystoneContext.withSession({ userId });
}
