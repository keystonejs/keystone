import { createSystem } from '../lib/createSystem';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../artifacts';
import { requireSource } from '../lib/requireSource';
import { initConfig } from '../lib/initConfig';
import { CONFIG_PATH } from './utils';

export async function postinstall(cwd: string, shouldFix: boolean) {
  const config = initConfig(requireSource(CONFIG_PATH).default);

  const { keystone, graphQLSchema } = createSystem(config);

  if (shouldFix) {
    await generateCommittedArtifacts(graphQLSchema, keystone, cwd);
    console.log('✨ Generated GraphQL and Prisma schemas');
  } else {
    await validateCommittedArtifacts(graphQLSchema, keystone, cwd);
    console.log('✨ GraphQL and Prisma schemas are up to date');
  }
  await generateNodeModulesArtifacts(graphQLSchema, keystone, config, cwd);
}
