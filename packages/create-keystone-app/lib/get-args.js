const arg = require('arg');

let ARGS = false;

const getArgs = () => {
  if (ARGS) {
    return ARGS;
  }

  const argsSpec = {
    '--template': String,
    '--help': Boolean,
    '--dry-run': Boolean,
    '-h': '--help',
  };

  // Get example project args
  ARGS = arg(argsSpec, { permissive: true });
  return ARGS;
};

module.exports = { getArgs };
