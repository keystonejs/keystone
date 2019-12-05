import inquirer from 'inquirer';
import pLimit from 'p-limit';
import DataLoader from 'dataloader';
import chalk from 'chalk';

export let limit = pLimit(1);

// there might be a simpler solution to this than using dataloader but it works so ¯\_(ツ)_/¯

let prefix = `🎁 ${chalk.green('?')}`;

export function createPromptConfirmLoader(message) {
  let loader = new DataLoader(pkgs =>
    limit(
      () =>
        (async () => {
          if (pkgs.length === 1) {
            let { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message,
                prefix: prefix + ' ' + pkgs[0].name,
              },
            ]);
            return [confirm];
          }
          let { answers } = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'answers',
              message,
              choices: pkgs.map(pkg => ({
                name: pkg.name,
                checked: true,
              })),
              prefix,
            },
          ]);
          return pkgs.map(pkg => {
            return answers.includes(pkg.name);
          });
        })(),
      { cache: false }
    )
  );

  return pkg => loader.load(pkg);
}

let doPromptInput = async (message, pkg, defaultAnswer) => {
  let { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message,
      prefix: prefix + ' ' + pkg.name,
      default: defaultAnswer,
    },
  ]);
  return input;
};

export let promptInput = (message, pkg, defaultAnswer) =>
  limit(() => doPromptInput(message, pkg, defaultAnswer));
