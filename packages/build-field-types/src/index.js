// @flow
import path from 'path';
import parentModuleDirectory from 'parent-module';

export function importView(pathToImport: string) {
  return path.join(parentModuleDirectory, pathToImport);
}
