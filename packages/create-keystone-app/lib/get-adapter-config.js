const prompts = require('prompts');
const { getArgs } = require('./get-args');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getProjectName } = require('./get-project-name');

let CONNECTION_STRING;

const getAdapterConfig = async () => {
  // If we already have the project name return it
  if (!CONNECTION_STRING) {
    // If the adapter option was provided via the CLI arguments
    const args = getArgs();
    const argValue = args['--connection-string'];
    if (argValue) {
      CONNECTION_STRING = argValue;
      return CONNECTION_STRING;
    }

    const adapterChoice = await getAdapterChoice();
    const projectName = await getProjectName();
    const response = await prompts(
      {
        type: 'text',
        name: 'value',
        message: 'Where is your database located?',
        initial: adapterChoice.defaultConfig(projectName),
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
    CONNECTION_STRING = response.value.trim();
  }
  return CONNECTION_STRING;
};

module.exports = { getAdapterConfig };
