// @flow
import chalk from 'chalk';
import type { ItemUnion } from './types';

let preconstructEmoji = '🎁 ';

function suffix(pkg?: ItemUnion) {
  return pkg !== undefined ? ` ${pkg.name}` : '';
}

export function error(message: string, pkg?: ItemUnion) {
  console.error(preconstructEmoji + chalk.red('error') + suffix(pkg), message);
}

export function success(message: string, pkg?: ItemUnion) {
  console.log(preconstructEmoji + chalk.green('success') + suffix(pkg), message);
}

export function info(message: string, pkg?: ItemUnion) {
  console.log(preconstructEmoji + chalk.cyan('info') + suffix(pkg), message);
}
