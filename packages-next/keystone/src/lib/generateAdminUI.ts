import fs from 'fs-extra';
import Path from 'path';

import type { Keystone } from '@keystone-next/types';
import { writeAdminFiles } from '@keystone-next/admin-ui/templates';
import { AdminFileToWrite, MaybePromise } from '@keystone-next/types';
import fastGlob from 'fast-glob';
import prettier from 'prettier';
import resolve from 'resolve';

export const formatSource = (src: string, parser: 'babel' | 'babel-ts' = 'babel') =>
  prettier.format(src, {
    parser,
    trailingComma: 'es5',
    singleQuote: true,
  });

function getDoesAdminConfigExist() {
  try {
    resolve.sync(Path.join(process.cwd(), 'admin', 'config'), {
      extensions: ['.ts', '.tsx', '.js'],
      preserveSymlinks: false,
    });
    return true;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

async function writeAdminFilesToDisk(
  promises: Array<MaybePromise<AdminFileToWrite[]>>,
  projectAdminPath: string
) {
  return (
    await Promise.all(
      promises.map(async filesToWritePromise => {
        const filesToWrite = await filesToWritePromise;
        return Promise.all(
          filesToWrite.map(async file => {
            const outputFilename = Path.join(projectAdminPath, file.outputPath);
            if (file.mode === 'copy') {
              if (!Path.isAbsolute(file.inputPath)) {
                throw new Error(
                  `An inputPath of ${JSON.stringify(
                    file.inputPath
                  )} was provided to copy but inputPaths must be absolute`
                );
              }
              const outputFilename = Path.join(projectAdminPath, file.outputPath);
              const outputDir = Path.dirname(outputFilename);
              await fs.ensureDir(outputDir);
              // TODO: should we use copyFile or copy?
              await fs.copyFile(file.inputPath, Path.join(projectAdminPath, file.outputPath));
            }
            if (file.mode === 'write') {
              await fs.outputFile(outputFilename, formatSource(file.src));
            }
            return outputFilename;
          })
        );
      }) ?? []
    )
  ).flat();
}

export const generateAdminUI = async (keystone: Keystone, cwd: string) => {
  const projectAdminPath = Path.resolve(cwd, './.keystone/admin');

  await fs.remove(projectAdminPath);
  const configFile = getDoesAdminConfigExist();

  const filesWritten = new Set(
    [
      ...(await writeAdminFilesToDisk(
        keystone.config.admin?.getAdditionalFiles?.map(x => x(keystone)) ?? [],
        projectAdminPath
      )),
    ].map(x => Path.normalize(x))
  );
  const baseFiles = writeAdminFiles(keystone, configFile).filter(x => {
    if (filesWritten.has(Path.normalize(x.outputPath))) {
      return false;
    }
    return true;
  });

  await writeAdminFilesToDisk([baseFiles], projectAdminPath);
  const userPagesDir = Path.join(cwd, 'admin', 'pages');
  const files = await fastGlob('**/*.{js,jsx,ts,tsx}', { cwd: userPagesDir });
  await Promise.all(
    files.map(async filename => {
      const outputFilename = Path.join(projectAdminPath, 'pages', filename);
      await fs.writeFile(
        Path.join(projectAdminPath, 'pages', filename),
        `export {default} from ${JSON.stringify(
          Path.relative(Path.dirname(outputFilename), Path.join(userPagesDir, filename))
        )}`
      );
    })
  );
};
