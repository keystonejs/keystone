import chalk from 'chalk';

let preconstructEmoji = '🎁 ';

function suffix(pkg) {
  return pkg !== undefined ? ` ${pkg.name}` : '';
}

export function error(message, pkg) {
  console.error(preconstructEmoji + chalk.red('error') + suffix(pkg), message);
}

export function success(message, pkg) {
  console.log(preconstructEmoji + chalk.green('success') + suffix(pkg), message);
}

export function info(message, pkg) {
  console.log(preconstructEmoji + chalk.cyan('info') + suffix(pkg), message);
}
