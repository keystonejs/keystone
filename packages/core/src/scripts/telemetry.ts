import chalk from 'chalk';
import Conf from 'conf';
import { confirmPrompt } from '../lib/prompts';
import { Configuration } from '../types/telemetry';

export async function telemetry(cwd: string, option?: string) {
  const usageText = `
  The telemetry command requires a valid option
  
      Usage
        $ keystone telemetry [option]
      Options
        status      displays the current telemetry configuration
        reset       resets the current telemetry configuration (if any)
        setup       resets the current telemetry configuration (if any) and setupializes the telemetry configuration
        disable     resets the current telemetry configuration (if any) and disables all telemetry on this device
      `;

  const helpText = `
  ${chalk.bold('KeystoneJS Telemetry')}

      Usage
        $ keystone telemetry [option]
      Options
        status      displays the current telemetry configuration
        reset       resets the current telemetry configuration (if any)
        setup       resets the current telemetry configuration (if any) and setupializes the telemetry configuration
        disable     resets the current telemetry configuration (if any) and disables all telemetry on this device
  
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
KeystoneJS telemetry: ${chalk.red('Not Inilialized')}

  Please run ${chalk.green(
    'keystone telemetry setup'
  )} to customize the telemetry configuration, or ${chalk.green(
    'keystone dev'
  )} to use the default configuration.


  Telemetry is completely anonymous and helps us make Keystone better.
  For more details visit: https://keystonejs.com/telemetry
  `;
  // Set a generic Keystone project name that we can use across keystone apps
  // e.g. create-keystone-app. By default it uses the package name
  const config = new Conf<Configuration>({ projectName: 'keystonejs' });
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
    case 'disable' || 'disabled':
      config.set('telemetry', false);
      console.log(disabledText);
      break;
    case 'setup':
      config.delete('telemetry');
      await setupGlobalTelemetry(config, cwd);
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

const deviceConsentText = `
Welcome to Keystone!
We'd love some help to see how keystone is being used.

Would you like to send the following information about your developer environment? (only when you use 'keystone dev', at most once daily)

- Last date you used 'keystone dev'
- Node version
- Operating System

`;

const projectConsentText = `
We'd also love to know about your projects too.

Would you like to send the following additional information about your projects? (only when you use 'keystone dev', at most once daily)

- Last date you used 'keystone dev' for this project
- The versions of any '@keystone-6', and '@opensaas' [subject to change by community contribution] packages that you are using in this project 
- The number of lists you have
- The name and number of field types that you are using

`;

async function setupGlobalTelemetry(config: Conf<Configuration>, cwd: string) {
  const newTelemetry: Configuration['telemetry'] = {
    device: false,
    projects: {
      default: false,
    },
  };
  console.log(deviceConsentText);
  const deviceContent = await confirmPrompt('Yes (y) / No (n)', true);
  if (deviceContent) {
    newTelemetry.device = { informedAt: new Date().toISOString() };
  }
  console.log(projectConsentText);
  const projectContent = await confirmPrompt('Yes (y) / No (n)', true);

  if (projectContent) {
    newTelemetry.projects.default = { informedAt: new Date().toISOString() };
    newTelemetry.projects = {
      default: { informedAt: new Date().toISOString() },
      [cwd]: { informedAt: new Date().toISOString() },
    };
  }
  config.set('telemetry', newTelemetry);
  console.log(`
KeystoneJS telemetry: ${chalk.green('Initialized')}
  `);
}
