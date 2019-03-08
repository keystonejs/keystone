module.exports = {
  // prettier-ignore
  spec: {
    '--out': String,
    '-o':    '--out',
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} build --out=dist

    Options
      --out, -o   Directory to save build [dist]
  `,
  exec: args => {
    console.log('build command not yet implemented');
    if (args['--out']) {
      console.log('--out', args['--out']);
    }
  },
};
