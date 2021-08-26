import path from 'path';
import { packagePath } from '../package-path';

export const resolveView = (pathname: string) =>
  path.join(packagePath, 'fields', 'types', pathname);
