const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml') // You'll need to install this packageCopy
const { execSync } = require('child_process')

// Function to read package.json and extract version
function getPublicPackageVersion (packagePath) {
  const pkgPath = path.join(packagePath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath)
    return pkg.version
  }
  return null
}

function findPackageJsonFiles (dir) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory()) {
      // Recursive case: it's a directory
      if (file === 'node_modules') {
        return
      }
      results = results.concat(findPackageJsonFiles(filePath))
    } else {
      // Base case: it's a file
      if (file === 'package.json') {
        results.push(filePath)
      }
    }
  })

  return results
}

function isVersionIncreased (oldVersion, newVersion) {
  const oldParts = oldVersion.split('.').map(Number)
  const newParts = newVersion.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (newParts[i] > oldParts[i]) return true
    if (newParts[i] < oldParts[i]) return false
  }
  return false
}

/**
 * Iterate through packages directory and extract versions of public packages
 */
const packagesDir = path.join(process.cwd(), 'packages')
const packageVersions = {}
fs.readdirSync(packagesDir).forEach(packageName => {
  const packagePath = path.join(packagesDir, packageName)
  if (fs.statSync(packagePath).isDirectory()) {
    const version = getPublicPackageVersion(packagePath)
    if (version) {
      packageVersions[packageName] = version
    }
  }
})

/**
 * Get catalog versions for shared deps like prisma, typescript etc
 */
const workspaceYaml = fs.readFileSync('./pnpm-workspace.yaml', 'utf8')
const workspaceConfig = yaml.load(workspaceYaml)
const catalogVersions = workspaceConfig.catalog || {}

/**
 * Update example package.json with new versions, triggering prisma generation
 * if @prisma/client has been updated.
 * @param {string} examplePath 
 */
function updateExamplePkg (examplePath) {
  const pkgPath = path.join(examplePath, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  let prismaClientUpdated = false

  // Update workspace dependencies
  for (const [name, version] of Object.entries(packageVersions)) {
    if (pkg.dependencies && pkg.dependencies[`@keystone-6/${name}`]) {
      pkg.dependencies[`@keystone-6/${name}`] = `^${version}`
    }
  }

  // Update catalog dependencies
  for (const [name, newVersion] of Object.entries(catalogVersions)) {
    if (pkg.dependencies && pkg.dependencies[name]) {
      const oldVersion = pkg.dependencies[name].replace('catalog:', '')

      if (name === '@prisma/client') {
        if (isVersionIncreased(oldVersion, newVersion)) {
          prismaClientUpdated = true
        }
      }
      pkg.dependencies[name] = `${newVersion}`
    }

    if (pkg.devDependencies && pkg.devDependencies[name]) {
      pkg.devDependencies[name] = `${newVersion}`
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  if (prismaClientUpdated === true) {
    console.log(`Updating GraphQL and Prisma schemas ${examplePath}`)
    try {
      execSync('pnpm keystone build --no-ui', { cwd: examplePath, stdio: 'inherit' })
    } catch (error) {
      console.error(`Error running command in ${examplePath}:`, error)
    }
  }
}

// Traverse the examples directory and update each package.json
const examplesDir = path.join(process.cwd(), 'examples')
const exampleDirsToSkip = ['nextjs-keystone-two-servers']
fs.readdirSync(examplesDir).forEach(example => {
  if (exampleDirsToSkip.includes(example)) {
    console.log(`Skipping directory: ${example}`)
    return // Skip this iteration
  }

  const examplePath = path.join(examplesDir, example)
  if (fs.statSync(examplePath).isDirectory()) {
    const packageJsonFiles = findPackageJsonFiles(examplePath)
    packageJsonFiles.forEach(packageJsonPath => {
      updateExamplePkg(path.dirname(packageJsonPath))
    })
  }
})

console.log('Package versions:', packageVersions)
console.log('Catalog versions:', catalogVersions)
console.log('Example packages updated successfully.')