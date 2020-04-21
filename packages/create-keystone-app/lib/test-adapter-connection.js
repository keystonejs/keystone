const prompts = require('prompts');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const terminalLink = require('terminal-link');
const { error, tick } = require('./util');
const { getArgs } = require('./get-args');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');
const { getProjectName } = require('../lib/get-project-name');

let TEST_CONNECTION;

const testAdapterConnection = async () => {
  // If we already have the project name return it
  if (TEST_CONNECTION) {
    return TEST_CONNECTION;
  }

  // If the adapter option was provided via the CLI arguments
  const args = getArgs();
  const argValue = args['--test-connection'];
  if (argValue) {
    TEST_CONNECTION = argValue;
  } else {
    const response = await prompts(
      {
        type: 'toggle',
        name: 'value',
        message: 'Test database connection?',
        initial: true,
        active: 'Yes',
        inactive: 'No',
        onCancel: () => {
          return true;
        },
      },
      {
        onCancel: () => {
          process.exit(0);
        },
      }
    );
    TEST_CONNECTION = response.value;
  }
  if (TEST_CONNECTION) {
    const adapterChoice = await getAdapterChoice();
    const config = await getAdapterConfig();

    const Adapter = adapterChoice.name === 'MongoDB' ? MongooseAdapter : KnexAdapter;
    const adapterConfig =
      adapterChoice.name === 'MongoDB'
        ? { mongoUri: config }
        : { knexOptions: { connection: config } };
    const adapter = new Adapter(adapterConfig);
    try {
      await adapter._connect({ name: await getProjectName() });
      adapter.disconnect();
      tick(`Successfully connected to ${config}`);
    } catch (err) {
      error(`Failed to connect to ${adapterChoice.name} at: ${config}`);
      console.log(
        'Please check that you can connect directly to your database with the following command:'
      );
      console.log('');
      console.log(`$ ${adapterChoice.name === 'MongoDB' ? 'mongo' : 'psql'} ${config}`);
      console.log('');
      console.log(
        `Please see the database ${terminalLink(
          'setup docs',
          'https://www.keystonejs.com/quick-start/adapters'
        )} for more help`
      );
      console.log('');
      error('Details:');
      console.log(err);
      process.exit(0);
    }
  }
  return TEST_CONNECTION;
};

module.exports = { testAdapterConnection };
