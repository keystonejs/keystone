import { globSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const workspacePath = new URL('../pnpm-workspace.yaml', import.meta.url)
const workspaceDirectory = new URL('../', import.meta.url)
const starterPackagePath = new URL('../packages/create/starter/package.json', import.meta.url)

const workspace = parse(readFileSync(workspacePath, 'utf8')) as {
  catalog?: Record<string, string>
  packages?: string[]
}
const { catalog } = workspace
if (!catalog || typeof catalog !== 'object') {
  throw new Error(`No default catalog found in ${fileURLToPath(workspacePath)}`)
}
if (!Array.isArray(workspace.packages)) {
  throw new Error(`No workspace packages found in ${fileURLToPath(workspacePath)}`)
}

const workspacePackages = new Map<string, string>()
for (const packagePath of globSync(
  workspace.packages
    .filter(pattern => !pattern.startsWith('!'))
    .map(pattern => `${pattern}/package.json`),
  {
    cwd: workspaceDirectory,
    exclude: workspace.packages
      .filter(pattern => pattern.startsWith('!'))
      .map(pattern => `${pattern.slice(1)}/package.json`),
  }
)) {
  const packageJson = JSON.parse(
    readFileSync(new URL(packagePath, workspaceDirectory), 'utf8')
  ) as {
    name?: string
    version?: string
  }
  if (typeof packageJson.name !== 'string' || typeof packageJson.version !== 'string') continue

  if (workspacePackages.has(packageJson.name)) {
    throw new Error(`Duplicate workspace package ${packageJson.name}`)
  }
  workspacePackages.set(packageJson.name, packageJson.version)
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

let catalogReplacements = 0
let workspaceReplacements = 0
for (const field of dependencyFields) {
  for (const [name, version] of Object.entries(starterPackage[field] ?? {})) {
    if (version === 'workspace:^') {
      const workspaceVersion = workspacePackages.get(name)
      if (workspaceVersion === undefined) {
        throw new Error(`${field}.${name} uses workspace:^ but is not a workspace package`)
      }

      starterPackage[field]![name] = `^${workspaceVersion}`
      workspaceReplacements++
    } else if (version === 'catalog:') {
      const catalogVersion = catalog[name]
      if (typeof catalogVersion !== 'string') {
        throw new Error(`${field}.${name} uses catalog: but is missing from the default catalog`)
      }

      starterPackage[field]![name] = catalogVersion
      catalogReplacements++
    }
  }
}

writeFileSync(starterPackagePath, `${JSON.stringify(starterPackage, null, 2)}\n`)
console.log(
  `Resolved ${catalogReplacements} catalog and ${workspaceReplacements} workspace dependencies in ${fileURLToPath(starterPackagePath)}`
)
