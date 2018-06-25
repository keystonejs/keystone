const childProcess = require('child_process');

console.log('Starting server as child process');
const result = childProcess.spawnSync(
  'node',
  [].concat(require.resolve('./server')).concat(process.argv),
  { stdio: 'inherit' }
);
console.log('Done');
