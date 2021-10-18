import Path from 'path';
import fs from 'fs-extra';

import fastGlob from 'fast-glob';
import resolve from 'resolve';
import { GraphQLSchema } from 'graphql';
import type { KeystoneConfig, AdminMetaRootVal, AdminFileToWrite } from '../../types';
import { writeAdminFiles } from '../templates';
import { serializePathForImport } from '../utils/serializePathForImport';

function getDoesAdminConfigExist() {
  try {
    const configPath = Path.join(process.cwd(), 'admin', 'config');
    resolve.sync(configPath, { extensions: ['.ts', '.tsx', '.js'], preserveSymlinks: false });
    return true;
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

export async function writeAdminFile(file: AdminFileToWrite, projectAdminPath: string) {
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
  let content: undefined | string;
  try {
    content = await fs.readFile(outputFilename, 'utf8');
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  if (file.mode === 'write' && content !== file.src) {
    await fs.outputFile(outputFilename, file.src);
  }
  return Path.normalize(outputFilename);
}

export const generateAdminUI = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  projectAdminPath: string
) => {
  // Write out the files configured by the user
  const userFiles = config.ui?.getAdditionalFiles?.map(x => x(config)) ?? [];
  const userFilesToWrite = (await Promise.all(userFiles)).flat();
  const savedFiles = await Promise.all(
    userFilesToWrite.map(file => writeAdminFile(file, projectAdminPath))
  );
  const uniqueFiles = new Set(savedFiles);

  // Write out the built-in admin UI files. Don't overwrite any user-defined pages.
  const configFileExists = getDoesAdminConfigExist();
  const adminFiles = writeAdminFiles(
    config,
    graphQLSchema,
    adminMeta,
    configFileExists,
    projectAdminPath
  );

  // Add files to pages/ which point to any files which exist in admin/pages
  const userPagesDir = Path.join(process.cwd(), 'admin', 'pages');
  const userPagesEntries = await fastGlob('**/*.{js,jsx,ts,tsx}', { cwd: userPagesDir });
  for (const filename of userPagesEntries) {
    const outputFilename = Path.join('pages', filename);
    const path = Path.relative(Path.dirname(outputFilename), Path.join(userPagesDir, filename));
    const importPath = serializePathForImport(path);
    adminFiles.push({
      mode: 'write',
      outputPath: outputFilename,
      src: `export { default } from ${importPath}`,
    });
  }

  const allAdminFiles = adminFiles.filter(
    x => !uniqueFiles.has(Path.normalize(Path.join(projectAdminPath, x.outputPath)))
  );

  const filesToNotDelete = allAdminFiles.map(x => x.outputPath);
  filesToNotDelete.push(Path.join(projectAdminPath, '.next'));
  filesToNotDelete.push(Path.join(projectAdminPath, 'pages', 'api', '__keystone_api_build.js'));

  // await fs.remove(Path.join(projectAdminPath, 'public'));
  // const filesToDelete = await fastGlob(['**/*'], {
  //   cwd: projectAdminPath,
  //   ignore: filesToNotDelete,
  //   absolute: true,
  // });

  // await Promise.all(filesToDelete.map(filepath => fs.remove(filepath)));

  await Promise.all(allAdminFiles.map(file => writeAdminFile(file, projectAdminPath)));

  // const publicDirectory = Path.join(projectAdminPath, 'public');

  // if (config.images || config.files) {
  //   await fs.mkdir(publicDirectory, { recursive: true });
  // }

  // if (config.images) {
  //   const storagePath = Path.resolve(config.images.local?.storagePath ?? './public/images');
  //   await fs.mkdir(storagePath, { recursive: true });
  //   await fs.symlink(
  //     Path.relative(publicDirectory, storagePath),
  //     Path.join(publicDirectory, 'images'),
  //     'junction'
  //   );
  // }

  // if (config.files) {
  //   const storagePath = Path.resolve(config.files.local?.storagePath ?? './public/files');
  //   await fs.mkdir(storagePath, { recursive: true });
  //   await fs.symlink(
  //     Path.relative(publicDirectory, storagePath),
  //     Path.join(publicDirectory, 'files'),
  //     'junction'
  //   );
  // }
};
