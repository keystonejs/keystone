import fs from 'fs/promises';
import { ValidateError } from '@markdoc/markdoc';
import globby from 'globby';
import { loadAllMarkdoc } from '../../markdoc/load-all';
import { printValidationError } from '../../markdoc';
import { removeNextReleaseConditions } from './markdoc';
import { replaceShowNextRelease } from './typescript';

async function updateTsFiles() {
  const files = await globby('**/*.{ts,tsx}');
  await Promise.all(
    files.map(async file => {
      const source = await fs.readFile(file, 'utf8');
      if (
        !source.includes('process.env.SHOW_NEXT_RELEASE') ||
        source.includes('// @skipShowNextReleaseReplacement')
      ) {
        return;
      }
      const newSource = await replaceShowNextRelease(file, source);
      await fs.writeFile(file, newSource);
    })
  );
}

async function updateMarkdocFiles() {
  const docs = await loadAllMarkdoc();
  const allErrors: ValidateError[] = [];
  await Promise.all(
    docs.map(({ file, contents: initialContents }) => {
      const { contents, errors } = removeNextReleaseConditions(initialContents);
      allErrors.push(...errors);
      return fs.writeFile(file, contents, 'utf8');
    })
  );
  if (allErrors.length) {
    console.error('Errors occurred when validating docs after writing');
    console.error("The errors likely say `Undefined variable: 'nextRelease'`");
    console.error(
      'That error means that the nextRelease variable is still used after the transform that should remove it'
    );
    for (const error of allErrors) {
      console.error(printValidationError(error));
    }
    process.exitCode = 1;
  }
}

(async () => {
  await Promise.all([updateTsFiles(), updateMarkdocFiles()]);
})();
