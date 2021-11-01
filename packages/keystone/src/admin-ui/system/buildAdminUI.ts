export async function buildAdminUI(projectAdminPath: string) {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('process.env.NODE_ENV must be set to production to build the Admin UI');
  }
  // importing next/dist/build is quite expensive so we're requiring it lazily
  /** We do this to stop webpack from bundling next inside of next */
  const next = 'next/dist/build';
  const build = require(next).default;
  await build(projectAdminPath);
}
