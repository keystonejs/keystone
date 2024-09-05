// WARNING: be careful not to import this file within next
import esbuild, { type BuildOptions } from 'esbuild'

function identity (x: BuildOptions) { return x }

export async function getEsbuildConfig (cwd: string): Promise<BuildOptions> {
  let esbuildFn: typeof identity | undefined

  try {
    try {
      await esbuild.build({
        entryPoints: ['./esbuild.keystone'],
        absWorkingDir: cwd,
        bundle: true,
        sourcemap: true,
        outfile: '.keystone/esbuild.js',
        format: 'cjs',
        platform: 'node',
        logLevel: 'silent'
      })
    } catch (e: any) {
      if (!e.errors?.some((err: any) => err.text.includes('Could not resolve'))) throw e
    }
    esbuildFn = require(require.resolve(`${cwd}/.keystone/esbuild.js`)).default
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err
  }
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
