const execa = require('execa');

const { getProjectsInfo } = require('./utils');

const projects = getProjectsInfo();
const commands = Object.keys(projects).map(project => {
  const { dir, envString } = projects[project];
  return `cd ${dir} && ${envString ? `${envString} ` : ''}node index.js`;
});

const names = Object.keys(projects);

execa(
  'concurrently',
  ['--kill-others', '-n', names.join(',')].concat(
    commands.map(com => `"${com}"`)
  ),
  {
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  }
).catch(() => {
  process.exit(1);
});

// Successfully exit no matter what
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
