import { config, list, group } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { getContext } from '@keystone-6/core/context'
import { integer, text } from '@keystone-6/core/fields'

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
