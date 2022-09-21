import execa from 'execa';
import { createSystem } from '../lib/createSystem';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../artifacts';
import { loadConfigOnce } from '../lib/config/loadConfig';
import { ExitError } from './utils';

export async function prisma(cwd: string, args: string[]) {
  const config = await loadConfigOnce(cwd);

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
