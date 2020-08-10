import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystonejs/fields-content/package.json'));

export const resolveView = pathname => path.join(pkgDir, pathname);
