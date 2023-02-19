import execa from 'execa';
import { createSystem } from '../lib/createSystem';
import {
  getBuiltKeystoneConfigurationPath,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../artifacts';
import { loadConfigOnce, loadBuiltConfig } from '../lib/config/loadConfig';
import { KeystoneConfig } from './../types/config/index';

import { ExitError } from './utils';

export async function prisma(cwd: string, args: string[], frozen: boolean) {
  let config: KeystoneConfig;
  if (frozen) {
    // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
    const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd);

    args = args.filter(arg => arg !== '--frozen');
    config = loadBuiltConfig(builtConfigPath);
  } else {
    config = await loadConfigOnce(cwd);
  }

  const { graphQLSchema } = createSystem(config);
  await validateCommittedArtifacts(cwd, config, graphQLSchema);
  await generateNodeModulesArtifacts(cwd, config, graphQLSchema);

  const result = await execa('node', [require.resolve('prisma'), ...args], {
    cwd,
    stdio: 'inherit',
    reject: false,
    env: {
      ...process.env,
      DATABASE_URL: config.db.url,
      PRISMA_HIDE_UPDATE_MESSAGE: '1',
    },
  });
  if (result.exitCode !== 0) {
    throw new ExitError(result.exitCode);
  }
}
