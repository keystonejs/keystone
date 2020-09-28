import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-spike/fields/package.json'));

export const resolveView = (pathname: string) => path.join(pkgDir, 'types', pathname);
