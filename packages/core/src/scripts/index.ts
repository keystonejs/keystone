import { cli } from './cli';
import { ExitError } from './utils';

cli(process.cwd(), process.argv.slice(2)).catch(err => {
  if (err instanceof ExitError) return process.exit(err.code);

  console.error(err);
  process.exit(1);
});
