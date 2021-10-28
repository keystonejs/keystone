import Path from 'path';
import fs from 'fs-extra';
import { AdminFileToWrite } from '../../types';
import { buildAdminUI, generateAdminUI } from '../../admin-ui/system';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { requireSource } from '../../lib/config/requireSource';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';
import { serializePathForImport } from '../../admin-ui/utils/serializePathForImport';
import { writeAdminFile } from '../../admin-ui/system/generateAdminUI';

const reexportKeystoneConfig = async (cwd: string, isDisabled?: boolean) => {
  const projectAdminPath = getAdminPath(cwd);
  const configPath = getConfigPath(cwd);
  if (isDisabled) {
    // Nuke any existing files in our target directory
    await fs.remove(projectAdminPath);
  }

  // We re-export the Keystone config file into the Admin UI project folder
  // so that when we run the build step, we will end up with a compiled version
  // of the configuration file in the .next/ directory. Even if we're not building
  // an Admin UI, we still need to run the `build()` function so that this config
  // file is correctly compiled.
  const pkgDir = Path.dirname(require.resolve('@keystone-next/keystone/package.json'));
  const p = serializePathForImport(
    Path.relative(Path.join(projectAdminPath, 'pages', 'api'), configPath)
  );
  const files: AdminFileToWrite[] = [
    {
      mode: 'write',
      src: `export { default as config } from ${p};
            export default function (req, res) { return res.status(500) }`,
      outputPath: Path.join('pages', 'api', '__keystone_api_build.js'),
    },
  ];
  if (isDisabled) {
    // These are the basic files required to have a valid Next.js project. If the
    // Admin UI is disabled then we need to do this ourselves here.
    files.push(
      {
        mode: 'copy' as const,
        inputPath: Path.join(pkgDir, 'static', 'next.config.js'),
        outputPath: 'next.config.js',
      },
      {
        mode: 'copy' as const,
        inputPath: Path.join(pkgDir, 'static', 'tsconfig.json'),
        outputPath: 'tsconfig.json',
      }
    );
  }
  await Promise.all(files.map(file => writeAdminFile(file, projectAdminPath)));
};

export async function build(cwd: string) {
  const config = initConfig(requireSource(getConfigPath(cwd)).default);

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
  }

  console.log('✨ Generating Keystone config code');
  await reexportKeystoneConfig(cwd, config.ui?.isDisabled);

  console.log('✨ Building Admin UI');
  await buildAdminUI(getAdminPath(cwd));
}
