import { platform } from 'node:os'
import https from 'node:https'

import ci from 'ci-info'
import Conf from 'conf'
import {
  bold,
  blue as b,
  yellow as y,
  red as r,
  green as g,
  grey,
} from 'chalk'
import {
  type Device,
  type Project,
  type TelemetryVersion1,
  type TelemetryVersion2,
} from '../types/telemetry'
import { type DatabaseProvider } from '../types'
import { type InitialisedList } from './core/initialise-lists'

const defaultTelemetryEndpoint = 'https://telemetry.keystonejs.com/3/'

function log (message: unknown) {
  if (process.env.KEYSTONE_TELEMETRY_DEBUG === '1') {
    console.log(`${message}`)
  }
}

type Telemetry = TelemetryVersion2
type TelemetryOK = Exclude<Telemetry, false | undefined>
type Configuration = ReturnType<typeof getTelemetryConfig>['userConfig']

function getTelemetryConfig () {
  const userConfig = new Conf<{
    telemetry?: TelemetryVersion2
  }>({
    projectName: 'keystonejs',
    projectSuffix: '',
    projectVersion: '3.0.0',
    migrations: {
      '^2.0.0': (store) => {
        const existing = store.get('telemetry') as TelemetryVersion1
        if (!existing) return // skip non-configured or known opt-outs

        const replacement: TelemetryVersion2 = {
          informedAt: null, // re-inform
          device: {
            lastSentDate: existing.device.lastSentDate ?? null,
          },
          projects: {}, // see below
        }

        // copy existing project.lastSentDate's
        for (const [projectPath, project] of Object.entries(existing.projects)) {
          if (projectPath === 'default') continue // informedAt moved to device.lastSentDate

          // dont copy garbage
          if (typeof project !== 'object') continue
          if (typeof project.lastSentDate !== 'string') continue
          if (new Date(project.lastSentDate).toString() === 'Invalid Date') continue

          // retain lastSentDate
          replacement.projects[projectPath] = {
            lastSentDate: project.lastSentDate,
          }
        }

        store.set('telemetry', replacement satisfies TelemetryVersion2)
      },
      '^3.0.0': (store) => {
        const existing = store.get('telemetry') as TelemetryVersion2
        if (!existing) return // skip non-configured or known opt-outs

        store.set('telemetry', {
          ...existing,
          informedAt: null, // re-inform
        } satisfies Telemetry)
      },
    },
  })

  return {
    telemetry: userConfig.get('telemetry'),
    userConfig,
  }
}

function getDefault (telemetry: Telemetry) {
  if (telemetry) return telemetry
  return {
    informedAt: null,
    device: {
      lastSentDate: null,
    },
    projects: {},
  } satisfies Telemetry // help Typescript infer the type
}

const todaysDate = new Date().toISOString().slice(0, 10)

function collectFieldCount (lists: Record<string, InitialisedList>) {
  const fields: Project['fields'] = { unknown: 0 }

  for (const list of Object.values(lists)) {
    for (const [fieldPath, field] of Object.entries(list.fields)) {
      const fieldType = field.__ksTelemetryFieldTypeName
      if (!fieldType) {
        // skip id fields
        if (fieldPath.endsWith('id')) continue
        fields.unknown++
        continue
      }

      fields[fieldType] ||= 0
      fields[fieldType] += 1
    }
  }

  return fields
}

async function collectPackageVersions () {
  const packages: Project['packages'] = {
    '@keystone-6/core': '0.0.0', // "unknown"
  }

  for (const packageName of [
    '@keystone-6/core',
    '@keystone-6/auth',
    '@keystone-6/fields-document',
    '@keystone-6/cloudinary',
    '@keystone-6/session-store-redis',
    '@opensaas/keystone-nextjs-auth',
  ]) {
    try {
      const packageJson = require(`${packageName}/package.json`)
      // const packageJson = await import(`${packageName}/package.json`, { assert: { type: 'json' } }) // TODO: broken in jest
      packages[packageName] = packageJson.version
    } catch (err) {
      // do nothing, the package is probably not installed
    }
  }

  return packages
}

function printNext (telemetry: Telemetry) {
  if (!telemetry) {
    console.log(`Telemetry data will ${r`not`} be sent by this system user`)
    return
  }
  console.log(`Telemetry data will be sent the next time you run ${g`"keystone dev"`}`)
}

function printTelemetryStatus (telemetry: Telemetry, updated = false) {
  const auxverb = updated ? 'has been' : 'is'

  if (telemetry === undefined) {
    console.log(`Keystone telemetry ${auxverb} ${y`uninitialized`}`)
    console.log()
    printNext(telemetry)
    return
  }

  if (telemetry === false) {
    console.log(`Keystone telemetry ${auxverb} ${r`disabled`}`)
    console.log()
    printNext(telemetry)
    return
  }

  console.log(`Keystone telemetry ${auxverb} ${g`enabled`}`)
  console.log()

  console.log(`  Device telemetry was last sent on ${telemetry.device.lastSentDate}`)
  for (const [projectPath, project] of Object.entries(telemetry.projects)) {
    console.log(`  Project telemetry for "${y(projectPath)}" was last sent on ${project?.lastSentDate}`)
  }

  console.log()
  printNext(telemetry)
}

function inform (
  telemetry: TelemetryOK,
  userConfig: Configuration
) {
  console.log() // gap to help visiblity
  console.log(`${bold('Keystone Telemetry')}`)
  console.log(`${y`Keystone collects anonymous data when you run`} ${g`"keystone dev"`}`)
  console.log(`You can use ${g`"keystone telemetry --help"`} to update your preferences at any time`)
  if (telemetry.informedAt === null) {
    console.log()
    console.log(`No telemetry data has been sent as part of this notice`)
  }
  console.log()
  printNext(telemetry)
  console.log() // gap to help visiblity
  console.log(`For more information, including how to opt-out see ${grey`https://keystonejs.com/telemetry`} (updated ${b`2024-08-20`})`)

  // update the informedAt
  telemetry.informedAt = new Date().toJSON()
  userConfig.set('telemetry', telemetry)
}

async function sendEvent (eventType: 'project', eventData: Project): Promise<void>
async function sendEvent (eventType: 'device', eventData: Device): Promise<void>
async function sendEvent (eventType: 'project' | 'device', eventData: Project | Device) {
  const endpoint = process.env.KEYSTONE_TELEMETRY_ENDPOINT || defaultTelemetryEndpoint
  await new Promise<void>((resolve) => {
    const req = https.request(`${endpoint}${eventType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, () => resolve())

    req.once('error', (err) => {
      log(err?.message ?? err)
      resolve()
    })
    req.end(JSON.stringify(eventData))
  })

  log(`sent ${eventType} report`)
}

async function sendProjectTelemetryEvent (
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider,
  telemetry: TelemetryOK,
  userConfig: Configuration
) {
  const project = telemetry.projects[cwd] ?? { lastSentDate: null }
  const { lastSentDate } = project
  if (lastSentDate && lastSentDate === todaysDate) {
    log('project telemetry already sent today')
    return
  }

  await sendEvent('project', {
    lastSentDate,
    packages: await collectPackageVersions(),
    database: dbProviderName,
    lists: Object.keys(lists).length,
    fields: collectFieldCount(lists),
  })

  // update the project lastSentDate
  telemetry.projects[cwd] = { lastSentDate: todaysDate }
  userConfig.set('telemetry', telemetry)
}

async function sendDeviceTelemetryEvent (
  telemetry: TelemetryOK,
  userConfig: Configuration
) {
  const { lastSentDate } = telemetry.device
  if (lastSentDate && lastSentDate === todaysDate) {
    log('device telemetry already sent today')
    return
  }

  await sendEvent('device', {
    lastSentDate,
    os: platform(),
    node: process.versions.node.split('.')[0],
  })

  // update the device lastSentDate
  telemetry.device = { lastSentDate: todaysDate }
  userConfig.set('telemetry', telemetry)
}

export async function runTelemetry (
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider
) {
  try {
    if (
      ci.isCI || // don't run in CI
      process.env.NODE_ENV === 'production' || // don't run in production
      process.env.KEYSTONE_TELEMETRY_DISABLED === '1' // don't run if the user has disabled it
    ) {
      return
    }

    const { telemetry, userConfig } = getTelemetryConfig()

    // don't run if the user has opted out
    //   or if somehow our defaults are problematic, do nothing
    if (telemetry === false) return

    // don't send telemetry before we inform the user, allowing opt-out
    const telemetryDefaulted = getDefault(telemetry)
    if (!telemetryDefaulted.informedAt) return inform(telemetryDefaulted, userConfig)

    await sendProjectTelemetryEvent(cwd, lists, dbProviderName, telemetryDefaulted, userConfig)
    await sendDeviceTelemetryEvent(telemetryDefaulted, userConfig)
  } catch (err: any) {
    log(err?.message ?? err)
  }
}

export function statusTelemetry (updated = false) {
  const { telemetry } = getTelemetryConfig()
  printTelemetryStatus(telemetry, updated)
}

export function informTelemetry () {
  const { userConfig } = getTelemetryConfig()
  inform(getDefault(false), userConfig)
}

export function enableTelemetry () {
  const { telemetry, userConfig } = getTelemetryConfig()
  if (!telemetry) {
    userConfig.set('telemetry', getDefault(telemetry))
  }
  statusTelemetry(true)
}

export function disableTelemetry () {
  const { userConfig } = getTelemetryConfig()
  userConfig.set('telemetry', false)
  statusTelemetry(true)
}

export function resetTelemetry () {
  const { userConfig } = getTelemetryConfig()
  userConfig.delete('telemetry')
  statusTelemetry(true)
}
