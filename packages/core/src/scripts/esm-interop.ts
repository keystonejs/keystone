import esbuild, { type OnResolveArgs, type OnResolveResult, type PluginBuild } from 'esbuild'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

async function hasDefaultExport(filename: string): Promise<boolean> {
  const source = await fs.readFile(filename, 'utf8')
  if (!source.includes('default')) return false
  const { metafile } = await esbuild.build({
    entryPoints: [filename],
    bundle: false,
    format: 'esm',
    platform: 'node',
    write: false,
    metafile: true,
    logLevel: 'silent',
  })
  return Object.values(metafile.outputs)[0].exports.includes('default')
}

export function esmInterop(build: PluginBuild, resolveDir: string) {
  const esmPackages = new Map<string, Promise<boolean>>()
  const requireFromOutput = createRequire(path.join(resolveDir, 'package.json'))

  async function readPackageType(directory: string): Promise<boolean> {
    if (path.basename(directory) === 'node_modules') return false
    try {
      const pkg = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8'))
      return pkg.type === 'module'
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }
    const parent = path.dirname(directory)
    return parent === directory ? false : isESMPackage(parent)
  }

  function isESMPackage(directory: string): Promise<boolean> {
    if (!esmPackages.has(directory)) esmPackages.set(directory, readPackageType(directory))
    return esmPackages.get(directory)!
  }

  function isESM(filename: string) {
    if (/\.m[jt]s$/.test(filename)) return true
    if (!/\.[jt]sx?$/.test(filename)) return false
    return isESMPackage(path.dirname(filename))
  }

  async function resolveExternal(
    specifier: string,
    filename: string,
    args: Pick<OnResolveArgs, 'kind' | 'importer'>
  ): Promise<OnResolveResult | undefined> {
    if (
      args.kind === 'import-statement' &&
      (await isESM(args.importer)) &&
      (await isESM(filename))
    ) {
      // The proxy emits require(), so conditional exports must resolve to the same file.
      let resolvedFromOutput: string | undefined
      try {
        resolvedFromOutput = requireFromOutput.resolve(specifier)
      } catch {
        // Packages with import-only exports need a relative path too.
      }
      if (resolvedFromOutput !== filename) {
        const relativePath = path.relative(await fs.realpath(resolveDir), filename)
        specifier = relativePath.startsWith('.') ? relativePath : `./${relativePath}`
      }
      return {
        path: path.relative(build.initialOptions.absWorkingDir ?? process.cwd(), filename),
        namespace: 'keystone-esm-proxy',
        pluginData: { filename, specifier },
      }
    }
  }

  build.onStart(() => {
    esmPackages.clear()
  })
  build.onResolve({ filter: /^original$/, namespace: 'keystone-esm-proxy' }, args => ({
    path: args.pluginData,
    external: true,
  }))
  build.onLoad({ filter: /.*/, namespace: 'keystone-esm-proxy' }, async args => {
    const { filename, specifier } = args.pluginData
    let contents = 'export * from "original";\n'
    if (await hasDefaultExport(filename)) {
      // The default export loses the live binding but that's an acceptable trade off here
      contents += `const ns = require("original");
const value = ns.default;
export { value as default };`
    }
    return {
      contents,
      loader: 'js',
      pluginData: specifier,
      watchFiles: [filename],
    }
  })
  return { resolveExternal }
}
