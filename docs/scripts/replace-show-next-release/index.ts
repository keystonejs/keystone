import fs from 'fs/promises';
import { ValidateError } from '@markdoc/markdoc';
import { globby } from 'globby';
import { loadAllMarkdoc } from '../../markdoc/load-all';
import { printValidationError } from '../../markdoc';
import { removeNextReleaseConditions } from './markdoc';
import { replaceShowNextRelease } from './typescript';

async function updateTsFiles() {
  const paths = await globby('pages/**/*.{ts,tsx}');

  console.log(`updating ${paths.length} Typescript files`);
  await Promise.all(
    paths.map(async path => {
      const source = await fs.readFile(path, 'utf8');

      if (!source.includes('process.env.SHOW_NEXT_RELEASE')) return;
      if (source.includes('// @skipShowNextReleaseReplacement')) return;

      console.log(`  updating ${path}`);
      await fs.writeFile(path, await replaceShowNextRelease(path, source));
    })
  );
}

async function updateMarkdocFiles() {
  const docs = await loadAllMarkdoc();
  console.log(`updating ${docs.length} Markdoc files`);

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
