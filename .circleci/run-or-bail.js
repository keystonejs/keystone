const { execSync } = require('child_process');

let shouldRunCI = false;

// process.env.CIRCLE_JOB;

let stdout = execSync('git', ['diff', '--name-only', 'master']);
let changedFiles = stdout.toString().split('\n');

if (changedFiles.every(filename => filename.endsWith('.md'))) {
  console.log('No code changes skipping CI');
  shouldRunCI = false;
}

if (shouldRunCI === false) {
  console.log('Test skipped');
  execSync('circleci-agent', ['step', 'halt'], { stdio: 'inherit' });
}
