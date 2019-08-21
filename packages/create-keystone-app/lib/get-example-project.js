const prompts = require('prompts');
const { projects } = require('../example-projects/config');

let EXAMPLE_PROJECT_CHOICE;

const getExampleProject = async () => {
  if (EXAMPLE_PROJECT_CHOICE) {
    return EXAMPLE_PROJECT_CHOICE;
  }

  const choices = projects.map(project => {
    return {
      value: project,
      title: project.title,
      description: project.description,
    };
  });

  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: 'Select a starter project',
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

  EXAMPLE_PROJECT_CHOICE = response.value;

  return EXAMPLE_PROJECT_CHOICE;
};

module.exports = { getExampleProject };
