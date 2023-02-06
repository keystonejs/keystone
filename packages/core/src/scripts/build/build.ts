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

export async function build(cwd: string, { ui = true, prisma = true, frozen }: Flags) {
  const config = await loadConfigOnce(cwd);
  const { graphQLSchema, adminMeta } = createSystem(config);

  if (prisma) {
    if (frozen) {
      await validateCommittedArtifacts(graphQLSchema, config, cwd);
    } else {
      await generateCommittedArtifacts(graphQLSchema, config, cwd);
    }

    console.log('✨ Building Keystone');
    // FIXME: This needs to generate clients for the correct build target using binaryTarget
    // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);
  } else {
    console.log('✨ Skipping Prisma Client code generation');
  }

  if (config.ui?.isDisabled) return;

  if (ui) {
    console.log('✨ Generating Admin UI code');
    await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd), false);

    console.log('✨ Building Admin UI');
    await buildAdminUI(getAdminPath(cwd));
  } else {
    console.log('✨ Skipping Admin UI code generation');
  }
}
