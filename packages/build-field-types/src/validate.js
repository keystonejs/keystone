// @flow
import { Project } from './project';
import { Entrypoint } from './entrypoint';
import { errors, successes, infos } from './messages';
import { FatalError, FixableError } from './errors';
import { getValidModuleField, getValidMainField } from './utils';
import { EXTENSIONS } from './constants';
import * as logger from './logger';
import resolve from 'resolve';

// this doesn't offer to fix anything
// just does validation
// used in build and watch

export function validateEntrypointSource(entrypoint: Entrypoint) {
  try {
    resolve.sync(entrypoint.source, { extensions: EXTENSIONS });
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new FatalError(errors.noSource(entrypoint.configSource), entrypoint);
    }
    throw e;
  }
}

export function isMainFieldValid(entrypoint: Entrypoint) {
  return entrypoint.main === getValidMainField(entrypoint.package.name);
}

export function isModuleFieldValid(entrypoint: Entrypoint) {
  return entrypoint.module === getValidModuleField(entrypoint.package.name);
}

export function validateEntrypoint(entrypoint: Entrypoint, log: boolean) {
  validateEntrypointSource(entrypoint);
  if (log) {
    logger.info(infos.validEntrypoint, entrypoint);
  }
  if (!isMainFieldValid(entrypoint)) {
    throw new FixableError(errors.invalidMainField, entrypoint);
  }
  if (log) {
    logger.info(infos.validMainField, entrypoint);
  }
  if (!isModuleFieldValid(entrypoint)) {
    throw new FixableError(errors.invalidModuleField, entrypoint);
  }
  if (log) {
    logger.info(infos.validModuleField, entrypoint);
  }
}

export default async function validate(directory: string) {
  let project = await Project.create(directory);

  for (let pkg of project.packages) {
    for (let entrypoint of pkg.entrypoints) {
      validateEntrypoint(entrypoint, true);
    }
  }
  logger.success(successes.validProject);
}
