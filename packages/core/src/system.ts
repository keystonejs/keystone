import express from 'express';
import next from 'next';
import type { KeystoneConfig, KeystoneContext } from '../types';
import { createAdminUIMiddlewareWithNextApp } from './lib/server/createAdminUIMiddleware';

export { createSystem } from './lib/createSystem';
export { createExpressServer } from './lib/server/createExpressServer';
export { initConfig } from './lib/config';

/** @deprecated */
export async function createAdminUIMiddleware(
  config: KeystoneConfig,
  context: KeystoneContext,
  dev: boolean,
  projectAdminPath: string
  // TODO: return type required by pnpm
): Promise<(req: express.Request, res: express.Response) => void> {
  const nextApp = next({ dev, dir: projectAdminPath });
  await nextApp.prepare();
  return createAdminUIMiddlewareWithNextApp(config, context, nextApp);
}
