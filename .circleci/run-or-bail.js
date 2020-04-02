const { spawnSync } = require('child_process');

let shouldRunCI = true;

let { stdout } = spawnSync('/usr/bin/git', ['diff', '--name-only', 'origin/master'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  encoding: 'utf8',
});

let changedFiles = stdout.toString().split('\n');

const ignoreFiles = ['.md', '.png', '.jpg', '.txt', '.svg'];

changedFiles = changedFiles.filter(filename => {
  return !ignoreFiles.some(extension => filename.endsWith(extension));
});

if (process.env.CIRCLE_JOB !== 'simple_tests') {
  const ignorePaths = [
    'demo-projects/',
    'website/',
    'packages/app-next',
    'packages/app-nuxt',
    'packages/app-static',
    'packages/apollo-helpers',
  ];

  changedFiles = changedFiles.filter(filename => {
    return !ignorePaths.some(path => filename.startsWith(path));
  });
}

// Remove empty
changedFiles = changedFiles.filter(filename => filename && filename !== '');

if (changedFiles.length === 0) {
  shouldRunCI = false;
}

if (shouldRunCI === false) {
  console.log('Test skipped');
  spawnSync('circleci-agent', ['step', 'halt'], { stdio: 'inherit' });
} else {
  console.log('Test not skipped');
  console.log(changedFiles);
}
