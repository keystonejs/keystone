const { getProjectName } = require('./get-project-name');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const projectName = await getProjectName();

  const adapterChoice = await getAdapterChoice();
  const adapterConfig = {
    MongoDB: `{ mongoUri: '${await getAdapterConfig()}' }`,
    PostgreSQL: `{ knexOptions: { connection: '${await getAdapterConfig()}' } }`,
  }[adapterChoice.key];

  const adapterRequire = {
    MongoDB: `const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');`,
    PostgreSQL: `const { KnexAdapter: Adapter } = require('@keystonejs/adapter-knex');`,
  }[adapterChoice.key];

  return `${adapterRequire}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
