import os from 'os';
import path from 'path';
import fetch, { Response } from 'node-fetch';
import { InitialisedList } from '../src/lib/core/types-for-lists';
import { runTelemetry } from '../src/lib/telemetry';
import { telemetry } from '../src/scripts/telemetry';

var mockProjectRoot = path.resolve(__dirname, '..', '..', '..');
var mockProjectDir = path.join(mockProjectRoot, './tests/test-projects/basic');
var mockTelemetryConfig: any;

const packageVersions = {
  '@keystone-6/core': '3.1.0',
  '@keystone-6/auth': '5.0.1',
  '@keystone-6/fields-document': '5.0.2',
  '@keystone-6/cloudinary': '5.0.1',
};

const projectData = {
  previous: null,
  fields: {
    unknown: 0,
    id: 5,
  },
  lists: 2,
  versions: packageVersions,
  database: 'sqlite',
};
const deviceData = {
  previous: null,
  os: 'keystone-os',
  node: process.versions.node.split('.')[0],
};

const fetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const defaultDeviceFetchParam = {
  ...fetchOptions,
  body: JSON.stringify(deviceData),
};
const defaultProjectFetchParam = {
  ...fetchOptions,
  body: JSON.stringify(projectData),
};

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
//jest.mock('conf', () => jest.fn());
jest.mock('conf', () => {
  return jest.fn().mockImplementation(() => ({
    get: () => {
      return mockTelemetryConfig;
    },
    set: (name: string, telemetryConfig: any) => {
      if (name === 'telemetry') {
        mockTelemetryConfig = telemetryConfig;
      } else {
        const locationName = name.split('.')[1];
        if (locationName === 'device') {
          mockTelemetryConfig.device.lastSentDate = telemetryConfig;
        } else if (locationName === 'projects') {
          mockTelemetryConfig.projects[mockProjectDir].lastSentDate = telemetryConfig;
        } else {
          throw new Error('Invalid name');
        }
      }
    },
    delete: () => {
      mockTelemetryConfig = undefined;
    },
  }));
});
jest.mock('os');
jest.mock('ci-info', () => ({ isCI: false }));

jest.mock('node-fetch', () => jest.fn());

jest.mock(
  '@keystone-6/core/package.json',
  () => {
    return { version: packageVersions['@keystone-6/core'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/auth/package.json',
  () => {
    return { version: packageVersions['@keystone-6/auth'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/fields-document/package.json',
  () => {
    return { version: packageVersions['@keystone-6/fields-document'] };
  },
  { virtual: true }
);
jest.mock(
  '@keystone-6/cloudinary/package.json',
  () => {
    return { version: packageVersions['@keystone-6/cloudinary'] };
  },
  { virtual: true }
);

describe('Inital Telemetry tests', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const defaultFetchMock = () => mockFetch.mockImplementationOnce(async () => ({} as Response));

  const env = process.env;
  beforeEach(() => {
    process.env = { ...env };
    mockTelemetryConfig = undefined;
    os.platform = jest.fn().mockReturnValue('keystone-os');
  });
  afterEach(() => {
    // Reset env variables
    delete process.env.KEYSTONE_TELEMETRY_ENDPOINT;
    delete process.env.KEYSTONE_TELEMETRY_DISABLED;
    delete process.env.NOW_BUILDER;
    // clear mocks (fetch specifically)
    jest.clearAllMocks();
  });

  test('Telemetry writes config but does not run on first go', async () => {
    defaultFetchMock();

    runTelemetry(mockProjectDir, lists, 'sqlite');

    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig?.device.informedAt).toBeDefined();
    expect(mockTelemetryConfig?.projects.default.informedAt).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir]).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir].lastSentDate).toBeUndefined();
    expect(mockTelemetryConfig?.device.lastSentDate).toBeUndefined();
  });
  test('Telemetry runs on second go', async () => {
    defaultFetchMock();
    runTelemetry(mockProjectDir, lists, 'sqlite');
    runTelemetry(mockProjectDir, lists, 'sqlite');

    expect(mockFetch).toHaveBeenCalledWith(
      `https://telemetry.keystonejs.com/v1/event/project`,
      defaultProjectFetchParam
    );
    expect(mockFetch).toHaveBeenCalledWith(
      `https://telemetry.keystonejs.com/v1/event/device`,
      defaultDeviceFetchParam
    );
    console.log(mockFetch.mock.calls);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockTelemetryConfig?.device.informedAt).toBeDefined();
    expect(mockTelemetryConfig?.projects.default.informedAt).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir]).toBeDefined();
    expect(mockTelemetryConfig?.projects[mockProjectDir].lastSentDate).toBeDefined();
    expect(mockTelemetryConfig?.device.lastSentDate).toBeDefined();
  });
  test('Telemetry Does not send when env NODE_ENV is set to production', async () => {
    defaultFetchMock();
    // @ts-ignore
    process.env.NODE_ENV = 'production';

    runTelemetry(mockProjectDir, lists, 'sqlite');
    runTelemetry(mockProjectDir, lists, 'sqlite');
    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig?.device).toBeUndefined();
    expect(mockTelemetryConfig?.projects).toBeUndefined();
  });

  test('Telemetry Does not send when the user has opted out using keystone telemetry disable', async () => {
    defaultFetchMock();

    telemetry(mockProjectDir, 'disable');
    expect(mockTelemetryConfig).toBe(false);
    runTelemetry(mockProjectDir, lists, 'sqlite');
    runTelemetry(mockProjectDir, lists, 'sqlite');
    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig?.device).toBeUndefined();
    expect(mockTelemetryConfig?.projects).toBeUndefined();
  });

  test('Telemetry Does not send when env KEYSTONE_TELEMETRY_DISABLED is set to 1', async () => {
    defaultFetchMock();
    // @ts-ignore
    process.env.KEYSTONE_TELEMETRY_DISABLED = '1';

    runTelemetry(mockProjectDir, lists, 'sqlite');
    runTelemetry(mockProjectDir, lists, 'sqlite');
    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig?.device).toBeUndefined();
    expect(mockTelemetryConfig?.projects).toBeUndefined();
  });
});

describe('Test isCI being set', () => {
  beforeEach(() => {
    jest.resetModules();
    os.platform = jest.fn().mockReturnValue('keystone-os');
    jest.mock('conf', () => {
      return jest.fn().mockImplementation(() => ({
        get: () => {
          return mockTelemetryConfig;
        },
        set: (_name: string, telemetryConfig: any) => {
          mockTelemetryConfig = telemetryConfig;
        },
        delete: () => {
          mockTelemetryConfig = undefined;
        },
      }));
    });
  });
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const defaultFetchMock = () => mockFetch.mockImplementation(async () => ({} as Response));
  it('Telemetry Does not send when env CI is set', async () => {
    jest.mock('ci-info', () => ({ isCI: true }));
    const runTelemetry = require('../src/lib/telemetry').runTelemetry;
    defaultFetchMock();
    runTelemetry(mockProjectDir, lists, 'sqlite');
    runTelemetry(mockProjectDir, lists, 'sqlite');
    expect(mockFetch).toHaveBeenCalledTimes(0);
    expect(mockTelemetryConfig?.device).toBeUndefined();
    expect(mockTelemetryConfig?.projects).toBeUndefined();
  });
});

describe('Telemetry does not throw any errors', () => {
  beforeEach(() => {
    jest.resetModules();

    jest.mock('ci-info', () => ({ isCI: false }));
    os.platform = jest.fn().mockImplementation(() => {
      throw new Error('os.platform() threw an error');
    });
    jest.mock('conf', () => {
      return jest.fn().mockImplementation(() => ({
        get: () => {
          throw new Error('Error getting config');
        },
        set: (_name: string, telemetryConfig: any) => {
          throw new Error('Error setting config');
        },
        delete: () => {
          mockTelemetryConfig = undefined;
        },
      }));
    });
  });
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const defaultFetchMock = () => mockFetch.mockImplementation(async () => ({} as Response));
  it('Telemetry does not throw', async () => {
    const runTelemetry = require('../src/lib/telemetry').runTelemetry;
    defaultFetchMock();
    expect(() => runTelemetry(mockProjectDir, lists, 'sqlite')).not.toThrow();
  });
});
