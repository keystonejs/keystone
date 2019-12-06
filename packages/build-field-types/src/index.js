import path from 'path';
import parentModule from 'parent-module';

export function importView(pathToImport) {
  return path.join(path.dirname(parentModule()), pathToImport);
}
