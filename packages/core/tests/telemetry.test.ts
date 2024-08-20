import https from 'node:https'
import Conf from 'conf'

import path from 'path'
import type { InitialisedList } from '../src/lib/core/initialise-lists'
import { runTelemetry, disableTelemetry } from '../src/lib/telemetry'

const mockProjectRoot = path.resolve(__dirname, '..', '..', '..')
const mockProjectDir = path.join(mockProjectRoot, './tests/test-projects/basic')
const mockPackageVersions = {
  '@keystone-6/core': '14.1.0',
  '@keystone-6/auth': '9.0.1',
  '@keystone-6/fields-document': '18.0.2',
  '@keystone-6/cloudinary': '0.0.1',
}

jest.mock(
  '@keystone-6/core/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/core'] }
  },
  { virtual: true }
)
jest.mock(
  '@keystone-6/auth/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/auth'] }
  },
  { virtual: true }
)
jest.mock(
  '@keystone-6/fields-document/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/fields-document'] }
  },
  { virtual: true }
)
jest.mock(
  '@keystone-6/cloudinary/package.json',
  () => {
    return { version: mockPackageVersions['@keystone-6/cloudinary'] }
  },
  { virtual: true }
)

let mockTelemetryConfig: any = undefined

jest.mock('conf', () => {
  const getMockTelemetryConfig = jest.fn(() => {
    if (mockTelemetryConfig === 'THROW') throw new Error('JSON.parse error')
    return mockTelemetryConfig
  })

  return function Conf () {
    return {
      get: getMockTelemetryConfig,
      set: (key: string, newState: any) => {
        if (key !== 'telemetry') throw new Error(`Unexpected conf key ${key}`)
        mockTelemetryConfig = newState
      },
      delete: () => {
        mockTelemetryConfig = undefined
      },
    }
  }
})

jest.mock('node:https', () => {
  const once = jest.fn()
  const end = jest.fn()
  const request = jest.fn().mockImplementation((_, __, f) => {
    setTimeout(() => f(), 100)
    return { once, end }
  })
  // added for reach by toHaveBeenCalledWith
  ;(request as any).once = once
  ;(request as any).end = end
  return { request }
})

jest.mock('node:os', () => {
  return {
    ...jest.requireActual('node:os'),
    platform: () => 'keystone-os',
  }
})

// required as CI is set for tests
jest.mock('ci-info', () => {
  return { isCI: false }
})

const lists: Record<string, InitialisedList> = {
  Thing: {
    fields: {
      // @ts-expect-error
      id: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-expect-error
      name: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-expect-error
      thing: {
        __ksTelemetryFieldTypeName: 'id',
      },
    },
  },
  Stuff: {
    fields: {
      // @ts-expect-error
      id: {
        __ksTelemetryFieldTypeName: 'id',
      },
      // @ts-expect-error
      name: {
        __ksTelemetryFieldTypeName: 'id',
      },
    },
  },
}

describe('Telemetry tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTelemetryConfig = undefined // reset state
  })

  const today = new Date().toJSON().slice(0, 10)
  const mockYesterday = '2023-01-01'
  const mockTelemetryConfigInitialised = {
    informedAt: `${mockYesterday}T01:11:11.111Z`,
    device: { lastSentDate: mockYesterday },
    projects: {
      [mockProjectDir]: {
        lastSentDate: mockYesterday,
      },
    },
  }

  function expectDidSend (lastSentDate: string | null) {
    expect(https.request).toHaveBeenCalledWith(`https://telemetry.keystonejs.com/3/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, expect.any(Function))
    expect((https.request as any).end).toHaveBeenCalledWith(
      JSON.stringify({
        lastSentDate,
        packages: mockPackageVersions,
        database: 'sqlite',
        lists: 2,
        fields: {
          unknown: 0,
          id: 5,
        },
      })
    )

    expect(https.request).toHaveBeenCalledWith(`https://telemetry.keystonejs.com/3/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, expect.any(Function))
    expect((https.request as any).end).toHaveBeenCalledWith(
      JSON.stringify({
        lastSentDate,
        os: 'keystone-os',
        node: process.versions.node.split('.')[0],
      })
    )
  }

  test('Telemetry writes out an empty configuration, and sends nothing on first run', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite') // inform

    expect(new Conf().get).toHaveBeenCalledTimes(1)
    expect(https.request).toHaveBeenCalledTimes(0)
    expect(mockTelemetryConfig).toStrictEqual({
      informedAt: expect.stringMatching(new RegExp(`^${today}`)),
      device: { lastSentDate: null },
      projects: {}
    })
  })

  test('Telemetry is sent after inform', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite') // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send

    expectDidSend(null)
    expect(new Conf().get).toHaveBeenCalledTimes(2)
    expect(https.request).toHaveBeenCalledTimes(2) // would be 4 if sent twice
    expect(mockTelemetryConfig).toStrictEqual({
      informedAt: expect.stringMatching(new RegExp(`^${today}`)),
      device: { lastSentDate: today },
      projects: {
        [mockProjectDir]: { lastSentDate: today }
      }
    })
  })

  test('Telemetry is not sent twice in one day', async () => {
    await runTelemetry(mockProjectDir, lists, 'sqlite') // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send, same day

    expectDidSend(null)
    expect(new Conf().get).toHaveBeenCalledTimes(3)
    expect(https.request).toHaveBeenCalledTimes(2) // would be 4 if sent twice
  })

  test('Telemetry sends a lastSentDate on the next run, a different day', async () => {
    mockTelemetryConfig = mockTelemetryConfigInitialised

    await runTelemetry(mockProjectDir, lists, 'sqlite') // send, different day

    expectDidSend(mockYesterday)
    expect(new Conf().get).toHaveBeenCalledTimes(1)
    expect(https.request).toHaveBeenCalledTimes(2)
    expect(mockTelemetryConfig).toStrictEqual({
      informedAt: expect.stringMatching(new RegExp(`^${mockYesterday}`)),
      device: { lastSentDate: today },
      projects: {
        [mockProjectDir]: { lastSentDate: today }
      }
    })
  })

  test(`Telemetry is reset when using "keystone telemetry disable"`, () => {
    disableTelemetry()

    expect(mockTelemetryConfig).toBe(false)
  })

  test(`Telemetry is not sent if telemetry configuration is disabled`, async () => {
    mockTelemetryConfig = false

    await runTelemetry(mockProjectDir, lists, 'sqlite') // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send, same day

    expect(new Conf().get).toHaveBeenCalledTimes(3)
    expect(https.request).toHaveBeenCalledTimes(0)
    expect(mockTelemetryConfig).toBe(false)
  })

  test(`Telemetry is unchanged if configuration is malformed`, async () => {
    mockTelemetryConfig = 'THROW'

    await runTelemetry(mockProjectDir, lists, 'sqlite') // inform
    await runTelemetry(mockProjectDir, lists, 'sqlite') // send

    expect(new Conf().get).toHaveBeenCalledTimes(2)
    expect(https.request).toHaveBeenCalledTimes(0)
    expect(mockTelemetryConfig).toStrictEqual('THROW') // nothing changes
  })

  // easy opt-out tests
  for (const [key, value] of Object.entries({
    NODE_ENV: 'production',
    KEYSTONE_TELEMETRY_DISABLED: '1',
  })) {
    describe(`when process.env.${key} is set to ${value}`, () => {
      const envBefore = process.env[key]

      beforeEach(() => {
        process.env[key] = value
      })

      afterEach(() => {
        process.env[key] = envBefore
      })

      test(`when telemetry initialised, we do nothing`, async () => {
        mockTelemetryConfig = mockTelemetryConfigInitialised

        await runTelemetry(mockProjectDir, lists, 'sqlite') // try send again

        expect(new Conf().get).toHaveBeenCalledTimes(0)
        expect(https.request).toHaveBeenCalledTimes(0)
        expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised) // unchanged
      })

      test(`when telemetry uninitialised, we do nothing`, async () => {
        expect(mockTelemetryConfig).toBe(undefined)

        await runTelemetry(mockProjectDir, lists, 'sqlite') // try inform
        await runTelemetry(mockProjectDir, lists, 'sqlite') // try send

        expect(new Conf().get).toHaveBeenCalledTimes(0)
        expect(https.request).toHaveBeenCalledTimes(0)
        expect(mockTelemetryConfig).toBe(undefined) // unchanged
      })
    })
  }

  describe('when something throws internally', () => {
    let runTelemetryThrows: any
    beforeEach(() => {
      // this is a nightmare, don't touch it
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('node-fetch', () => {
        return jest.fn().mockImplementation(async () => {
          throw new Error('Uh oh')
        })
      })
      runTelemetryThrows = require('../src/lib/telemetry').runTelemetry
    })

    test(`nothing actually throws`, async () => {
      mockTelemetryConfig = mockTelemetryConfigInitialised

      await runTelemetryThrows(mockProjectDir, lists, 'sqlite') // send

      // expect(new Conf().get).toHaveBeenCalledTimes(1) // nightmare
      expect(https.request).toHaveBeenCalledTimes(0)
      expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised) // unchanged
    })
  })

  describe('when running in CI', () => {
    let runTelemetryCI: any
    beforeEach(() => {
      // this is a nightmare, don't touch it
      jest.resetAllMocks()
      jest.resetModules()
      jest.mock('ci-info', () => {
        return { isCI: true }
      })
      runTelemetryCI = require('../src/lib/telemetry').runTelemetry
    })

    test(`when initialised, nothing is sent`, async () => {
      mockTelemetryConfig = mockTelemetryConfigInitialised

      await runTelemetryCI(mockProjectDir, lists, 'sqlite') // try send again

      expect(new Conf().get).toHaveBeenCalledTimes(0)
      expect(https.request).toHaveBeenCalledTimes(0)
      expect(mockTelemetryConfig).toBe(mockTelemetryConfigInitialised) // unchanged
    })

    test(`if not initialised, we do nothing`, async () => {
      mockTelemetryConfig = undefined

      await runTelemetryCI(mockProjectDir, lists, 'sqlite') // try inform
      await runTelemetryCI(mockProjectDir, lists, 'sqlite') // try send

      expect(new Conf().get).toHaveBeenCalledTimes(0)
      expect(https.request).toHaveBeenCalledTimes(0)
      expect(mockTelemetryConfig).toBe(undefined) // nothing changed
    })
  })
})
