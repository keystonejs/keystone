import { getAdminPath } from '@keystone-next/keystone/src/scripts/utils';

export async function buildAdminUI(cwd: string) {
  // importing next/dist/build is quite expensive so we're requiring it lazily
  /** We do this to stop webpack from bundling next inside of next */
  const next = 'next/dist/build';
  const build = require(next).default;
  await build(getAdminPath(cwd));
}
