const prompts = require('prompts');
const { getArgs } = require('./get-args');
const { projects } = require('../example-projects/config');

let EXAMPLE_PROJECT_CHOICE;

const getExampleProject = async () => {
  // If we already have the project template return it
  if (EXAMPLE_PROJECT_CHOICE) {
    return EXAMPLE_PROJECT_CHOICE;
  }

  // If the project template was provided via the CLI arguments
  const args = getArgs();
  const argValue = args['--template'];
  if (argValue) {
    projects.map(project => {
      if (project.folder == argValue) {
        EXAMPLE_PROJECT_CHOICE = project;
      }
    });
    if (EXAMPLE_PROJECT_CHOICE) {
      return EXAMPLE_PROJECT_CHOICE;
    }
    console.error('Invalid --template value:', argValue);
  }

  // Prompt for an project template
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
