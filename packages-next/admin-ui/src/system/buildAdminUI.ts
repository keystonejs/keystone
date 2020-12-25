import Path from 'path';

export async function buildAdminUI(dotKeystoneDir: string) {
  // importing next/dist/build is quite expensive so we're requiring it lazily
  const build = (require('next/dist/build') as typeof import('next/dist/build')).default;
  await build(Path.join(dotKeystoneDir, 'admin'));
}
