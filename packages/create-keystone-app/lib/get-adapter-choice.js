const prompts = require('prompts');
const { getExampleProject } = require('./get-example-project');

let ADAPTER_CHOICE;

const getAdapterChoice = async () => {
  // If we already have the project name return it
  if (ADAPTER_CHOICE) {
    return ADAPTER_CHOICE;
  }
  const project = await getExampleProject();
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
