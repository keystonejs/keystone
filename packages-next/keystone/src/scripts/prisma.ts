import execa from 'execa';
import { createSystem } from '../lib/createSystem';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../artifacts';
import { requireSource } from '../lib/requireSource';
import { initConfig } from '../lib/initConfig';
import { ExitError, getConfigPath } from './utils';

export async function prisma(cwd: string, args: string[]) {
  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const { keystone, graphQLSchema } = createSystem(config);

  await validateCommittedArtifacts(graphQLSchema, keystone, cwd);
  await generateNodeModulesArtifacts(graphQLSchema, keystone, config, cwd);

  const result = await execa('node', [require.resolve('prisma'), ...args], {
    cwd,
    stdio: 'inherit',
    reject: false,
    env: {
      ...process.env,
      DATABASE_URL: config.db.url,
    },
  });
  if (result.exitCode !== 0) {
    throw new ExitError(result.exitCode);
  }
}
