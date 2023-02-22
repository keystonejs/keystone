import os from 'os';
import ci from 'ci-info';
import Conf from 'conf';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { Configuration, Project, Device, PackageName } from '../types/telemetry';
import { DatabaseProvider } from '../types';
import { defaults } from './config/defaults';
import { InitialisedList } from './core/types-for-lists';

const packageNames: PackageName[] = [
  '@keystone-6/core',
  '@keystone-6/auth',
  '@keystone-6/fields-document',
  '@keystone-6/cloudinary',
  '@keystone-6/session-store-redis',
  '@opensaas/keystone-nextjs-auth',
];

type TelemetryVersion1 =
  | false
  | undefined
  | {
      device: { lastSentDate?: string; informedAt: string };
      projects: {
        default: { lastSentDate?: string; informedAt: string };
        [projectPath: string]: { lastSentDate?: string; informedAt: string };
      };
    };

function log(message: unknown) {
  if (process.env.KEYSTONE_TELEMETRY_DEBUG !== '1') return;
  console.log(`telemetry: ${message}`);
}

function getTelemetryConfig() {
  const userConfig = new Conf<Configuration>({
    projectName: 'keystonejs',
    projectSuffix: '',
    projectVersion: '2.0.0',
    migrations: {
      '^2.0.0': (store: Conf<Configuration>) => {
        const existing = store.get('telemetry') as unknown as TelemetryVersion1;
        if (!existing) return;

        const replacement: Configuration['telemetry'] = {
          // every informedAt was a copy of device.informedAt, it was copied everywhere
          informedAt: existing.device.informedAt,
          device: {
            lastSentDate: existing.device.lastSentDate,
          },
          projects: {}, // manually copying this below
        };

        // copy existing project lastSentDate's
        for (const [projectPath, project] of Object.entries(existing.projects)) {
          if (projectPath === 'default') continue; // informedAt moved to root

          // dont copy garbage
          if (typeof project !== 'object') continue;
          if (typeof project.lastSentDate !== 'string') continue;
          if (new Date(project.lastSentDate).toString() === 'Invalid Date') continue;

          // only lastSentDate is retained
          replacement.projects[projectPath] = {
            lastSentDate: project.lastSentDate,
          };
        }

        store.set('telemetry', replacement);
      },
    },
  });

  return {
    telemetry: userConfig.get('telemetry'),
    userConfig,
  };
}

const todaysDate = new Date().toISOString().slice(0, 10);

export function runTelemetry(
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
      return;
    }

    let { userConfig, telemetry } = getTelemetryConfig();

    // if telemetry has been opted out, stop now
    if (telemetry === false) return; // don't run if the user has opted out

    // if the user hasn't opted out, but nothing is here, we are new
    if (telemetry === undefined) {
      telemetry = {
        device: {},
        projects: {
          [cwd]: {},
        },
      };
      userConfig.set('telemetry', telemetry);
    }

    // don't send telemetry before the user has been informed, allowing opt out
    if (!telemetry.informedAt) {
      inform();
      return;
    }

    // is something awry?
    if (typeof telemetry !== 'object') return;

    // is the project new?
    sendProjectTelemetryEvent(cwd, lists, dbProviderName);
    sendDeviceTelemetryEvent();
  } catch (err) {
    log(err);
  }
}

function collectFieldCount(lists: Record<string, InitialisedList>) {
  const fields: Project['fields'] = { unknown: 0 };

  for (const list of Object.values(lists)) {
    for (const [fieldPath, field] of Object.entries(list.fields)) {
      const fieldType = field.__ksTelemetryFieldTypeName;
      if (!fieldType) {
        // skip id fields
        if (fieldPath.endsWith('id')) continue;
        fields.unknown++;
        continue;
      }

      fields[fieldType] ||= 0;
      fields[fieldType] += 1;
    }
  }

  return fields;
}

function collectPackageVersions() {
  const versions: Project['versions'] = {
    '@keystone-6/core': '0.0.0', // effectively unknown
  };

  for (const packageName of packageNames) {
    try {
      const packageJson = require(`${packageName}/package.json`);
      versions[packageName] = packageJson.version;
    } catch {
      // do nothing, most likely because the package is not installed
    }
  }

  return versions;
}

function inform() {
  const { telemetry, userConfig } = getTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (!telemetry) return;

  console.log(`
${chalk.bold('Keystone Telemetry')}

${chalk.yellow('Keystone collects anonymous data about how you run "keystone dev".')}
For more information, including how to opt-out see: https://keystonejs.com/telemetry

You can run ${chalk.green('"keystone telemetry --help"')} to change your preference at any time.

No telemetry data has been sent yet, but telemetry will be sent the next time you run ${chalk.green(
    '"keystone dev"'
  )}, unless you opt-out.
`);

  // update the informedAt
  telemetry.informedAt = new Date().toJSON();
  userConfig.set('telemetry', telemetry);
}

async function sendEvent(eventType: 'project' | 'device', eventData: Project | Device) {
  const telemetryEndpoint = process.env.KEYSTONE_TELEMETRY_ENDPOINT || defaults.telemetryEndpoint;
  const telemetryUrl = `${telemetryEndpoint}/v1/event/${eventType}`;

  await fetch(telemetryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  log(`sent ${eventType} report`);
}

function sendProjectTelemetryEvent(
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider
) {
  const { telemetry, userConfig } = getTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (!telemetry) return;

  const project = telemetry.projects[cwd] ?? {};
  const { lastSentDate = null } = project;
  if (lastSentDate && lastSentDate >= todaysDate) {
    log('project telemetry already sent today');
    return;
  }

  sendEvent('project', {
    previous: lastSentDate,
    fields: collectFieldCount(lists),
    lists: Object.keys(lists).length,
    versions: collectPackageVersions(),
    database: dbProviderName,
  });

  // update the project lastSentDate
  project.lastSentDate = todaysDate;
  telemetry.projects[cwd] = project;
  userConfig.set('telemetry', telemetry);
}

function sendDeviceTelemetryEvent() {
  const { telemetry, userConfig } = getTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (!telemetry) return;

  const device = telemetry.device ?? {};
  const { lastSentDate = null } = device;
  if (lastSentDate && lastSentDate >= todaysDate) {
    log('device telemetry already sent today');
    return;
  }

  sendEvent('device', {
    previous: lastSentDate,
    os: os.platform(),
    node: process.versions.node.split('.')[0],
  });

  // update the device lastSentDate
  device.lastSentDate = todaysDate;
  telemetry.device = device;
  userConfig.set('telemetry', telemetry);
}
