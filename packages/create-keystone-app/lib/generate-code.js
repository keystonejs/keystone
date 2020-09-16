const { getProjectName } = require('./get-project-name');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const projectName = await getProjectName();

  const adapterChoice = await getAdapterChoice();
  const adapterConfig =
    adapterChoice.name === 'MongoDB'
      ? `{ mongoUri: '${await getAdapterConfig()}' }`
      : `{ knexOptions: { connection: '${await getAdapterConfig()}' } }`;
  const adapterRequire =
    adapterChoice.name === 'MongoDB'
      ? `const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');`
      : `const { KnexAdapter: Adapter } = require('@keystonejs/adapter-knex');`;

  return `${adapterRequire}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
