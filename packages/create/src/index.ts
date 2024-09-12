import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import c from 'chalk'
import enquirer from 'enquirer'
import execa from 'execa'
import getPackageJson from 'package-json'
import meow from 'meow'
import ora from 'ora'

import thisPackage from '../package.json'

async function checkVersion () {
  const { version: upstream } = await getPackageJson('create-keystone-app')
  if (upstream === thisPackage.version) return

  console.error(`⚠️  You're running an old version of create-keystone-app, please update to ${upstream}`)
}

class UserError extends Error {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const starterDir = path.normalize(`${__dirname}/../starter`)

const cli = meow(`
Usage
  $ create-keystone-app [directory]
`)

async function normalizeArgs () {
  let directory = cli.input[0]
  if (!directory) {
    ({ directory } = await enquirer.prompt({
      type: 'input',
      name: 'directory',
      message: 'What directory should create-keystone-app generate your app into?',
      validate: (x) => !!x,
    }))
    process.stdout.write('\n')
  }

  return {
    directory: path.resolve(directory),
  }
}

(async () => {
  process.stdout.write('\n')
  console.log(`✨ You're about to generate a project using ${c.bold('Keystone 6')} packages.`)

  await checkVersion()
  const normalizedArgs = await normalizeArgs()
  const nextCwd = normalizedArgs.directory

  await fs.mkdir(nextCwd)
  await Promise.all([
    '_gitignore',
    'schema.ts',
    'package.json',
    'tsconfig.json',
    'keystone.ts',
    'auth.ts',
    'README.md',
  ].map((filename) =>
    fs.copyFile(
      path.join(starterDir, filename),
      path.join(normalizedArgs.directory, filename.replace(/^_/, '.'))
    )
  ))

  const [packageManager] = process.env.npm_config_user_agent?.split('/', 1) ?? ['npm']
  const spinner = ora(`Installing dependencies with ${packageManager}. This may take a few minutes.`).start()
  try {
    await execa(packageManager, ['install'], { cwd: nextCwd })
    spinner.succeed(`Installed dependencies with ${packageManager}.`)
  } catch (err) {
    spinner.fail(`Failed to install with ${packageManager}.`)
    throw err
  }

  const relativeProjectDir = path.relative(process.cwd(), normalizedArgs.directory)
  process.stdout.write('\n')
  console.log(`🎉  Keystone created a starter project in: ${c.bold(relativeProjectDir)}

  ${c.bold('To launch your app, run:')}

  - cd ${relativeProjectDir}
  - ${packageManager} run dev

  ${c.bold('Next steps:')}

  - Read ${c.bold(`${relativeProjectDir}${path.sep}README.md`)} for additional getting started details.
  - Edit ${c.bold(`${relativeProjectDir}${path.sep}keystone.ts`)} to customize your app.
  - Star Keystone on GitHub (https://github.com/keystonejs/keystone)
`)
})().catch((err) => {
  if (err instanceof UserError) {
    console.error(err.message)
  } else {
    console.error(err)
  }
  process.exit(1)
})
