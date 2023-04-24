import { getContext } from '@keystone-6/core/context';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import config from '../keystone';
import { Context } from '.keystone/types';
import * as PrismaModule from '.myprisma/client';

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
  (globalThis as any).keystoneContext || getContext(config, PrismaModule);

if (process.env.NODE_ENV !== 'production') (globalThis as any).keystoneContext = keystoneContext;

export async function getKeystoneSessionContext() {
  // This is how you would do session context in pages directory
  //const { data: rawSession } = await createServerSupabaseClient({req,res}).auth.getSession();
  //return keystoneContext.withSession(rawSession.session?.user);
  const { headers, cookies } = require('next/headers');
  const { data: rawSession } = await createServerComponentSupabaseClient({
    headers,
    cookies,
  }).auth.getSession();
  return keystoneContext.withSession(rawSession.session?.user);
}
