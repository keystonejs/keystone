import chalk from 'chalk';
import {
  printTelemetryStatus,
  enableTelemetry,
  disableTelemetry,
  resetTelemetry
} from '../lib/telemetry';

export async function telemetry(cwd: string, option?: string) {
  const usageText = `
  The telemetry command requires a valid option

      Usage
        $ keystone telemetry [option]
      Options
        status      displays the current telemetry configuration
        reset       resets the current telemetry configuration (if any)
        enable      enables telemetry for the current user
        disable     resets the current telemetry configuration (if any) and disables all telemetry for the current user
      `;

  const helpText = `
  ${chalk.bold('KeystoneJS Telemetry')}

      Usage
        $ keystone telemetry [option]
      Options
        status      displays the current telemetry configuration
        reset       resets the current telemetry configuration (if any)
        enable      enables telemetry for the current user
        disable     resets the current telemetry configuration (if any) and disables all telemetry for the current user

  For more details visit: https://keystonejs.com/telemetry
        `;

  switch (option) {
    case 'status': printTelemetryStatus(); break;
    case 'reset': resetTelemetry(); break;
    case 'disable': disableTelemetry(); break;
    case 'enable': enableTelemetry(); break;
    case '--help':
      console.log(helpText);
      break;
    default:
      console.log(option ? `Invalid option: ${option}` : '');
      console.log(usageText);
  }
  return;
}
