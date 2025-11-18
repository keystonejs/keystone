// WARNING: be careful not to import this file within next
import esbuild, { type BuildOptions } from 'esbuild'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import nodePath from 'node:path'

function identity(x: BuildOptions) {
  return x
}

async function getEsbuildConfigFn(
  cwd: string
): Promise<((x: BuildOptions) => BuildOptions | Promise<BuildOptions>) | undefined> {
  try {
    await esbuild.build({
      entryPoints: ['./esbuild.keystone'],
      absWorkingDir: cwd,
      bundle: true,
      sourcemap: true,
      outfile: '.keystone/esbuild.js',
      format: 'cjs',
      platform: 'node',
      logLevel: 'silent',
    })
  } catch (e: any) {
    if (!e.errors?.some((err: any) => err.text.includes('Could not resolve'))) throw e
    return
  }
  try {
    return require(require.resolve(`${cwd}/.keystone/esbuild.js`)).default
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err
  }
}

export async function getEsbuildConfig(cwd: string): Promise<BuildOptions> {
  const esbuildFn = (await getEsbuildConfigFn(cwd)) ?? identity
  const resolveDir = nodePath.join(cwd, '.keystone')
  const importer = nodePath.join(cwd, '.keystone/config.js')
  // we need the .keystone directory to exist so when we resolve from it below, it actually exists
  await fs.mkdir(resolveDir, {
    // while we don't need to actually make this recursive,
    // this will make mkdir not error when the directory already exists
    recursive: true,
  })
  return esbuildFn({
    entryPoints: ['./keystone'],
    absWorkingDir: cwd,
    bundle: true,
    sourcemap: true,
    jsx: 'automatic',
    // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
    outfile: '.keystone/config.js',
    format: 'cjs',
    platform: 'node',
    plugins: [
      {
        name: 'external-node_modules',
        setup(build) {
          build.onResolve(
            {
              namespace: 'file',
              // anything this is a relative path, we know that we definitely want to bundle it
              // so we can skip running the function
              //   WARNING: we can't use a negative lookahead/lookbehind because esbuild uses Go
              filter: /(?:^[^.])|(?:^\.[^/.])|(?:^\.\.[^/])/,
            },
            async ({ path, ...args }) => {
              const resolved = await build.resolve(path, {
                ...args,
                namespace: 'inner',
              })
              if (
                // we want to bundle everything _except_ node_modules
                // to avoid problems with duplicate instances of modules
                // note that this will still bundle monorepo dependencies
                // since the realpath of the modules will be outside node_modules
                // even though they're symlinked into node_modules
                resolved.path.includes('node_modules')
              ) {
                const resolvedFromOutputMaybeEsm = await build.resolve(path, {
                  resolveDir,
                  importer,
                  kind: 'import-statement',
                  namespace: 'inner',
                })
                // if Node will be able to resolve the module using the path written,
                // we can emit imports that are the same as what was written
                if (resolved.path === resolvedFromOutputMaybeEsm.path) {
                  return { path, external: true }
                }
                // otherwise, we need to use longer relative paths to exactly where the module is
                // this might involve imports that look like
                // ../../packages/something/node_modules/something/index.js
                // which is unfortunate, but not really a significant problem
                // we also want to resolve it with node:module createRequire
                // so that we'll get the cjs version
                const resolvedFromImporterCjs = createRequire(args.importer).resolve(path)
                return {
                  path: nodePath.relative('.keystone', resolvedFromImporterCjs),
                  external: true,
                }
              }
              if (
                // this exception is purely here for projects in the keystone repo itself
                // since if we bundled @keystone-6/core, we would cause problems with the duplicated
                // when using a published version of keystone, this should absolutely nothing
                // since imports to @keystone-6/core will be in node_modules
                path.startsWith('@keystone-6/core')
              ) {
                return { path, external: true }
              }
              return resolved
            }
          )
        },
      },
    ],
  })
}
