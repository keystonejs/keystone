import os from 'os';
import ci from 'ci-info';
import Conf from 'conf';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { Configuration, Telemetry, Project, Device, PackageName } from '../types/telemetry';
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
  | undefined
  | false
  | {
      device: { lastSentDate?: string; informedAt: string };
      projects: {
        default: { lastSentDate?: string; informedAt: string };
        [projectPath: string]: { lastSentDate?: string; informedAt: string };
      };
    };

function log(message: unknown) {
  if (process.env.KEYSTONE_TELEMETRY_DEBUG === '1') {
    console.log(`${message}`);
  }
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

        const replacement: Telemetry = {
          // every informedAt was a copy of device.informedAt, it was copied everywhere
          informedAt: existing.device.informedAt,
          device: {
            lastSentDate: existing.device.lastSentDate ?? null,
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

function getDefaultedTelemetryConfig() {
  const { telemetry, userConfig } = getTelemetryConfig();

  if (telemetry === undefined) {
    return {
      telemetry: {
        informedAt: null,
        device: {
          lastSentDate: null,
        },
        projects: {} as Telemetry['projects'], // help Typescript infer the type
      },
      userConfig,
    };
  }

  return { telemetry, userConfig };
}

const todaysDate = new Date().toISOString().slice(0, 10);

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

function printAbout() {
  console.log(
    `${chalk.yellow('Keystone collects anonymous data when you run')} ${chalk.green(
      '"keystone dev"'
    )}`
  );
  console.log();
  console.log(
    `For more information, including how to opt-out see https://keystonejs.com/telemetry`
  );
}

export function printTelemetryStatus() {
  const { telemetry } = getTelemetryConfig();

  if (telemetry === undefined) {
    console.log(`Keystone telemetry has been reset to ${chalk.yellow('uninitialized')}`);
    console.log();
    console.log(
      `Telemetry will be sent the next time you run ${chalk.green(
        '"keystone dev"'
      )}, unless you opt-out`
    );
  } else if (telemetry === false) {
    console.log(`Keystone telemetry is ${chalk.red('disabled')}`);
    console.log();
    console.log(`Telemetry will ${chalk.red('not')} be sent by this system user`);
  } else if (typeof telemetry === 'object') {
    console.log(`Keystone telemetry is ${chalk.green('enabled')}`);
    console.log();

    console.log(`  Device telemetry was last sent on ${telemetry.device.lastSentDate}`);
    for (const [projectPath, project] of Object.entries(telemetry.projects)) {
      console.log(
        `  Project telemetry for "${chalk.yellow(projectPath)}" was last sent on ${
          project?.lastSentDate
        }`
      );
    }

    console.log();
    console.log(
      `Telemetry will be sent the next time you run ${chalk.green(
        '"keystone dev"'
      )}, unless you opt-out`
    );
  }
}

function inform() {
  const { telemetry, userConfig } = getDefaultedTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (telemetry === false) return;

  console.log(); // gap to help visiblity
  console.log(`${chalk.bold('Keystone Telemetry')}`);
  printAbout();
  console.log(
    `You can use ${chalk.green(
      '"keystone telemetry --help"'
    )} to update your preferences at any time`
  );
  console.log();
  console.log(
    `No telemetry data has been sent yet, but telemetry will be sent the next time you run ${chalk.green(
      '"keystone dev"'
    )}, unless you opt-out`
  );
  console.log(); // gap to help visiblity

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

async function sendProjectTelemetryEvent(
  cwd: string,
  lists: Record<string, InitialisedList>,
  dbProviderName: DatabaseProvider
) {
  const { telemetry, userConfig } = getDefaultedTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (telemetry === false) return;

  const project = telemetry.projects[cwd] ?? { lastSentDate: null };
  const { lastSentDate } = project;
  if (lastSentDate && lastSentDate >= todaysDate) {
    log('project telemetry already sent today');
    return;
  }

  await sendEvent('project', {
    previous: lastSentDate,
    fields: collectFieldCount(lists),
    lists: Object.keys(lists).length,
    versions: collectPackageVersions(),
    database: dbProviderName,
  });

  // update the project lastSentDate
  telemetry.projects[cwd] = { lastSentDate: todaysDate };
  userConfig.set('telemetry', telemetry);
}

async function sendDeviceTelemetryEvent() {
  const { telemetry, userConfig } = getDefaultedTelemetryConfig();

  // no telemetry? somehow our earlier checks missed an opt out, do nothing
  if (telemetry === false) return;

  const { lastSentDate } = telemetry.device;
  if (lastSentDate && lastSentDate >= todaysDate) {
    log('device telemetry already sent today');
    return;
  }

  await sendEvent('device', {
    previous: lastSentDate,
    os: os.platform(),
    node: process.versions.node.split('.')[0],
  });

  // update the device lastSentDate
  telemetry.device = { lastSentDate: todaysDate };
  userConfig.set('telemetry', telemetry);
}

export async function runTelemetry(
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

    const { telemetry } = getDefaultedTelemetryConfig();

    // don't run if the user has opted out
    if (telemetry === false) return;

    // don't send telemetry before we inform the user, allowing opt-out
    if (!telemetry.informedAt) return inform();

    await sendProjectTelemetryEvent(cwd, lists, dbProviderName);
    await sendDeviceTelemetryEvent();
  } catch (err) {
    log(err);
  }
}

export function enableTelemetry() {
  const { telemetry, userConfig } = getTelemetryConfig();
  if (telemetry === false) {
    userConfig.delete('telemetry');
  }
  printTelemetryStatus();
}

export function disableTelemetry() {
  const { userConfig } = getTelemetryConfig();
  userConfig.set('telemetry', false);
  printTelemetryStatus();
}

export function resetTelemetry() {
  const { userConfig } = getTelemetryConfig();
  userConfig.delete('telemetry');
  printTelemetryStatus();
}
