// @flow
import { Entrypoint } from './entrypoint';

export function getNameForDist(name: string): string {
  return name.replace(/.*\//, '');
}

export function getValidMainField(entrypoint: Entrypoint) {
  let nameForDist = getNameForDist(entrypoint.package.name);
  return `dist/${nameForDist}.cjs.js`;
}

export function getValidModuleField(entrypoint: Entrypoint) {
  let nameForDist = getNameForDist(entrypoint.package.name);
  return `dist/${nameForDist}.esm.js`;
}
