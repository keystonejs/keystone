const c = require('kleur');
const path = require('path');
const terminalLink = require('terminal-link');
const { getProjectDirectory } = require('./util');

const showSuccessMessage = async () => {
  const projectDir = await getProjectDirectory();
  console.log(`
  🎉  KeystoneJS created a starter project in: ${c.bold(projectDir)}

  ${c.bold('To launch your app, run:')}

  - cd ${projectDir}
  - yarn dev

  ${c.bold('Next steps:')}

  - Edit ${c.bold(`${projectDir}${path.sep}index.js`)} to customize your app.
  - ${terminalLink('Open the Admin UI', 'http://localhost:3000/admin')}
  - ${terminalLink('Read the docs', 'https://keystonejs.com')}
  - ${terminalLink('Star KeystoneJS on GitHub', 'https://github.com/keystonejs/keystone-5')}
`);
};

module.exports = { showSuccessMessage };
