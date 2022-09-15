import { buildAdminUI, generateAdminUI } from '../../admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../../artifacts';
import { getAdminPath } from '../utils';
import { loadConfigOnce } from '../../lib/config/loadConfig';

export async function build(cwd: string) {
  const config = await loadConfigOnce(cwd);

  const { graphQLSchema, adminMeta } = createSystem(config);

  await validateCommittedArtifacts(graphQLSchema, config, cwd);

  console.log('✨ Building Keystone');
  // FIXME: This needs to generate clients for the correct build target using binaryTarget
  // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
  await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

  if (config.ui?.isDisabled) {
    console.log('✨ Skipping Admin UI code generation');
  } else {
    console.log('✨ Generating Admin UI code');
    await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd), false);
    console.log('✨ Building Admin UI');
    await buildAdminUI(getAdminPath(cwd));
  }
}
