import { bold } from 'chalk'
import {
  disableTelemetry,
  enableTelemetry,
  resetTelemetry,
  statusTelemetry,
  informTelemetry,
} from '../lib/telemetry'

export async function telemetry (cwd: string, command?: string) {
  const usageText = `
    Usage
      $ keystone telemetry [command]
    Commands
      disable     opt-out of telemetry, disabling telemetry for this system user
      enable      opt-in to telemetry
      reset       resets your telemetry configuration (if any)
      status      show if telemetry is enabled, disabled or uninitialised
      inform      show an informed consent notice

For more details visit: https://keystonejs.com/telemetry
    `

  if (command === 'disable') return disableTelemetry()
  if (command === 'enable') return enableTelemetry()
  if (command === 'reset') return resetTelemetry()
  if (command === 'status') return statusTelemetry()
  if (command === 'inform') return informTelemetry()
  if (command === '--help') {
    console.log(`${bold('Keystone Telemetry')}`)
    console.log(usageText)
    return
  }

  console.error(command ? `Invalid option: ${command}` : '')
  console.error(usageText)
}
