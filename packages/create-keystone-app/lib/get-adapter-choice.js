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

  // If the database option was provided via the CLI arguments
  const args = getArgs();
  const argValue = args['--database'];
  if (argValue) {
    if (project.adapters[argValue]) {
      ADAPTER_CHOICE = project.adapters[argValue];
      return ADAPTER_CHOICE;
    }

    const foundArg = Object.values(project.adapters).find(
      adapter => adapter.name.toLowerCase() === argValue.trim().toLowerCase()
    );
    if (foundArg) {
      ADAPTER_CHOICE = foundArg.name;
      return ADAPTER_CHOICE;
    }
    console.error('Invalid --database value:', argValue);
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
      message: 'Select a database type',
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
