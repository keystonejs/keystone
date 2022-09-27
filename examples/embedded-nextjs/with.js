// eslint-disable-next-line import/no-unresolved
import { getContext } from '@keystone-6/core/context';

// eslint-disable-next-line import/no-unresolved
import config from './keystone';
import * as PrismaModule from '.prisma/client';
//  import { Context, TypeInfo } from '.keystone/types';

//  let globalContext: Context | null = null;
let globalContext = null;

export async function withContext() {
  if (globalContext) return globalContext;

  const { connect, context } = getContext(config, PrismaModule);
  await connect();

  globalContext = context;
  return globalContext;
}
