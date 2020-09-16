import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystonejs/fields-cloudinary-image/package.json'));

export const resolveView = pathname => path.join(pkgDir, pathname);
