import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { createExpressServer } from '../lib/createExpressServer';
import { PORT } from './utils';
import Path from 'path';
import * as fs from 'fs-extra';

export const start = async () => {
  console.log('🤞 Starting Keystone');
  const apiFile = Path.resolve('./.keystone/admin/.next/server/pages/api/__keystone_api_build.js');
  if (!fs.existsSync(apiFile)) {
    throw new Error('keystone-next build must be run before running keystone-next start');
  }
  const config = initConfig(require(apiFile).config);

  const system = createSystem(config);

  console.log('✨ Connecting to the Database');
  await system.keystone.connect();

  const server = await createExpressServer(config, system, false);
  console.log(`👋 Admin UI Ready`);

  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Server Ready on http://localhost:${PORT}`);
  });
};
