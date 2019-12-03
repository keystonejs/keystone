const { spawnSync } = require('child_process');

let shouldRunCI = false;

// process.env.CIRCLE_JOB;

let { stdout } = spawnSync('/usr/bin/git', ['diff', '--name-only', 'master'], {
  stdio: 'inherit',
});
let changedFiles = stdout.toString().split('\n');

if (changedFiles.every(filename => filename.endsWith('.md'))) {
  console.log('No code changes skipping CI');
  shouldRunCI = false;
}

if (shouldRunCI === false) {
  console.log('Test skipped');
  spawnSync('circleci-agent', ['step', 'halt'], { stdio: 'inherit' });
}
