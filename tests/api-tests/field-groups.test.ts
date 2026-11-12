import { beforeAll, describe, expect, test } from 'vitest'
import { config, list, group } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { getContext } from '@keystone-6/core/context'
import { integer, text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { adminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql.ts'

describe('group UI configuration', () => {
  const runner = setupTestRunner({
    config: {
      lists: {
        Post: list({
          access: allowAll,
          fields: {
            ...group({
              label: 'Default',
              fields: { defaultField: text() },
            }),
            ...group({
              label: 'Empty UI',
              ui: {},
              fields: { emptyUIField: text() },
            }),
            ...group({
              label: 'Expanded',
              ui: { defaultOpen: true },
              fields: { expandedField: text() },
            }),
            ...group({
              label: 'Collapsed',
              ui: { defaultOpen: false },
              fields: { collapsedField: text() },
            }),
          },
        }),
      },
    },
  })

  beforeAll(
    runner(async () => {}),
    60_000
  )

  test(
    'exposes the configured initial state and defaults to expanded in Admin UI metadata',
    runner(async ({ context }) => {
      const data = await context.sudo().graphql.run({ query: adminMetaQuery })
      expect(data).toMatchObject({
        keystone: {
          adminMeta: {
            lists: [
              {
                groups: [
                  { label: 'Default', defaultOpen: true, fields: [{ key: 'defaultField' }] },
                  { label: 'Empty UI', defaultOpen: true, fields: [{ key: 'emptyUIField' }] },
                  { label: 'Expanded', defaultOpen: true, fields: [{ key: 'expandedField' }] },
                  { label: 'Collapsed', defaultOpen: false, fields: [{ key: 'collapsedField' }] },
                ],
              },
            ],
          },
        },
      })
    })
  )
})

test('errors with nested field groups', () => {
  expect(() =>
    getContext(
      config({
        db: {
          provider: 'sqlite',
          prismaClientOptions: () => ({}),
        },
        lists: {
          User: list({
            access: allowAll,
            fields: {
              name: text(),
              ...group({
                label: 'Group 1',
                fields: {
                  ...group({
                    label: 'Group 2',
                    fields: {
                      something: integer(),
                    },
                  }),
                },
              }),
            } as any,
          }),
        },
      }),
      {}
    )
  ).toThrowError('groups cannot be nested')
})

test('errors if you write a group manually differently to the group function', () => {
  expect(() =>
    getContext(
      config({
        db: {
          provider: 'sqlite',
          prismaClientOptions: () => ({}),
        },
        lists: {
          User: list({
            access: allowAll,
            fields: {
              name: text(),
              __group0: {
                fields: ['name'],
                label: 'Group 1',
                description: null,
              } as any,
            } as any,
          }),
        },
      }),
      {}
    )
  ).toThrowError('unexpected value for a group at User.__group0')
})
