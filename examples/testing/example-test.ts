import path from 'node:path';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { resetDatabase } from '@keystone-6/core/testing';
import { getContext } from '@keystone-6/core/context';
import baseConfig from './keystone';
import * as PrismaModule from '.myprisma/client';

const dbUrl = `file:./test-${process.env.JEST_WORKER_ID}.db`;
const prismaSchemaPath = path.join(__dirname, 'schema.prisma');
const config = { ...baseConfig, db: { ...baseConfig.db, url: dbUrl } };

const context = getContext(config, PrismaModule);

beforeEach(async () => {
  await resetDatabase(dbUrl, prismaSchemaPath);
});

test('Create a User using context.query', async () => {
  const person = await context.query.User.createOne({
    data: { name: 'Alice', password: 'dont-use-me' },
    query: 'id name password { isSet }',
  });
  assert.equal(person.name, 'Alice');
  assert.equal(person.password.isSet, true);
});

test('Check that trying to create user with no name (required field) fails', async () => {
  // the context.graphql.raw API can be useful when you expect errors
  const { data, errors } = (await context.graphql.raw({
    query: `mutation {
          createUser(data: { password: "dont-use-me" }) {
            id name password { isSet }
          }
        }`,
  })) as any;
  assert.equal(data!.createUser, null);
  assert.equal(errors![0].path[0], 'createUser');
  assert.equal(
    errors![0].message,
    'You provided invalid data for this operation.\n  - User.name: Name must not be empty'
  );
});

test('Check access control by running updateTask as a specific user via context.withSession()', async () => {
  // seed a few users to test with
  const [alice, bob] = await context.query.User.createMany({
    data: [
      { name: 'Alice', password: 'dont-use-me' },
      { name: 'Bob', password: 'dont-use-me' },
    ],
    query: 'id name',
  });
  assert.equal(alice.name, 'Alice');
  assert.equal(bob.name, 'Bob');

  // assign a task to Alice
  const task = await context.query.Task.createOne({
    data: {
      label: 'Experiment with Keystone',
      priority: 'high',
      isComplete: false,
      assignedTo: { connect: { id: alice.id } },
    },
    query: 'id label priority isComplete assignedTo { name }',
  });
  assert.equal(task.label, 'Experiment with Keystone');
  assert.equal(task.priority, 'high');
  assert.equal(task.isComplete, false);
  assert.equal(task.assignedTo.name, 'Alice');

  // test that we can't update the task (without a session)
  {
    const { data, errors } = (await context.graphql.raw({
      query: `mutation update($id: ID!) {
            updateTask(where: { id: $id }, data: { isComplete: true }) {
              id
            }
          }`,
      variables: { id: task.id },
    })) as any;
    assert.equal(data!.updateTask, null);
    assert.equal(errors.length, 1);
    assert.equal(errors![0].path[0], 'updateTask');
    assert.equal(
      errors![0].message,
      'Access denied: You cannot update that Task - it may not exist'
    );
  }

  // test that we can update the task (with a session)
  {
    const { data, errors } = (await context
      .withSession({ listKey: 'User', itemId: alice.id, data: {} })
      .graphql.raw({
        query: `mutation update($id: ID!) {
              updateTask(where: { id: $id }, data: { isComplete: true }) {
                id
              }
            }`,
        variables: { id: task.id },
      })) as any;
    assert.equal(data!.updateTask.id, task.id);
    assert.equal(errors, undefined);
  }

  // test that we can't update the task (with an invalid session (Bob))
  {
    const { data, errors } = (await context
      .withSession({ listKey: 'User', itemId: bob.id, data: {} })
      .graphql.raw({
        query: `mutation update($id: ID!) {
              updateTask(where: { id: $id }, data: { isComplete: true }) {
                id
              }
            }`,
        variables: { id: task.id },
      })) as any;
    assert.equal(data!.updateTask, null);
    assert.equal(errors!.length, 1);
    assert.equal(errors![0].path[0], 'updateTask');
    assert.equal(
      errors![0].message,
      `Access denied: You cannot update that Task - it may not exist`
    );
  }
});
