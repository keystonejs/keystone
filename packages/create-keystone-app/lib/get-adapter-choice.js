const prompts = require('prompts');
const { getArgs } = require('./get-args');
const { getExampleProject } = require('./get-example-project');

let ADAPTER_CHOICE;

const getAdapterChoice = async () => {
  // If we already have the project name return it
  if (ADAPTER_CHOICE) {
    return ADAPTER_CHOICE;
  }

  const project = await getExampleProject();

  // If the adapter option was provided via the CLI arguments
  const args = getArgs();
  const argValue = args['--adapter'];
  if (argValue) {
    if (project.adapters[argValue]) {
      ADAPTER_CHOICE = project.adapters[argValue];
      return ADAPTER_CHOICE;
    }
    console.error('Invalid --adapter value:', argValue);
  }

  // Prompt for an adapter
  const choices = Object.keys(project.adapters).map(key => ({
    value: project.adapters[key],
    title: key,
    description: project.adapters[key].description,
  }));

  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: 'Select an adapter',
      choices,
      initial: 0,
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
  ADAPTER_CHOICE = response.value;

  return ADAPTER_CHOICE;
};

module.exports = { getAdapterChoice };
