import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const workspacePath = new URL('../pnpm-workspace.yaml', import.meta.url)
const starterPackagePath = new URL('../packages/create/starter/package.json', import.meta.url)

const workspace = parse(readFileSync(workspacePath, 'utf8')) as {
  catalog?: Record<string, string>
}
const { catalog } = workspace
if (!catalog || typeof catalog !== 'object') {
  throw new Error(`No default catalog found in ${fileURLToPath(workspacePath)}`)
}

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const
type DependencyField = (typeof dependencyFields)[number]
type PackageJson = Partial<Record<DependencyField, Record<string, string>>>

const starterPackage = JSON.parse(readFileSync(starterPackagePath, 'utf8')) as PackageJson

let replacements = 0
for (const field of dependencyFields) {
  for (const [name, version] of Object.entries(starterPackage[field] ?? {})) {
    if (version !== 'catalog:') continue

    const catalogVersion = catalog[name]
    if (typeof catalogVersion !== 'string') {
      throw new Error(`${field}.${name} uses catalog: but is missing from the default catalog`)
    }

    starterPackage[field]![name] = catalogVersion
    replacements++
  }
}

writeFileSync(starterPackagePath, `${JSON.stringify(starterPackage, null, 2)}\n`)
console.log(`Resolved ${replacements} catalog dependencies in ${fileURLToPath(starterPackagePath)}`)
