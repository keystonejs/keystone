// WARNING: be careful not to import `esbuild` within next
import { type BuildOptions } from 'esbuild'

export function getEsbuildConfig (cwd: string): BuildOptions {
  try {
    return require(require.resolve(`${cwd}/esbuild.keystone.js`))
  } catch (e) {}

  // default fallback
  return {
    entryPoints: ['./keystone'],
    absWorkingDir: cwd,
    bundle: true,
    sourcemap: true,
    // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
    outfile: '.keystone/config.js',
    format: 'cjs',
    platform: 'node',
    plugins: [
      {
        name: 'external-node_modules',
        setup (build) {
          build.onResolve(
            {
              // don't bundle anything that is NOT a relative import
              //   WARNING: we can't use a negative lookahead/lookbehind because esbuild uses Go
              filter: /(?:^[^.])|(?:^\.[^/.])|(?:^\.\.[^/])/,
            },
            ({ path }) => {
              return { external: true, path }
            }
          )
        },
      },
    ],
  }
}
