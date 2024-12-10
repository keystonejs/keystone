import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { getContext } from '@keystone-6/core/context'
import { integer, relationship, text } from '@keystone-6/core/fields'

const Thing = list({
  access: allowAll,
  fields: {
    name: text(),
    other: text(),
    notText: integer(),
  },
})

test("labelField that doesn't exist is rejected with displayMode: select", () => {
  expect(() =>
    getContext(
      ({
        db: {
          provider: 'sqlite',
          url: 'file://'
        },
        lists: {
          A: list({
            access: allowAll,
            fields: {
              something: relationship({
                ref: 'Thing',
                ui: {
                  labelField: 'doesNotExist',
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(`""doesNotExist" is not a field of list "Thing""`)
})

test("searchFields that don't exist are rejected with displayMode: select", () => {
  expect(() =>
    getContext(
      ({
        db: {
          provider: 'sqlite',
          url: 'file://'
        },
        lists: {
          A: list({
            access: allowAll,
            fields: {
              something: relationship({
                ref: 'Thing',
                ui: {
                  searchFields: ['doesNotExist'],
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(`""doesNotExist" is not a field of list "Thing""`)
})

test("searchFields that aren't searchable are rejected with displayMode: select", () => {
  expect(() =>
    getContext(
      ({
        db: {
          provider: 'sqlite',
          url: 'file://'
        },
        lists: {
          A: list({
            access: allowAll,
            fields: {
              something: relationship({
                ref: 'Thing',
                ui: {
                  searchFields: ['notText'],
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(`""doesNotExist" is not a field of list "Thing""`)
})
