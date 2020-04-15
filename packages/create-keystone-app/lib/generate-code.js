const { getAdapterTemplateContent } = require('./get-adapter-template-content');
const { getProjectName } = require('./get-project-name');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const adapterTemplateContent = await getAdapterTemplateContent();

  const projectName = await getProjectName();

  const adapterChoice = await getAdapterChoice();
  const adapterConfig =
    adapterChoice.name === 'MongoDB'
      ? `{ mongoUri: '${await getAdapterConfig()}' }`
      : `{ knexOptions: { connection: '${await getAdapterConfig()}' } }`;

  return `${adapterTemplateContent}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
