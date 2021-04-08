// most of these utilities come from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
import path from 'path';
import { format } from 'util';
import stripAnsi from 'strip-ansi';
import * as fs from 'fs-extra';
import fastGlob from 'fast-glob';
// @ts-ignore
import fixturez from 'fixturez';
import outdent from 'outdent';
import { KeystoneConfig } from '@keystone-next/types';
import { parseArgsStringToArgv } from 'string-argv';
import { cli } from '../cli';

export function recordConsole() {
  let oldConsole = { ...console };
  let contents = '';
  const log = (...args: any[]) => {
    contents += '\n' + stripAnsi(format(...args));
  };

  Object.assign(console, { log, error: log, warn: log, info: log });

  return () => {
    Object.assign(console, oldConsole);
    return contents.trim();
  };
}

let f = fixturez(__dirname);

export const js = outdent;
export const ts = outdent;
export const tsx = outdent;
export const graphql = outdent;

export const symlinkKeystoneDeps = Object.fromEntries(
  [
    '@keystone-next/keystone',
    '@keystone-next/admin-ui',
    '@keystone-next/auth',
    '@keystone-next/fields',
  ].map(pkg => [
    `node_modules/${pkg}`,
    { kind: 'symlink' as const, path: path.dirname(require.resolve(`${pkg}/package.json`)) },
  ])
);

type Fixture = {
  [key: string]:
    | string
    | { kind: 'symlink'; path: string }
    | { kind: 'config'; config: KeystoneConfig };
};

// basically replicating https://github.com/nodejs/node/blob/72f9c53c0f5cc03000f9a4eb1cf31f43e1d30b89/lib/fs.js#L1163-L1174
// for some reason the builtin auto-detection doesn't work, the code probably doesn't land go into that logic or something
async function getSymlinkType(targetPath: string): Promise<'dir' | 'file'> {
  const stat = await fs.stat(targetPath);
  return stat.isDirectory() ? 'dir' : 'file';
}

export async function runCommand(cwd: string, args: string) {
  const argv = parseArgsStringToArgv(args);
  return cli(cwd, argv);
}

export async function testdir(dir: Fixture): Promise<string> {
  const temp = f.temp();
  await Promise.all(
    Object.keys(dir).map(async filename => {
      const output = dir[filename];
      const fullPath = path.join(temp, filename);
      if (typeof output === 'string') {
        await fs.outputFile(fullPath, dir[filename]);
      } else if (output.kind === 'config') {
        // note this is sync so that it doesn't conflict with any other `kind: 'config'`
        fs.outputFileSync(
          fullPath,
          `Object.defineProperty(exports, '__esModule', { value: true });exports.default = globalThis.keystoneConfig;`
        );
        // @ts-ignore
        globalThis.keystoneConfig = output.config;
        require(fullPath);
        // @ts-ignore
        delete globalThis.keystoneConfig;
      } else {
        const dir = path.dirname(fullPath);
        await fs.ensureDir(dir);
        const targetPath = path.resolve(temp, output.path);
        const symlinkType = await getSymlinkType(targetPath);
        await fs.symlink(targetPath, fullPath, symlinkType);
      }
    })
  );
  return temp;
}

expect.addSnapshotSerializer({
  print(_val) {
    const val = _val as Record<string, string>;
    const contentsByFilename: Record<string, string[]> = {};
    Object.entries(val).forEach(([filename, contents]) => {
      if (contentsByFilename[contents] === undefined) {
        contentsByFilename[contents] = [];
      }
      contentsByFilename[contents].push(filename);
    });
    return Object.entries(contentsByFilename)
      .map(([contents, filenames]) => {
        return `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ ${filenames.join(', ')} ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n${contents}`;
      })
      .join('\n');
  },
  test(val) {
    return val && val[dirPrintingSymbol];
  },
});

const dirPrintingSymbol = Symbol('dir printing symbol');

async function readNormalizedFile(filePath: string): Promise<string> {
  let content = await fs.readFile(filePath, 'utf8');
  // to normalise windows line endings
  content = content.replace(/\r\n/g, '\n');
  if (/\.map$/.test(filePath)) {
    const sourceMap = JSON.parse(content);
    sourceMap.sourcesContent = sourceMap.sourcesContent.map((source: string) =>
      source.replace(/\r\n/g, '\n')
    );
    content = JSON.stringify(sourceMap);
  }
  return content;
}

export async function getFiles(dir: string, glob: string[] = ['**', '!node_modules/**']) {
  const files = await fastGlob(glob, { cwd: dir });
  const filesObj: Record<string, string> = {
    [dirPrintingSymbol]: true,
  };
  await Promise.all(
    files.map(async filename => {
      filesObj[filename] = await readNormalizedFile(path.join(dir, filename));
    })
  );
  let newObj: Record<string, string> = { [dirPrintingSymbol]: true };
  files.sort().forEach(filename => {
    newObj[filename] = filesObj[filename];
  });
  return newObj;
}
