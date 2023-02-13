import { buildAdminUI, generateAdminUI } from '../../admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../../artifacts';
import { getAdminPath } from '../utils';
import { loadConfigOnce } from '../../lib/config/loadConfig';
import { Flags } from '../cli';

export async function build(
  cwd: string,
  { frozen, prisma, ui }: Pick<Flags, 'frozen' | 'prisma' | 'ui'>
) {
  const config = await loadConfigOnce(cwd);
  const { graphQLSchema, adminMeta } = createSystem(config);

  if (prisma) {
    if (frozen) {
      await validateCommittedArtifacts(graphQLSchema, config, cwd);
      console.log('✨ GraphQL and Prisma schemas are up to date');
    } else {
      await generateCommittedArtifacts(graphQLSchema, config, cwd);
      console.log('✨ Generated GraphQL and Prisma schemas');
    }
    // FIXME: This needs to generate clients for the correct build target using binaryTarget
    // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);
  } else {
  }

  if (config.ui?.isDisabled) return;

  if (ui) {
    console.log('✨ Generating Admin UI code');
    await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd), false);

    console.log('✨ Building Admin UI');
    await buildAdminUI(getAdminPath(cwd));
  } else {
  }
}
