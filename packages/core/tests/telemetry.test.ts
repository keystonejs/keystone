import fetch, { Response } from 'node-fetch';
import { GraphQLSchema } from 'graphql';
import { sendTelemetryEvent } from '../src/lib/telemetry';
import { deviceInfo } from '../src/lib/telemetry/deviceInfo';
import { ListSchemaConfig } from '../src/types';

const deviceData = {
  deviceId: '1234',
  os: 'keystone-os',
  osVersion: '0.0.1',
  nodeVersion: process.version,
  locale: 'AU_en',
  isCI: false,
};

const projectData = {
  schemaHash: { description: 'graphQLSchema' } as GraphQLSchema,
  fieldCounts: { '2': 1, '3': 1 },
  keystonePackages: { '@keystonejs/keystone': '1.2.3' },
};

const eventData = {
  ...deviceData,
  ...projectData,
  dbProvider: 'mydb',
  eventType: 'test-event',
};

const fetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const defaultFetchParam = {
  ...fetchOptions,
  body: JSON.stringify({
    ...eventData,
    schemaHash: `arandomstring-${JSON.stringify(eventData.schemaHash)}-hashed`,
    deviceId: 'arandomstring',
  }),
};

const lists: ListSchemaConfig = {
  Thing: {
    fields: {
      // @ts-ignore
      id: () => {},
      // @ts-ignore
      name: () => {},
      // @ts-ignore
      thing: () => {},
    },
  },
  Stuff: {
    fields: {
      // @ts-ignore
      id: () => {},
      // @ts-ignore
      name: () => {},
    },
  },
};

const cwd = 'path';

jest.mock('os', () => {
  return { platform: () => 'keystone-os', release: () => '0.0.1' };
});

jest.mock('conf', () => {
  return jest.fn().mockImplementation(() => ({
    get: () => false, // Must return false else telemetry is disabled
    set: () => {},
  }));
});

jest.mock('crypto', () => {
  return {
    createHmac: (algorythm: string, key: string) => ({
      update: (text: string) => ({ digest: () => `${key}-${text}-hashed` }),
    }),
    randomBytes: () => ({ toString: () => 'arandomstring' }),
  };
});

jest.mock('node-fetch', () => jest.fn());

jest.mock(
  'path/package.json',
  () => {
    return { dependencies: { '@keystonejs/keystone': '1.2.3' } };
  },
  { virtual: true }
);

process.env.LC_ALL = eventData.locale;

describe('telemetry', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const defaultFetchMock = () => mockFetch.mockImplementationOnce(async () => ({} as Response));

  afterEach(() => {
    // Reset env variables
    delete process.env.KEYSTONE_TELEMETRY_DISABLED;
    delete process.env.KEYSTONE_TELEMETRY_ENDPOINT;
    delete process.env.KEYSTONE_TELEMETRY_DEBUG;
    delete process.env.NOW_BUILDER;

    // clear mocks (fetch specifically)
    jest.clearAllMocks();
  });

  test('sendTelemetryEvent calls with expected data', () => {
    defaultFetchMock();

    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://telemetry.keystonejs.com/v1/event`,
      defaultFetchParam
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('sendTelemetryEvent uses endpoint override', () => {
    defaultFetchMock();

    const updatedEndpoint = 'https://keylemetry.com';
    process.env.KEYSTONE_TELEMETRY_ENDPOINT = updatedEndpoint;

    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);

    expect(mockFetch).toHaveBeenCalledWith(`${updatedEndpoint}/v1/event`, defaultFetchParam);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("sendTelemetryEvent doesn't fetch when telemetry is disabled", () => {
    process.env.KEYSTONE_TELEMETRY_DISABLED = '1';
    defaultFetchMock();
    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  test("sendTelemetryEvent doesn't fetch when telemetry is disabled with any value as truthy", () => {
    process.env.KEYSTONE_TELEMETRY_DISABLED = 'anything';
    defaultFetchMock();
    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  test("sendTelemetryEvent fetches when telemetry disabled is disabled with '0'", () => {
    process.env.KEYSTONE_TELEMETRY_DISABLED = '0';
    defaultFetchMock();
    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("sendTelemetryEvent fetches when telemetry disabled is disabled with 'false'", () => {
    process.env.KEYSTONE_TELEMETRY_DISABLED = 'false';
    defaultFetchMock();
    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('fetch throwing an error wont bubble up', () => {
    mockFetch.mockImplementationOnce(() => {
      throw new Error();
    });

    expect(sendTelemetryEvent).not.toThrow();

    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
  });

  test('TELEMETRY_DEBUG should log the output of telemetry but not fetch', () => {
    process.env.KEYSTONE_TELEMETRY_DEBUG = '1';
    defaultFetchMock();
    sendTelemetryEvent(eventData.eventType, cwd, eventData.dbProvider, lists, eventData.schemaHash);
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  test('Encoding in locale should be removed', () => {
    process.env.LC_ALL = 'en_AU.UTF8';
    const deviceResults = deviceInfo();
    expect(deviceResults.locale).toBe('en_AU');
    process.env.LC_ALL = eventData.locale;
  });
});
