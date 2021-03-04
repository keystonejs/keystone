const { getProjectName } = require('./get-project-name');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const projectName = await getProjectName();

  const adapterChoice = await getAdapterChoice();
  const adapterConfig = {
    MongoDB: `{ mongoUri: '${await getAdapterConfig()}' }`,
    PostgreSQL: `{ knexOptions: { connection: '${await getAdapterConfig()}' } }`,
    Prisma: `{ url: '${await getAdapterConfig()}' }`,
  }[adapterChoice.key];

  const adapterRequire = {
    MongoDB: `const { MongooseAdapter: Adapter } = require('@keystone-next/adapter-mongoose-legacy');`,
    PostgreSQL: `const { KnexAdapter: Adapter } = require('@keystone-next/adapter-knex-legacy');`,
    Prisma: `const { PrismaAdapter: Adapter } = require('@keystone-next/adapter-prisma-legacy');`,
  }[adapterChoice.key];

  return `${adapterRequire}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
