export async function buildAdminUI(projectAdminPath: string) {
  // importing next/dist/build is quite expensive so we're requiring it lazily
  /** We do this to stop webpack from bundling next inside of next */
  const next = 'next/dist/build';
  const build = require(next).default;
  await build(projectAdminPath);
}
