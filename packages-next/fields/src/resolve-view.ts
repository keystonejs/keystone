import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-next/fields/package.json'));

export const resolveView = (pathname: string) => path.join(pkgDir, 'types', pathname);
