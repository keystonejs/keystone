// @flow
import path from 'path';
import parentModule from 'parent-module';

export function importView(pathToImport: string) {
  return path.join(parentModule(), pathToImport);
}
