import chalk from 'chalk';
import {
  printTelemetryStatus,
  enableTelemetry,
  disableTelemetry,
  resetTelemetry,
} from '../lib/telemetry';

export async function telemetry(cwd: string, command?: string) {
  const usageText = `
    Usage
      $ keystone telemetry [command]
    Commands
      disable     opt-out of telemetry, disabled for this system user
      enable      opt-in to telemetry
      reset       resets your telemetry configuration (if any)
      status      show if telemetry is enabled, disabled or uninitialised

For more details visit: https://keystonejs.com/telemetry
    `;

  if (command === 'disable') return disableTelemetry();
  if (command === 'enable') return enableTelemetry();
  if (command === 'reset') return resetTelemetry();
  if (command === 'status') return printTelemetryStatus();
  if (command === '--help') {
    console.log(`${chalk.bold('Keystone Telemetry')}`);
    console.log(usageText);
    return;
  }

  console.log(command ? `Invalid option: ${command}` : '');
  console.log(usageText);
}
