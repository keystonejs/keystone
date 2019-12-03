const { spawnSync } = require('child_process');

let shouldRunCI = true;

// process.env.CIRCLE_JOB;

let { stdout } = spawnSync('/usr/bin/git', ['diff', '--name-only', 'master'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  encoding: 'utf8',
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
