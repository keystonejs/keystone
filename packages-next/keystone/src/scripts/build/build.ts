import Path from 'path';
import prettier from 'prettier';
import fs from 'fs-extra';
import { buildAdminUI, generateAdminUI } from '@keystone-next/admin-ui/system';
import { AdminFileToWrite } from '@keystone-next/types';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { requireSource } from '../../lib/config/requireSource';
import { generateNodeModulesArtifacts, validateCommittedArtifacts } from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';
import { createAdminMeta } from '../../lib/createAdminMeta';

// FIXME: Duplicated from admin-ui package. Need to decide on a common home.
async function writeAdminFile(file: AdminFileToWrite, projectAdminPath: string) {
  const outputFilename = Path.join(projectAdminPath, file.outputPath);
  if (file.mode === 'copy') {
    if (!Path.isAbsolute(file.inputPath)) {
      throw new Error(
        `An inputPath of "${file.inputPath}" was provided to copy but inputPaths must be absolute`
      );
    }
    await fs.ensureDir(Path.dirname(outputFilename));
    // TODO: should we use copyFile or copy?
    await fs.copyFile(file.inputPath, outputFilename);
  }
  if (file.mode === 'write') {
    await fs.outputFile(outputFilename, formatSource(file.src));
  }
}

// FIXME: Duplicated from admin-ui package. Need to decide on a common home.
export function serializePathForImport(path: string) {
  // JSON.stringify is important here because it will escape windows style paths(and any thing else that might potentionally be in there)
  return JSON.stringify(
    path
      // Next is unhappy about imports that include .ts/tsx in them because TypeScript is unhappy with them becasue when doing a TypeScript compilation with tsc, the imports won't be written so they would be wrong there
      .replace(/\.tsx?$/, '')
  );
}

// FIXME: Duplicated from admin-ui package. Need to decide on a common home.
export const formatSource = (src: string, parser: 'babel' | 'babel-ts' = 'babel') =>
  prettier.format(src, { parser, trailingComma: 'es5', singleQuote: true });

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
  const pkgDir = Path.dirname(require.resolve('@keystone-next/admin-ui/package.json'));
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

  const { graphQLSchema, lists } = createSystem(config);

  await validateCommittedArtifacts(graphQLSchema, config, cwd);

  console.log('✨ Building Keystone');
  // FIXME: This needs to generate clients for the correct build target using binaryTarget
  // https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options
  await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

  if (config.ui?.isDisabled) {
    console.log('✨ Skipping Admin UI code generation');
  } else {
    console.log('✨ Generating Admin UI code');
    await generateAdminUI(
      config,
      lists,
      graphQLSchema,
      createAdminMeta(config, lists),
      getAdminPath(cwd)
    );
  }

  console.log('✨ Generating Keystone config code');
  await reexportKeystoneConfig(cwd, config.ui?.isDisabled);

  console.log('✨ Building Admin UI');
  await buildAdminUI(getAdminPath(cwd));
}
