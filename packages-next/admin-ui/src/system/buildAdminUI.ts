export async function buildAdminUI(projectAdminPath: string) {
  // importing next/dist/build is quite expensive so we're requiring it lazily
  const next = 'next/dist/build';
  const build = require(next).default;
  await build(projectAdminPath);
}
