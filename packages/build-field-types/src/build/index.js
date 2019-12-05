import { Project } from '../project';
import path from 'path';
import { rollup } from './rollup';
import { getAliases } from './aliases';
import * as logger from '../logger';
import * as fs from 'fs-extra';
import { getRollupConfigs } from './config';
import { createWorker, destroyWorker } from '../worker-client';

async function buildPackage(pkg, aliases) {
  let configs = getRollupConfigs(pkg, aliases);
  await Promise.all([
    fs.remove(path.join(pkg.directory, 'dist')),
    ...pkg.entrypoints.map(entrypoint => {
      return fs.remove(path.join(entrypoint.directory, 'dist'));
    }),
  ]);

  await Promise.all(
    configs.map(async ({ config, outputs }) => {
      let bundle = await rollup(config);
      await Promise.all(
        outputs.map(outputConfig => {
          return bundle.write(outputConfig);
        })
      );
    })
  );
}

async function retryableBuild(pkg, aliases) {
  try {
    await buildPackage(pkg, aliases);
  } catch (err) {
    if (err instanceof Promise) {
      await err;
      await retryableBuild(pkg, aliases);
      return;
    }
    throw err;
  }
}

export default async function build(directory) {
  try {
    createWorker();

    let project = await Project.create(directory);

    logger.info('building bundles!');

    let aliases = getAliases(project);
    await Promise.all(project.packages.map(pkg => retryableBuild(pkg, aliases)));

    logger.success('built bundles!');
  } finally {
    destroyWorker();
  }
}
