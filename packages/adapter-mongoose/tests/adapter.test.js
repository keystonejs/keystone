const MongoDBMemoryServer = require('mongodb-memory-server').default;
const { createLazyDeferred } = require('@voussoir/utils');

const { MongooseAdapter } = require('../');

async function withMongoMemoryServer(adapter, callback) {
  const mongoServer = new MongoDBMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  const dbName = await mongoServer.getDbName();

  const cleanup = () => adapter.close().then(() => mongoServer.stop());

  return Promise.resolve(callback({ mongoUri, dbName }))
    .then(result => {
      cleanup();
      return result;
    })
    .catch(error => {
      cleanup();
      throw error;
    });
}

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('MongooseAdapter', () => {
  test('awaits setup tasks when connecting', async () => {
    const adapter = new MongooseAdapter();

    await withMongoMemoryServer(adapter, async ({ mongoUri, dbName }) => {
      // We'll manually resolve this promise later in the test after some
      // assertions and turns of the event loop (and the micro-task queue)
      const setupTask = createLazyDeferred();

      // Push a promise to be waited upon
      adapter.pushSetupTask(setupTask.promise);

      // Setup a hook to so we can wait for the connection to occur
      // (This is hacky, but we need a way to wait until the main work of
      // `connect` is complete before it moves onto the second phase of waiting
      // for the setup tasks)
      const mongooseConnected = createLazyDeferred();
      const connectToMongoose = adapter.mongoose.connect.bind(adapter.mongoose);
      adapter.mongoose.connect = (...args) =>
        connectToMongoose(...args)
          .then(result => {
            mongooseConnected.resolve();
            return result;
          })
          .catch(error => {
            mongooseConnected.reject(error);
          });

      // Call connect, which should wait on the above promise
      const connectionPromise = adapter.connect(
        mongoUri,
        { dbName }
      );

      // Add a hook for asserting the .connect call has completed
      const connectionResolved = jest.fn();
      connectionPromise.then(connectionResolved);

      // Now we wait for the mongoose hook to complete
      await mongooseConnected.promise;

      // If there were any chained promises on the adapter.connect call _which
      // are also resolved_, we can now wait for them to be executed (really
      // there shouldn't be any)
      await new Promise(resolve => process.nextTick(resolve));

      // Assert we're still waiting for the setup tasks
      expect(connectionResolved.mock.calls).toHaveLength(0);

      // Manually trigger resolution of the setup task
      setupTask.resolve('hurray');

      // Let all the promises resolve again
      await new Promise(resolve => process.nextTick(resolve));

      // Assert the connection _was_ resolved
      expect(connectionResolved.mock.calls).toHaveLength(1);
    });
  });

  test('re-throws all errors generated during setup tasks', async () => {
    // check error.errors is an array with an error per bad setup task
    const adapter = new MongooseAdapter();

    await withMongoMemoryServer(adapter, async ({ mongoUri, dbName }) => {
      // Push promises to be waited upon
      adapter.pushSetupTask(Promise.reject('Oh no'));
      adapter.pushSetupTask(Promise.resolve('ok'));
      adapter.pushSetupTask(Promise.reject('Boom'));

      // Call connect, which should wait on the above promises and then reject
      // because some of the tasks failed
      await expect(
        adapter.connect(
          mongoUri,
          { dbName }
        )
      ).rejects.toMatchObject({
        errors: ['Oh no', 'Boom'],
      });
    });
  });
});
