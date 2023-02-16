import { buildAdminUI, generateAdminUI } from '../../admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import {
  getSystemPaths,
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../../artifacts';
import { loadConfigOnce } from '../../lib/config/loadConfig';
import { Flags } from '../cli';

export async function build(
  cwd: string,
  { frozen, prisma, ui }: Pick<Flags, 'frozen' | 'prisma' | 'ui'>
) {
  const config = await loadConfigOnce(cwd);
  const { graphQLSchema, adminMeta } = createSystem(config);

  const paths = getSystemPaths(cwd, config);
  if (prisma) {
    if (frozen) {
      await validateCommittedArtifacts(cwd, config, graphQLSchema);
      console.log('✨ GraphQL and Prisma schemas are up to date');
    } else {
      await generateCommittedArtifacts(cwd, config, graphQLSchema);
      console.log('✨ Generated GraphQL and Prisma schemas');
    }
    // FIXME: This needs to generate clients for the correct build target using binaryTarget
    // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options

    await generateNodeModulesArtifacts(cwd, config, graphQLSchema);
  }

  if (config.ui?.isDisabled || !ui) return;

  console.log('✨ Generating Admin UI code');
  await generateAdminUI(config, graphQLSchema, adminMeta, paths.admin, false);

  console.log('✨ Building Admin UI');
  await buildAdminUI(paths.admin);
}
