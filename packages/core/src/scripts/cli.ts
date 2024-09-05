import meow from 'meow'
import { ExitError } from './utils'
import { build } from './build'
import { dev } from './dev'
import { prisma } from './prisma'
import { start } from './start'
import { migrateCreate, migrateApply } from './migrate'
import { telemetry } from './telemetry'

export type Flags = {
  dbPush: boolean
  fix: boolean // TODO: deprecated, remove in breaking change
  frozen: boolean
  prisma: boolean
  server: boolean
  ui: boolean
  withMigrations: boolean
}

function defaultFlags (flags: Partial<Flags>, defaults: Partial<Flags>) {
  flags = { ...defaults, ...flags }

  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined && !(key in defaults)) {
      // TODO: maybe we should prevent other flags?
      //throw new Error(`Option '${key}' is unsupported for this command`);
      continue
    }

    const defaultValue = defaults[key as keyof Flags]
    // should we default the flag?
    if (value === undefined) {
      flags[key as keyof Flags] = defaultValue
    }

    if (typeof value !== typeof defaultValue) {
      throw new Error(`Option '${key}' should be of type ${typeof defaultValue}`)
    }
  }
  return flags as Flags
}

export async function cli (cwd: string, argv: string[]) {
  const { input, help, flags } = meow(
    `
    Usage
      $ keystone [command] [options]

    Commands
        dev             start the project in development mode (default)
        migrate create  build the project for development and create a migration from the Prisma diff
        migrate apply   build the project for development and apply any pending migrations
        postinstall     build the project for development
        build           build the project (required by \`keystone start\` and \`keystone prisma\`)
        telemetry       sets telemetry preference (enable/disable/status)

        start           start the project
        prisma          use prisma commands in a Keystone context

    Options
      --fix (postinstall) @deprecated
        do build the graphql or prisma schemas, don't validate them

      --frozen (build, migrate)
        don't build the graphql or prisma schemas, only validate them

      --no-db-push (dev)
        don't push any updates of your Prisma schema to your database

      --no-prisma (build, dev)
        don't build or validate the prisma schema

      --no-server (dev, start)
        don't start the express server

      --no-ui (build, dev, start)
        don't build and serve the AdminUI

      --with-migrations (start)
        trigger prisma to run migrations as part of startup
    `,
    {
      argv,
    }
  )

  const command = input.join(' ') || 'dev'

  if (command === 'dev') {
    return dev(cwd, defaultFlags(flags, { dbPush: true, prisma: true, server: true, ui: true }))
  }

  if (command === 'migrate create') {
    return migrateCreate(cwd, defaultFlags(flags, { ui: false }))
  }

  if (command === 'migrate apply') {
    return migrateApply(cwd, defaultFlags(flags, { ui: false }))
  }

  if (command === 'build') {
    return build(cwd, defaultFlags(flags, { frozen: false, prisma: true, ui: true }))
  }

  if (command === 'start') {
    return start(cwd, defaultFlags(flags, { server: true, ui: true, withMigrations: false }))
  }

  if (command.startsWith('prisma')) {
    return prisma(cwd, argv.slice(1), Boolean(flags.frozen))
  }

  if (command.startsWith('telemetry')) {
    return telemetry(cwd, argv[1])
  }

  // WARNING: postinstall is an alias for `build --frozen --no-ui`
  if (command === 'postinstall') {
    return build(cwd, {
      frozen: !defaultFlags(flags, { fix: false }).fix,
      prisma: true,
      ui: false,
    })
  }

  console.log(`${command} is an unknown command`)
  console.log(help)
  throw new ExitError(1)
}
