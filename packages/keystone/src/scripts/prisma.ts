import execa from 'execa';
import { createSystem } from '../lib/createSystem';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../artifacts';
import { requireSource } from '../lib/config/requireSource';
import { initConfig } from '../lib/config/initConfig';
import { ExitError, getConfigPath } from './utils';

export async function prisma(cwd: string, args: string[]) {
  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const { graphQLSchema } = createSystem(config);

  await validateCommittedArtifacts(graphQLSchema, config, cwd);
  await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

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
