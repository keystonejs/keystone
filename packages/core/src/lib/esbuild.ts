// WARNING: be careful not to import `esbuild` within next
import { type BuildOptions } from 'esbuild'

function identity (x: BuildOptions) { return x }

export function getEsbuildConfig (cwd: string): BuildOptions {
  let esbuildFn: typeof identity | undefined
  try {
    esbuildFn = require(require.resolve(`${cwd}/esbuild.keystone.js`))
  } catch (e) {}
  esbuildFn ??= identity

  return esbuildFn({
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
          build.onResolve({
            // don't bundle anything that is NOT a relative import
            //   WARNING: we can't use a negative lookahead/lookbehind because esbuild uses Go
            filter: /(?:^[^.])|(?:^\.[^/.])|(?:^\.\.[^/])/,
          }, ({ path }) => {
            return { external: true, path }
          })
        },
      },
    ],
  } satisfies BuildOptions)
}
