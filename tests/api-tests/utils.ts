import {
  type BaseKeystoneTypeInfo,
  type KeystoneConfig,
  type KeystoneContext
} from '@keystone-6/core/types'
import {
  createSystem,
  getArtifacts,
} from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'

import { type setupTestRunner } from './test-runner'

export const dbProvider = function () {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (dbUrl.startsWith('file:')) return 'sqlite' as const
  if (dbUrl.startsWith('postgres:')) return 'postgresql' as const
  if (dbUrl.startsWith('mysql:')) return 'mysql' as const
  throw new Error(`Unknown database type: for ${dbUrl}`)
}()

const workerId = process.env.JEST_WORKER_ID

if (workerId === undefined) {
  throw new Error('expected JEST_WORKER_ID to be set')
}

export type FloatingConfig <TypeInfo extends BaseKeystoneTypeInfo> = Omit<KeystoneConfig<TypeInfo>, 'db'> & {
  db?: Omit<KeystoneConfig<TypeInfo>['db'], 'provider' | 'url'>
}

export type TypeInfoFromConfig<Config extends KeystoneConfig<any>> = Config extends KeystoneConfig<
  infer TypeInfo
>
  ? TypeInfo
  : never

export type ContextFromConfig<Config extends KeystoneConfig<any>> = KeystoneContext<
  TypeInfoFromConfig<Config>
>

export type ContextFromRunner<Runner extends ReturnType<typeof setupTestRunner>> = Parameters<
  Parameters<Runner>[0]
>[0]['context']

export type ListKeyFromRunner<Runner extends ReturnType<typeof setupTestRunner>> =
  keyof ContextFromRunner<Runner>['db']

export const unpackErrors = (errors: readonly any[] | undefined) =>
  (errors || []).map(({ locations, ...unpacked }) => unpacked)

function j (messages: string[]) {
  return messages.map(m => `  - ${m}`).join('\n')
}

export function expectInternalServerError (
  errors: readonly any[] | undefined,
  args: { path: any[], message: string }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
      path,
      message,
    }))
  )
}

export function expectGraphQLValidationError (
  errors: readonly any[] | undefined,
  args: { message: string }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ message }) => ({ extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }, message }))
  )
}

export function expectAccessDenied (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[], msg: string }[]
) {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }))
  expect(unpackedErrors).toEqual(
    args.map(({ path, msg }) => ({
      extensions: { code: 'KS_ACCESS_DENIED' },
      path,
      message: `Access denied: ${msg}`,
    }))
  )
}

export function expectValidationError (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[], messages: string[] }[]
) {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }))
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages }) => ({
      extensions: { code: 'KS_VALIDATION_FAILURE' },
      path,
      message: `You provided invalid data for this operation.\n${j(messages)}`,
    }))
  )
}

export function expectBadUserInput (
  errors: readonly any[] | undefined,
  args: { path: any[], message: string }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: { code: 'KS_USER_INPUT_ERROR' },
      path,
      message: `Input error: ${message}`,
    }))
  )
}

export function expectAccessReturnError (
  errors: readonly any[] | undefined,
  args: { path: any[], errors: { tag: string, returned: string }[] }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, errors }) => {
      const message = `Invalid values returned from access control function.\n${j(
        errors.map(e => `${e.tag}: Returned: ${e.returned}. Expected: boolean.`)
      )}`
      return { extensions: { code: 'KS_ACCESS_RETURN_ERROR' }, path, message }
    })
  )
}

export function expectFilterDenied (
  errors: readonly any[] | undefined,
  args: { path: any[], message: string }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({ extensions: { code: 'KS_FILTER_DENIED' }, path, message }))
  )
}

export function expectResolverError (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[], messages: string[], debug: any[] }[]
) {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, debug }) => {
      const message = `An error occurred while resolving input fields.\n${j(messages)}`
      return { extensions: { code: 'KS_RESOLVER_ERROR', debug }, path, message }
    })
  )
}

export const expectSingleResolverError = (
  errors: readonly any[] | undefined,
  path: string,
  fieldPath: string,
  message: string
) =>
  expectResolverError(errors, [
    {
      path: [path],
      messages: [`${fieldPath}: ${message}`],
      debug: [{ message, stacktrace: expect.stringMatching(new RegExp(`Error: ${message}\n`)) }],
    },
  ])

export const expectRelationshipError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[], messages: string[], debug: any[] }[]
) => {
  const unpackedErrors = unpackErrors(errors)
  expect(unpackedErrors).toEqual(
    args.map(({ path, messages, debug }) => {
      const message = `An error occurred while resolving relationship fields.\n${j(messages)}`
      return { extensions: { code: 'KS_RELATIONSHIP_ERROR', debug }, path, message }
    })
  )
}

export const expectSingleRelationshipError = (
  errors: readonly any[] | undefined,
  path: string,
  fieldPath: string,
  message: string
) =>
  expectRelationshipError(errors, [
    {
      path: [path],
      messages: [`${fieldPath}: ${message}`],
      debug: [{ message, stacktrace: expect.stringMatching(new RegExp(`Error: ${message}\n`)) }],
    },
  ])

export async function seed<T extends Record<keyof T, Record<string, unknown>[]>> (
  context: KeystoneContext,
  initialData: T
) {
  const results: any = {}
  for (const listKey of Object.keys(initialData)) {
    results[listKey as keyof T] = await context.sudo().query[listKey].createMany({
      data: initialData[listKey as keyof T],
    })
  }

  return results as Record<keyof T, Record<string, unknown>[]>
}

export function testConfig <TypeInfo extends BaseKeystoneTypeInfo> (config: FloatingConfig<TypeInfo>): KeystoneConfig {
  return {
    ...config,
    db: {
      provider: dbProvider,
      url: '',
      ...config.db,
    },
    // default to a disabled UI
    ui: {
      isDisabled: true,
      ...config.ui
    },
  }
}

export async function getPrismaSchema <TypeInfo extends BaseKeystoneTypeInfo> (config: FloatingConfig<TypeInfo>) {
  const system = createSystem(testConfig(config))
  return (await getArtifacts(system)).prisma
}
