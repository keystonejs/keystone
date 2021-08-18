import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-next/keystone/package.json'));

export const resolveView = (pathname: string) => path.join(pkgDir, 'fields', 'types', pathname);
