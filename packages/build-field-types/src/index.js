// @flow
import path from 'path';
import parentModule from 'parent-module';

export function importView(pathToImport: string) {
  return path.join(path.dirname(parentModule()), pathToImport);
}
