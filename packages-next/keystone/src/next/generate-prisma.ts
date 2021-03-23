import path from 'path';
import { createSystem } from '../lib/createSystem';
import { initConfig } from '../lib/initConfig';
import { requireSource } from '../lib/requireSource';
import { CONFIG_PATH } from '../scripts/utils';

const dotKeystonePath = path.resolve('.keystone');

const config = initConfig(requireSource(CONFIG_PATH).default);

const { keystone } = createSystem(config, dotKeystonePath, 'none');

console.log('✨ Generating database client');
keystone.adapter._generateClient(keystone._consolidateRelationships()).catch((err: any) => {
  console.log(err);
  process.exit(1);
});
