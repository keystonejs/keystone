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
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.labelField option for field 'A.something' uses 'doesNotExist' but that field doesn't exist."`
  )
})

test("labelField that doesn't exist is rejected with displayMode: cards", () => {
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
                  displayMode: 'cards',
                  cardFields: ['name'],
                  inlineConnect: { labelField: 'doesNotExist' },
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.inlineConnect.labelField option for field 'A.something' uses 'doesNotExist' but that field doesn't exist."`
  )
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
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.searchFields option for relationship field 'A.something' includes 'doesNotExist' but that field doesn't exist."`
  )
})

test("searchFields that don't exist are rejected with displayMode: cards", () => {
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
                  displayMode: 'cards',
                  cardFields: ['name'],
                  inlineConnect: { labelField: 'name', searchFields: ['doesNotExist'] },
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.inlineConnect.searchFields option for relationship field 'A.something' includes 'doesNotExist' but that field doesn't exist."`
  )
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
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.searchFields option for field 'A.something' includes 'notText' but that field doesn't have a contains filter that accepts a GraphQL String"`
  )
})

test("searchFields that aren't searchable are rejected with displayMode: cards", () => {
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
                  displayMode: 'cards',
                  cardFields: ['name'],
                  inlineConnect: { labelField: 'name', searchFields: ['notText'] },
                },
              }),
            },
          }),
          Thing,
        },
      }),
      {} as any
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"The ui.searchFields option for field 'A.something' includes 'notText' but that field doesn't have a contains filter that accepts a GraphQL String"`
  )
})
