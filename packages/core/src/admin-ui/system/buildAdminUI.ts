// destructured to prevent inlining to `"production" = "production"`
const { env } = process;

export async function buildAdminUI(projectAdminPath: string) {
  const prevNodeEnv = env.NODE_ENV;
  // Next does a broken build unless we set NODE_ENV to production
  // @ts-ignore
  env.NODE_ENV = 'production';
  try {
    // importing next/dist/build is quite expensive so we're requiring it lazily
    /** We do this to stop webpack from bundling next inside of next */
    const next = 'next/dist/build';
    const build = require(next).default;
    await build(projectAdminPath);
  } finally {
    if (prevNodeEnv === undefined) {
      // @ts-ignore
      delete env.NODE_ENV;
    } else {
      // @ts-ignore
      env.NODE_ENV = prevNodeEnv;
    }
  }
}
