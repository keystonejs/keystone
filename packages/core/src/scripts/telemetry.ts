import chalk from 'chalk';
import Conf from 'conf';
import { Configuration } from '../types/telemetry';

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

  const disabledText = `
KeystoneJS telemetry: ${chalk.red('Disabled')}
    
  Keystone telemetry is disabled on this device.
  For more details visit: https://keystonejs.com/telemetry`;

  const enabledText = (telemetryData: Configuration['telemetry']) => `
KeystoneJS telemetry: ${chalk.green('Enabled')}
   
  Telemetry is configured as follows:

${JSON.stringify(telemetryData, null, 2)}

  Telemetry is completely anonymous and helps us make Keystone better.
  For more details visit: https://keystonejs.com/telemetry`;

  const setupText = `
KeystoneJS telemetry: ${chalk.red('Not Initialized')}

  Please run ${chalk.green('keystone dev')} to use the default configuration.


  Telemetry is completely anonymous and helps us make Keystone better.
  For more details visit: https://keystonejs.com/telemetry
  `;
  // Set a generic Keystone project name that we can use across keystone apps
  // e.g. create-keystone-app. By default it uses the package name
  const config = new Conf<Configuration>({ projectName: 'keystonejs', projectSuffix: '' });
  switch (option) {
    case 'status':
      const telemetryData = config.get('telemetry');
      if (telemetryData) {
        console.log(enabledText(telemetryData));
      } else if (telemetryData === false) {
        console.log(disabledText);
      } else {
        console.log(setupText);
      }
      break;
    case 'reset':
      config.delete('telemetry');
      console.log(setupText);
      break;
    case 'disable':
      config.set('telemetry', false);
      console.log(disabledText);
      break;
    case 'enable':
      await enableGlobalTelemetry(config, cwd);
      break;
    case '--help':
      console.log(helpText);
      break;
    default:
      console.log(option ? `Invalid option: ${option}` : '');
      console.log(usageText);
  }
  return;
}

async function enableGlobalTelemetry(config: Conf<Configuration>, cwd: string) {
  let telemetryConfig = config.get('telemetry');
  if (!telemetryConfig) {
    telemetryConfig = {
      device: {
        informedAt: new Date().toISOString(),
      },
      projects: {
        default: {
          informedAt: new Date().toISOString(),
        },
      },
    };
  } else {
    telemetryConfig.device = {
      informedAt: new Date().toISOString(),
    };
    telemetryConfig.projects.default = {
      informedAt: new Date().toISOString(),
    };
  }
  config.set('telemetry', telemetryConfig);
  console.log(`
KeystoneJS telemetry: ${chalk.green('Enabled')}
  `);
}
