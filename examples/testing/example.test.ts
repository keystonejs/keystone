import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, setupTestRunner, TestEnv } from '@keystone-next/keystone/testing';
import config from './keystone';

// Setup a test runner which will provide a clean test environment
// with access to our GraphQL API for each test.
const runner = setupTestRunner({ config });

describe('Example tests using test runner', () => {
  test(
    'Create a Person using the list items API',
    runner(async ({ context }) => {
      // We can use the context argument provided by the test runner to access
      // the full context API.
      const person = await context.lists.Person.createOne({
        data: { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
        query: 'id name email password { isSet }',
      });
      expect(person.name).toEqual('Alice');
      expect(person.email).toEqual('alice@example.com');
      expect(person.password.isSet).toEqual(true);
    })
  );

  test(
    'Create a Person using a hand-crafted GraphQL query sent over HTTP',
    runner(async ({ graphQLRequest }) => {
      // We can use the graphQLRequest argument provided by the test runner
      // to execute HTTP requests to our GraphQL API and get a supertest
      // "Test" object back. https://github.com/visionmedia/supertest
      const { body } = await graphQLRequest({
        query: `mutation {
          createPerson(data: { name: "Alice", email: "alice@example.com", password: "super-secret" }) {
            id name email password { isSet }
          }
        }`,
      }).expect(200);
      const person = body.data.createPerson;
      expect(person.name).toEqual('Alice');
      expect(person.email).toEqual('alice@example.com');
      expect(person.password.isSet).toEqual(true);
    })
  );

  test(
    'Check that trying to create user with no name (required field) fails',
    runner(async ({ context }) => {
      // The context.graphql.raw API is useful when we expect to recieve an
      // error from an operation.
      const { data, errors } = await context.graphql.raw({
        query: `mutation {
          createPerson(data: { email: "alice@example.com", password: "super-secret" }) {
            id name email password { isSet }
          }
        }`,
      });
      expect(data!.createPerson).toBe(null);
      expect(errors).toHaveLength(1);
      expect(errors![0].path).toEqual(['createPerson']);
      expect(errors![0].message).toEqual(
        'You provided invalid data for this operation.\n  - Person.name: Required field "name" is null or undefined.'
      );
    })
  );

  test(
    'Check access control by running updateTask as a specific user via context.withSession()',
    runner(async ({ context }) => {
      // We can modify the value of context.session via context.withSession() to masquerade
      // as different logged in users. This allows us to test that our access control rules
      // are behaving as expected.

      // Create some users
      const [alice, bob] = await context.lists.Person.createMany({
        data: [
          { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
          { name: 'Bob', email: 'bob@example.com', password: 'super-secret' },
        ],
        query: 'id name',
      });
      expect(alice.name).toEqual('Alice');
      expect(bob.name).toEqual('Bob');

      // Create a task assigned to Alice
      const task = await context.lists.Task.createOne({
        data: {
          label: 'Experiment with Keystone',
          priority: 'high',
          isComplete: false,
          assignedTo: { connect: { id: alice.id } },
        },
        query: 'id label priority isComplete assignedTo { name }',
      });
      expect(task.label).toEqual('Experiment with Keystone');
      expect(task.priority).toEqual('high');
      expect(task.isComplete).toEqual(false);
      expect(task.assignedTo.name).toEqual('Alice');

      // Check that we can't update the task (not logged in)
      {
        const { data, errors } = await context.graphql.raw({
          query: `mutation update($id: ID!) {
            updateTask(where: { id: $id }, data: { isComplete: true }) {
              id
            }
          }`,
          variables: { id: task.id },
        });
        expect(data!.updateTask).toBe(null);
        expect(errors).toHaveLength(1);
        expect(errors![0].path).toEqual(['updateTask']);
        expect(errors![0].message).toEqual(
          `Access denied: You cannot perform the 'update' operation on the item '{"id":"${task.id}"}'. It may not exist.`
        );
      }

      {
        // Check that we can update the task when logged in as Alice
        const { data, errors } = await context
          .withSession({ itemId: alice.id, data: {} })
          .graphql.raw({
            query: `mutation update($id: ID!) {
              updateTask(where: { id: $id }, data: { isComplete: true }) {
                id
              }
            }`,
            variables: { id: task.id },
          });
        expect(data!.updateTask.id).toEqual(task.id);
        expect(errors).toBe(undefined);
      }

      // Check that we can't update the task when logged in as Bob
      {
        const { data, errors } = await context
          .withSession({ itemId: bob.id, data: {} })
          .graphql.raw({
            query: `mutation update($id: ID!) {
              updateTask(where: { id: $id }, data: { isComplete: true }) {
                id
              }
            }`,
            variables: { id: task.id },
          });
        expect(data!.updateTask).toBe(null);
        expect(errors).toHaveLength(1);
        expect(errors![0].path).toEqual(['updateTask']);
        expect(errors![0].message).toEqual(
          `Access denied: You cannot perform the 'update' operation on the item '{"id":"${task.id}"}'. It may not exist.`
        );
      }
    })
  );
});

describe('Example tests using test environment', () => {
  // The test runner provided by setupTestRunner will drop all the data from the
  // database and then provide a fresh connection for every test.
  //
  // If we want to use the same database for multiple tests, without deleting data
  // between each test, we can use setupTestEnv in our `beforeAll()` block and
  // manage the connection and disconnection ourselves.
  //
  // This gives us the opportunity to seed test data once up front and use it in
  // multiple tests.
  let testEnv: TestEnv, context: KeystoneContext;
  let person: { id: string };
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    // Create a person in the database to be used in multiple tests
    person = (await context.lists.Person.createOne({
      data: { name: 'Alice', email: 'alice@example.com', password: 'super-secret' },
    })) as { id: string };
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  test('Check that the persons password is set', async () => {
    const { password } = await context.lists.Person.findOne({
      where: { id: person.id },
      query: 'password { isSet }',
    });
    expect(password.isSet).toEqual(true);
  });

  test('Update the persons email address', async () => {
    const { email } = await context.lists.Person.updateOne({
      where: { id: person.id },
      data: { email: 'new-email@example.com' },
      query: 'email',
    });
    expect(email).toEqual('new-email@example.com');
  });
});
