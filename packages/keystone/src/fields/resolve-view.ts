import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-next/keystone/fields/package.json'));

export const resolveView = (pathname: string) => path.join(pkgDir, 'types', pathname);
