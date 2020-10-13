const c = require('kleur');
const path = require('path');
const terminalLink = require('terminal-link');
const { getProjectDirectory } = require('./util');
const { getAdapterChoice } = require('./get-adapter-choice');
const { getAdapterConfig } = require('./get-adapter-config');

const showSuccessMessage = async () => {
  const projectDir = await getProjectDirectory();
  const adapterChoice = await getAdapterChoice();
  let knexMessage = '';
  const adapterConfig = await getAdapterConfig();
  if (adapterChoice.key === 'PostgreSQL') {
    knexMessage = `
${c.bold('  Before you run Keystone you will need to initialise the tables in your database:')}

  - cd ${projectDir}
  - npx keystone create-tables

  For troubleshooting and further information see:

  - https://www.keystonejs.com/quick-start/adapters/
  - https://www.keystonejs.com/keystonejs/adapter-knex/
`;
  }

  console.log(`
  🎉  Keystone created a starter project in: ${c.bold(projectDir)}
  ${knexMessage}
  ${c.bold('To launch your app, run:')}

  - cd ${projectDir}
  - ${adapterChoice.key === 'Prisma' ? `DATABASE_URL=${adapterConfig} yarn dev` : 'yarn dev'}

  ${c.bold('Next steps:')}

  - ${terminalLink('View your app', 'http://localhost:3000')}
  - Edit ${c.bold(`${projectDir}${path.sep}index.js`)} to customize your app.
  - ${terminalLink('Open the Admin UI', 'http://localhost:3000/admin')}
  - ${terminalLink('Read the docs', 'https://keystonejs.com')}
  - ${terminalLink('Star Keystone on GitHub', 'https://github.com/keystonejs/keystone')}
`);
};

module.exports = { showSuccessMessage };
