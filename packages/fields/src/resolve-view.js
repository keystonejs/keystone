import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-next/fields-legacy/package.json'));

export const resolveView = pathname => path.join(pkgDir, pathname);
