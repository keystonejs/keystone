const { getProjectName } = require('./get-project-name');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const projectName = await getProjectName();
  const adapterChoice = await getAdapterChoice();
  const adapterConfig = `{ url: '${await getAdapterConfig()}' }`;
  const adapterRequire = {
    MongoDB: `const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');`,
    PostgreSQL: `const { KnexAdapter: Adapter } = require('@keystonejs/adapter-knex');`,
    Prisma: `const { PrismaAdapter: Adapter } = require('@keystonejs/adapter-prisma');`,
  }[adapterChoice.key];

  return `${adapterConfig}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
