import type { DatabaseProvider } from './core'

export type TelemetryVersion1 =
  | undefined
  | false
  | {
      device: { lastSentDate?: string, informedAt: string }
      projects: {
        default: { lastSentDate?: string, informedAt: string }
        [projectPath: string]: { lastSentDate?: string, informedAt: string }
      }
    }

export type TelemetryVersion2 =
  | undefined
  | false
  | {
    informedAt: string | null
    device: {
      lastSentDate: string | null
    }
    projects: Partial<{
      [projectPath: string]: {
        lastSentDate: string
      }
    }>
  }

export type Device = {
  lastSentDate: string | null // new Date().toISOString().slice(0, 10)
  os: string // `linux` | `darwin` | `windows` | ... // os.platform()
  node: string // `14` | ... | `18` // process.version.split('.').shift().slice(1)
}

export type Project = {
  lastSentDate: string | null // new Date().toISOString().slice(0, 10)
  // omitted uuid for <BII
  // omitted anything GraphQL related <BII

  // filtered to packages with the prefixes
  // - `@keystone-6`
  // - `@opensaas`
  // - ...
  packages: Partial<Record<string, string>>
  database: DatabaseProvider
  lists: number
  fields: {
    // uses `field.__ksTelemetryFieldTypeName`, default is `unknown`
    [key: string]: number
  }
}
