import fs from 'fs-extra';
import Path from 'path';

import fastGlob from 'fast-glob';
import prettier from 'prettier';
import resolve from 'resolve';
import { GraphQLSchema } from 'graphql';
import type { KeystoneConfig, BaseKeystone } from '@keystone-next/types';
import { AdminFileToWrite } from '@keystone-next/types';
import { writeAdminFiles } from '../templates';

export const formatSource = (src: string, parser: 'babel' | 'babel-ts' = 'babel') =>
  prettier.format(src, { parser, trailingComma: 'es5', singleQuote: true });

function getDoesAdminConfigExist() {
  try {
    const configPath = Path.join(process.cwd(), 'admin', 'config');
    resolve.sync(configPath, { extensions: ['.ts', '.tsx', '.js'], preserveSymlinks: false });
    return true;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

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
  return Path.normalize(outputFilename);
}

export const generateAdminUI = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  projectAdminPath: string
) => {
  // Nuke any existing files in our target directory
  await fs.remove(projectAdminPath);

  // Write out the files configured by the user
  const userPages = config.ui?.getAdditionalFiles?.map(x => x(config)) ?? [];
  const userFilesToWrite = (await Promise.all(userPages)).flat();
  const savedFiles = await Promise.all(
    userFilesToWrite.map(file => writeAdminFile(file, projectAdminPath))
  );
  const uniqueFiles = new Set(savedFiles);

  // Write out the built-in admin UI files. Don't overwrite any user-defined pages.
  const configFileExists = getDoesAdminConfigExist();
  const adminFiles = writeAdminFiles(
    config,
    graphQLSchema,
    keystone,
    configFileExists,
    projectAdminPath
  );
  const baseFiles = adminFiles.filter(x => !uniqueFiles.has(Path.normalize(x.outputPath)));

  // FIXME: This path corresponds to the hardcoded value in CONFIG_PATH
  const configModule = Path.join(projectAdminPath, '..', '..', 'keystone');
  const outputDir = Path.join('pages', 'api');
  const pathToConfig = Path.relative(Path.join(projectAdminPath, outputDir), configModule);
  // this should always exist, the user should not be able to override it.
  baseFiles.push({
    mode: 'write',
    outputPath: Path.join(outputDir, '__keystone_api_build.js'),
    src: `
    export { default as config } from '${pathToConfig}'
    export default function (req, res) {
      return res.status(500)
    }`,
  });
  await Promise.all(baseFiles.map(file => writeAdminFile(file, projectAdminPath)));

  // Add files to pages/ which point to any files which exist in admin/pages
  const userPagesDir = Path.join(process.cwd(), 'admin', 'pages');
  const files = await fastGlob('**/*.{js,jsx,ts,tsx}', { cwd: userPagesDir });

  await Promise.all(
    files.map(async filename => {
      const outputFilename = Path.join(projectAdminPath, 'pages', filename);
      const path = Path.relative(Path.dirname(outputFilename), Path.join(userPagesDir, filename));
      // Convert filesystem path separator to the `/` expected in JS imports
      const importPath = path.replace(new RegExp(`\\${Path.sep}`, 'g'), '/');
      await fs.outputFile(outputFilename, `export { default } from "${importPath}"`);
    })
  );
};
