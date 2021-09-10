import os from 'os';
import ci from 'ci-info';
import Conf from 'conf';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { Configuration, Project, Device, Consent, PackageName } from '../types/telemetry';
import { DatabaseProvider } from '../types';
import { defaults } from './config/defaults';
import { InitialisedList } from './core/types-for-lists';

const isDebugging = () => {
  return (
    !!process.env.KEYSTONE_TELEMETRY_DEBUG &&
    process.env.KEYSTONE_TELEMETRY_DEBUG !== '0' &&
    process.env.KEYSTONE_TELEMETRY_DEBUG !== 'false'
  );
};

const packageNames: PackageName[] = [
  '@keystone-6/core',
  '@keystone-6/auth',
  '@keystone-6/fields-document',
  '@keystone-6/cloudinary',
  '@keystone-6/session-store-redis',
  '@opensaas/keystone-nextjs-auth',
];

let userConfig: Conf<Configuration>;
let telemetry: Configuration['telemetry'];
try {
  // Load global telemetry config settings (if set)
  userConfig = new Conf<Configuration>({ projectName: 'keystonejs' });
  telemetry = userConfig.get('telemetry');
} catch (err) {
  // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
  if (isDebugging()) {
    console.log(err);
  }
}
const todaysDate = new Date().toISOString().slice(0, 10);

const telemetryDisabled = () => {
  return (
    ci.isCI || // Don't run in CI
    process.env.NODE_ENV === 'production' || // Don't run in production
    telemetry === false // Don't run if the user has opted out
  );
};

const notifyText = `
${chalk.bold('Keystone Telemetry')}

Keystone collects anonymous data about how you use it. 
For more information including how to opt-out see: https://keystonejs.com/telemetry

Or run: ${chalk.green('keystone telemetry --help')} to change your preference at any time.

No telemetry data has been sent yet, but will be sent the next time you run ${chalk.green(
  'keystone dev'
)} unless you first opt-out.

`;

export function runTelemetry(
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider
) {
  try {
    if (telemetryDisabled()) {
      return;
    }
    if (telemetry === undefined) {
      const newTelemetry: Configuration['telemetry'] = {
        device: { informedAt: new Date().toISOString() },
        projects: {
          default: { informedAt: new Date().toISOString() },
          [cwd]: { informedAt: new Date().toISOString() },
        },
      };
      userConfig.set('telemetry', newTelemetry);
      console.log(notifyText);
      // Don't run telemetry on first run, give the user a chance to opt out
      return;
    }
    if (!telemetry) {
      return;
    }
    if (telemetry.projects[cwd] === undefined) {
      userConfig.set(`telemetry.projects${cwd}`, telemetry.projects.default);
      telemetry.projects[cwd] = telemetry.projects.default;
    }
    if (!!telemetry.projects[cwd]) {
      sendProjectTelemetryEvent(cwd, lists, dbProviderName, telemetry.projects[cwd]);
    }
    if (!!telemetry.device) {
      sendDeviceTelemetryEvent(telemetry.device);
    }
  } catch (err) {
    // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
    if (isDebugging()) {
      console.log(err);
    }
  }
}

const fieldCount = (lists?: Record<string, InitialisedList>): Project['fields'] => {
  if (!lists) {
    return { unknown: 0 };
  }
  const fields: Project['fields'] = { unknown: 0 };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_listKey, { resolvedDbFields }] of Object.entries(lists)) {
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      const fieldType = field.__ksTelemetryFieldTypeName;

      if (!fieldType) {
        // skip id fields
        if (fieldPath.endsWith('id')) continue;

        //skip from relationship fields
        if (fieldPath.startsWith('from')) continue;
        if (field.kind === 'relation') {
          fields['@keystone-6/relationship'] = (fields['@keystone-6/relationship'] || 0) + 1;
          continue;
        }
        fields.unknown++;
        continue;
      }
      if (!fields[fieldType]) {
        fields[fieldType] = 0;
      }
      fields[fieldType] += 1;
    }
  }
  return fields;
};

function sendEvent(eventType: 'project' | 'device', eventData: Project | Device) {
  try {
    const telemetryEndpoint = process.env.KEYSTONE_TELEMETRY_ENDPOINT || defaults.telemetryEndpoint;
    const telemetryUrl = `${telemetryEndpoint}/v1/event/${eventType}`;

    if (process.env.KEYSTONE_TELEMETRY_DISPLAY === '1') {
      console.log(`[Telemetry]: ${telemetryUrl}`);
      console.log(eventData);
    } else {
      // Do not `await` to keep non-blocking
      fetch(telemetryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
        .then(
          () => {},
          () => {}
        )
        // Catch silently
        .catch(err => {
          // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
          if (isDebugging()) {
            console.log(err);
          }
        });
    }
  } catch (err) {
    // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
    if (isDebugging()) {
      console.log(err);
    }
  }
}

function sendProjectTelemetryEvent(
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider,
  projectConfig: Consent
) {
  try {
    if (projectConfig === false) {
      return;
    }
    if (!!projectConfig.lastSentDate && projectConfig.lastSentDate >= todaysDate) {
      if (isDebugging()) {
        console.log('Project telemetry already sent but debugging is enabled');
      } else {
        return;
      }
    }
    // get installed keystone package versions
    const versions: Project['versions'] = {
      '@keystone-6/core': '0.0.0',
    };
    packageNames.forEach(packageName => {
      try {
        const packageJson = require(`${packageName}/package.json`);
        versions[packageName] = packageJson.version;
      } catch {
        // Fail silently most likely because the package is not installed
      }
    });
    const projectInfo: Project = {
      lastSentDate: projectConfig.lastSentDate || null,
      fields: fieldCount(lists),
      lists: !lists ? 0 : Object.keys(lists).length,
      versions,
      database: dbProviderName,
    };
    sendEvent('project', projectInfo);
    userConfig.set(`telemetry.projects.${cwd}.lastSentDate`, todaysDate);
  } catch (err) {
    // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
    if (isDebugging()) {
      console.log(err);
    }
  }
}

function sendDeviceTelemetryEvent(deviceConsent: Consent) {
  try {
    if (deviceConsent === false) return;
    if (!!deviceConsent.lastSentDate && deviceConsent.lastSentDate >= todaysDate) {
      if (isDebugging()) {
        console.log('Device telemetry already sent but debugging is enabled');
      } else {
        return;
      }
    }
    const deviceInfo: Device = {
      lastSentDate: deviceConsent.lastSentDate || null,
      os: os.platform(),
      node: process.versions.node.split('.')[0],
    };
    sendEvent('device', deviceInfo);
    userConfig.set(`telemetry.device.lastSentDate`, todaysDate);
  } catch (err) {
    // Fail silently unless KEYSTONE_TELEMETRY_DEBUG is set to 1
    if (isDebugging()) {
      console.log(err);
    }
  }
}
