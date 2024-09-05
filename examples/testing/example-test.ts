import path from 'node:path'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import { resetDatabase } from '@keystone-6/core/testing'
import { getContext } from '@keystone-6/core/context'
import config from './keystone'
import * as PrismaModule from 'myprisma'

const prismaSchemaPath = path.join(__dirname, 'schema.prisma')
const context = getContext(config, PrismaModule)

beforeEach(async () => {
  await resetDatabase(config.db.url, prismaSchemaPath)
})

test('Create a User using context.query', async () => {
  const person = await context.query.User.createOne({
    data: { name: 'Alice', password: 'dont-use-me' },
    query: 'id name password { isSet }',
  })
  assert.equal(person.name, 'Alice')
  assert.equal(person.password.isSet, true)
})

test('Check that trying to create user with no name (required field) fails', async () => {
  await assert.rejects(
    async () => {
      await context.db.User.createOne({
        data: {
          password: 'not-a-password',
        },
      })
    },
    {
      message: 'You provided invalid data for this operation.\n  - User.name: value must not be empty',
    }
  )
})

test('Check access control by running updateTask as a specific user via context.withSession()', async () => {
  // seed a few users to test with
  const [alice, bob] = await context.query.User.createMany({
    data: [
      { name: 'Alice', password: 'dont-use-me' },
      { name: 'Bob', password: 'dont-use-me' },
    ],
    query: 'id name',
  })
  assert.equal(alice.name, 'Alice')
  assert.equal(bob.name, 'Bob')

  // assign a task to Alice
  const task = await context.query.Task.createOne({
    data: {
      label: 'Experiment with Keystone',
      priority: 'high',
      isComplete: false,
      assignedTo: { connect: { id: alice.id } },
    },
    query: 'id label priority isComplete assignedTo { name }',
  })
  assert.equal(task.label, 'Experiment with Keystone')
  assert.equal(task.priority, 'high')
  assert.equal(task.isComplete, false)
  assert.equal(task.assignedTo.name, 'Alice')
  await assert.rejects(
    async () => {
      await context.db.Task.updateOne({
        where: { id: task.id },
        data: { isComplete: true },
      })
    },
    {
      message: `Access denied: You cannot update that Task - it may not exist`,
    }
  )

  // test that we can update the task (with a session)
  {
    const result = await context
      .withSession({ listKey: 'User', itemId: alice.id, data: {} })
      .db.Task.updateOne({
        where: { id: task.id },
        data: { isComplete: true },
      })
    assert.equal(result.id, task.id)
  }

  // test that we can't update the task (with an invalid session (Bob))
  await assert.rejects(
    async () => {
      await context.withSession({ listKey: 'User', itemId: bob.id, data: {} }).db.Task.updateOne({
        where: { id: task.id },
        data: { isComplete: true },
      })
    },
    {
      message: `Access denied: You cannot update that Task - it may not exist`,
    }
  )
})
