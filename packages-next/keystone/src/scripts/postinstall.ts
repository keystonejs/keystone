import { createSystem } from '../lib/createSystem';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../lib/artifacts';
import { requireSource } from '../lib/requireSource';
import { initConfig } from '../lib/initConfig';
import { CONFIG_PATH } from './utils';

export async function postinstall(cwd: string, shouldFix: boolean) {
  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config, cwd, 'none');

  if (shouldFix) {
    console.log('✨ Generating GraphQL and Prisma schemas');
    await generateCommittedArtifacts(graphQLSchema, keystone, cwd);
  } else {
    await validateCommittedArtifacts(graphQLSchema, keystone, cwd);
  }
  await generateNodeModulesArtifacts(graphQLSchema, keystone, cwd);
}
