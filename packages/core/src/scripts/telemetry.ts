import chalk from 'chalk';
import {
  printTelemetryStatus,
  enableTelemetry,
  disableTelemetry,
  resetTelemetry
} from '../lib/telemetry';

export async function telemetry(cwd: string, option?: string) {
  const usageText =
    `
    Usage
      $ keystone telemetry [command]
    Commands
      disable     opt-out of telemetry, disabled for this system user
      enable      opt-in to telemetry
      reset       resets your telemetry configuration (if any)
      status      show if telemetry is enabled, disabled or uninitialised

For more details visit: https://keystonejs.com/telemetry
    `;

  switch (option) {
    case 'status': printTelemetryStatus(); break;
    case 'reset': resetTelemetry(); break;
    case 'disable': disableTelemetry(); break;
    case 'enable': enableTelemetry(); break;
    case '--help':
      console.log(`${chalk.bold('Keystone Telemetry')}`);
      console.log(usageText);
      break;
    default:
      console.log(option ? `Invalid option: ${option}` : '');
      console.log(usageText);
  }
  return;
}
