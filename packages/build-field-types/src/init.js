// @flow
import { Package } from './package';
import { Project } from './project';
import { FatalError, FixableError } from './errors';
import { success, info } from './logger';
import { infos, confirms, errors } from './messages';
import { validateEntrypointSource, isMainFieldValid, isModuleFieldValid } from './validate';

async function doInit(pkg: Package) {
  pkg.entrypoints.forEach(entrypoint => {
    validateEntrypointSource(entrypoint);
  });
  if (pkg.entrypoints.every(entrypoint => isMainFieldValid(entrypoint))) {
    info(infos.validMainField, pkg);
  } else {
    let canWriteMainField = await confirms.writeMainField(pkg);
    if (!canWriteMainField) {
      throw new FatalError(errors.deniedWriteMainField, pkg);
    }
    pkg.setFieldOnEntrypoints('main');
  }

  let allEntrypointsAreMissingAModuleField = pkg.entrypoints.every(
    entrypoint => entrypoint.module === null
  );
  let someEntrypointsAreNotValid = pkg.entrypoints.some(
    entrypoint => !isModuleFieldValid(entrypoint)
  );
  if (allEntrypointsAreMissingAModuleField || someEntrypointsAreNotValid) {
    let canWriteModuleField = await confirms.writeModuleField(pkg);
    if (canWriteModuleField) {
      pkg.setFieldOnEntrypoints('module');
    } else if (!allEntrypointsAreMissingAModuleField) {
      throw new FixableError(errors.invalidModuleField, pkg);
    }
  } else {
    info(infos.validModuleField, pkg);
  }

  await Promise.all(pkg.entrypoints.map(x => x.save()));
}

export default async function init(directory: string) {
  let project = await Project.create(directory);

  await Promise.all(project.packages.map(doInit));

  success(project.packages.length > 1 ? 'initialised packages!' : 'initialised package!');
}
