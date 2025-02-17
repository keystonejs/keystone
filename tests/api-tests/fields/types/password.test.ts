import { password } from '@keystone-6/core/fields'
import { filterTests } from './utils'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '../../test-runner'
import { allowAll } from '@keystone-6/core/access'

// note that while password fields can be non-nullable
// non-nullable password fields cannot be filtered
// so that's why we're not testing non-nullable password fields here
filterTests(password(), match => {
  const values = [null, 'some password', 'another password']
  match(values, { isSet: false }, [0])
  match(values, { isSet: true }, [1, 2])
})

const runner = setupTestRunner({
  serve: true,
  config: ({
    lists: {
      User: list({
        access: allowAll,
        fields: {
          password: password(),
        },
      }),
    },
  }),
})

test('password 72 characters long is allowed', runner(async ({context}) => {
  await context.db.User.createOne({data: { password: 'a'.repeat(72) }})
}))


test('password longer than 72 characters is rejected', runner(async ({context}) => {
  try {
    await context.db.User.createOne({data: { password: 'a'.repeat(73) }})
    expect(false).toBe(true)
  } catch (error: any) {
    expect(error.message).toEqual(`An error occurred while resolving input fields.
  - User.password: value must be no longer than 72 characters`)
  }
}))

test('password that is 72 utf-16 code units but 76 utf-8 code units is rejected', runner(async ({context}) => {
  const password = 'a'.repeat(70) + '❤️'
  expect(password.length).toBe(72)
  expect(new TextEncoder().encode(password).length).toBe(76)
  try {
    await context.db.User.createOne({data: { password }})
    expect(false).toBe(true)
  } catch (error: any) {
    expect(error.message).toEqual(`An error occurred while resolving input fields.
  - User.password: value must be no longer than 72 characters`)
  }
}))
