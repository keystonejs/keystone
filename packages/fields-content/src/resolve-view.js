import path from 'path';

const pkgDir = path.dirname(__dirname);

export const resolveView = pathname => path.join(pkgDir, pathname);
