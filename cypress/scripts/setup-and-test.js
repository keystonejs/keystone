const execa = require('execa');

const { getProjectsInfo } = require('./utils');

if (process.argv.length !== 3) {
  throw new Error('Usage: `setup-and-test.js <test-command>`');
}

const testCommand = process.argv[2];

const projects = getProjectsInfo();
const resources = Object.keys(projects).map(project => {
  const { env } = projects[project];
  return `http-get://localhost:${env.PORT}/admin`;
});

execa(
  'node',
  [
    './packages/start-server-and-test/bin/start.js',
    'cypress:start:servers',
    resources.join('|'),
    testCommand,
  ],
  {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  },
).catch(() => {
  process.exit(1);
});
