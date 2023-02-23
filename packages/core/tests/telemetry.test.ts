import path from 'path';
import { InitialisedList } from '../src/lib/core/types-for-lists';
import { runTelemetry, disableTelemetry } from '../src/lib/telemetry';

const mockProjectRoot = path.resolve(__dirname, '..', '..', '..');
const mockProjectDir = path.join(mockProjectRoot, './tests/test-projects/basic');
const mockPackageVersions = {
  '@keystone-6/core': '3.1.0',
  '@keystone-6/auth': '5.0.1',
  '@keystone-6/fields-document': '5.0.2',
  '@keystone-6/cloudinary': '5.0.1',
};

jest.mock(
  '@keystone-6/core/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/core'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/auth/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/auth'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/fields-document/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/fields-document'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/cloudinary/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/cloudinary'] };
  },
  { virtual: true }
);

let mockTelemetryConfig: any = undefined;
jest.mock('conf', () => {
  return function Conf() {
    return {
      get: () => mockTelemetryConfig,
      set: (_name: string, newState: any) => {
        mockTelemetryConfig = newState;
      },
      delete: () => {
        mockTelemetryConfig = undefined;
      },
    };
  };
});

jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation(async () => ({} as Response));
});

jest.mock('os', () => {
  return {
    ...jest.requireActual('os'),
    platform: () => 'keystone-os',
  };
});

// required as CI is set for tests
jest.mock('ci-info', () => {
  return { isCI: false };
});

///////////////////////
const lists: Record<string, InitialisedList> = {
  Thing: {
    fields: {
      // @ts-ignore
      id: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-ignore
      name: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-ignore
      thing: {
        __ksTelemetryFieldTypeName: 'id',
      },
    },
  },
  Stuff: {
    fields: {
      // @ts-ignore
      id: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-ignore
      name: {
        __ksTelemetryFieldTypeName: 'id',
      },
    },
  },
};

describe('Telemetry tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockTelemetryConfig = undefined; // reset state
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const mockFetch = require('node-fetch');
  const today = new Date().toJSON().slice(0, 10);
  const mockYesterday = '2023-01-01';
  const mockTelemetryConfigInitialised = {
    informedAt: `${mockYesterday}T01:11:11.111Z`,
    device: { lastSentDate: mockYesterday },
    projects: {
      [mockProjectDir]: {
        lastSentDate: mockYesterday,
      },
    },
  };

  function expectDidSend(lastSentDate: string | null) {
    expect(mockFetch).toHaveBeenCalledWith(`https://telemetry.keystonejs.com/v1/event/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        previous: lastSentDate,
        fields: {
          unknown: 0,
          id: 5,
        },
        lists: 2,
        versions: mockPackageVersions,
        database: 'sqlite',
      }),
    });

    expect(mockFetch).toHaveBeenCalledWith(`https://telemetry.keystonejs.com/v1/event/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        previous: lastSentDate,
        os: 'keystone-os',
        node: process.versions.node.split('.')[0],
      }),
    });
  }

  test('Telemetry writes out an empty configuration, and sends nothing on first run', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // inform

    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig).toBeDefined();
    expect(mockTelemetryConfig?.device.lastSentDate).toBe(null);
    expect(mockTelemetryConfig?.projects).toBeDefined();
    expect(Object.keys(mockTelemetryConfig?.projects).length).toBe(0);
  });

  test('Telemetry is sent on second run', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send

    expectDidSend(null);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockTelemetryConfig).toBeDefined();
    expect(mockTelemetryConfig?.device.lastSentDate).toBe(today);
    expect(mockTelemetryConfig?.projects).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir]).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir].lastSentDate).toBe(today);
  });

  test('Telemetry is not sent twice in one day', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send, same day

    expectDidSend(null);
    expect(mockFetch).toHaveBeenCalledTimes(2); // would be 4 if sent twice
  });

  test('Telemetry sends a lastSentDate on the third run, second day', async () => {
    mockTelemetryConfig = mockTelemetryConfigInitialised;

    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send, different day

    expectDidSend(mockYesterday);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockTelemetryConfig).toBeDefined();
    expect(mockTelemetryConfig?.device.lastSentDate).toBe(today);
    expect(mockTelemetryConfig?.projects).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir]).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir].lastSentDate).toBe(today);
  });

  test(`Telemetry is reset when using "keystone telemetry disable"`, () => {
    disableTelemetry();

    expect(mockTelemetryConfig).toBe(false);
  });

  test(`Telemetry is not sent if telemetry is disabled`, async () => {
    mockTelemetryConfig = false;

    await runTelemetry(mockProjectDir, lists, 'sqlite'); // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send
    await runTelemetry(mockProjectDir, lists, 'sqlite'); // send, same day

    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig).toBe(false);
  });

  // easy opt-out tests
  for (const [key, value] of Object.entries({
    NODE_ENV: 'production',
    KEYSTONE_TELEMETRY_DISABLED: '1',
  })) {
    describe(`when process.env.${key} is set to ${value}`, () => {
      const envBefore = process.env[key];

      beforeEach(() => {
        // @ts-ignore
        process.env[key] = value;
      });

      afterEach(() => {
        // @ts-ignore
        process.env[key] = envBefore;
      });

      test(`when initialised, nothing is sent`, async () => {
        mockTelemetryConfig = mockTelemetryConfigInitialised;

        await runTelemetry(mockProjectDir, lists, 'sqlite'); // try send again

        expect(mockFetch).toHaveBeenCalledTimes(0);
        expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised); // unchanged
      });

      test(`if not initialised, we do nothing`, async () => {
        expect(mockTelemetryConfig).toBe(undefined);
        expect(mockFetch).toHaveBeenCalledTimes(0);

        await runTelemetry(mockProjectDir, lists, 'sqlite'); // try inform
        await runTelemetry(mockProjectDir, lists, 'sqlite'); // try send

        expect(mockFetch).toHaveBeenCalledTimes(0);
        expect(mockTelemetryConfig).toBe(undefined); // nothing changed
      });
    });
  }

  describe('when something throws internally', () => {
    let runTelemetryThrows: any;
    beforeEach(() => {
      jest.resetAllMocks();
      jest.resetModules();
      jest.mock('node-fetch', () => {
        return jest.fn().mockImplementation(async () => {
          throw new Error('Uh oh');
        });
      });
      runTelemetryThrows = require('../src/lib/telemetry').runTelemetry;
    });

    test(`nothing actually throws`, async () => {
      mockTelemetryConfig = mockTelemetryConfigInitialised;

      await runTelemetryThrows(mockProjectDir, lists, 'sqlite'); // send

      expect(mockFetch).toHaveBeenCalledTimes(0);
      expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised); // unchanged
    });
  });

  describe('when running in CI', () => {
    let runTelemetryCI: any;
    beforeEach(() => {
      // this is a nightmare, don't touch it
      jest.resetAllMocks();
      jest.resetModules();
      jest.mock('ci-info', () => {
        return { isCI: true };
      });
      runTelemetryCI = require('../src/lib/telemetry').runTelemetry;
    });

    test(`when initialised, nothing is sent`, async () => {
      mockTelemetryConfig = mockTelemetryConfigInitialised;

      await runTelemetryCI(mockProjectDir, lists, 'sqlite'); // try send again

      expect(mockFetch).toHaveBeenCalledTimes(0);
      expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised); // unchanged
    });

    test(`if not initialised, we do nothing`, async () => {
      expect(mockTelemetryConfig).toBe(undefined);
      expect(mockFetch).toHaveBeenCalledTimes(0);

      await runTelemetryCI(mockProjectDir, lists, 'sqlite'); // try inform
      await runTelemetryCI(mockProjectDir, lists, 'sqlite'); // try send

      expect(mockFetch).toHaveBeenCalledTimes(0);
      expect(mockTelemetryConfig).toBe(undefined); // nothing changed
    });
  });
});
