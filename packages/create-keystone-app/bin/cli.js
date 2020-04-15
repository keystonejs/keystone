#!/usr/bin/env node

const { showWelcomeMessage } = require('../lib/show-welcome-message');
const { showSuccessMessage } = require('../lib/show-success-message');
const { getProjectName } = require('../lib/get-project-name');
const { copyExampleProject } = require('../lib/copy-example-project');
const { installProjectDependencies } = require('../lib/install-project-dependencies');
const { updateProjectDependencies } = require('../lib/update-project-dependencies');
const { getAdapterChoice } = require('../lib/get-adapter-choice');
const { getAdapterConfig } = require('../lib/get-adapter-config');
const { testAdapterConnection } = require('../lib/test-adapter-connection');
const { replaceKeystoneMagicComments } = require('../lib/replace-keystone-magic-comments');

// Start
(async () => {
  showWelcomeMessage();
  await getProjectName();
  await getAdapterChoice();
  await getAdapterConfig();
  await testAdapterConnection();
  await copyExampleProject();
  await replaceKeystoneMagicComments();
  await installProjectDependencies();
  await updateProjectDependencies();
  showSuccessMessage();
})();
