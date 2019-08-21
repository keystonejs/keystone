const prompts = require('prompts');

let PROJECT_NAME = null;

const getProjectName = async () => {
  // If we already have the project name return it
  if (PROJECT_NAME) {
    return PROJECT_NAME;
  }

  const response = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'What is your project name?',
      validate: value => value.length,
    },
    {
      onCancel: () => {
        process.exit(0);
      },
    }
  );

  // Set a global variable to avoid prompting twice
  PROJECT_NAME = response.value;
  return PROJECT_NAME;
};

module.exports = { getProjectName };
