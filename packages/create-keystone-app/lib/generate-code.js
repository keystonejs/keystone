const { getAdapterTemplateContent } = require('./get-adapter-template-content');
const { getProjectName } = require('./get-project-name');

const generateCode = async () => {
  const adapterTemplateContent = await getAdapterTemplateContent();

  const projectName = await getProjectName();
  const projectConfigString = `const PROJECT_NAME = ${JSON.stringify(projectName)};`;

  const generatedCode = `${adapterTemplateContent}
${projectConfigString}
`;
  return generatedCode;
};

module.exports = { generateCode };
