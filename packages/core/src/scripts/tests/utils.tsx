// most of these utilities come from https://github.com/preconstruct/preconstruct/blob/07a24f73f17980c121382bb00ae1c05355294fe4/packages/cli/test-utils/index.ts
import path from 'path';
import { format } from 'util';
import stripAnsi from 'strip-ansi';
import * as fs from 'fs-extra';
import fastGlob from 'fast-glob';

// @ts-ignore
import fixturez from 'fixturez';
import { parseArgsStringToArgv } from 'string-argv';
import { MigrateEngine } from '@prisma/migrate';
import { uriToCredentials } from '@prisma/internals';
import { KeystoneConfig } from '../../types';
import { cli } from '../cli';
import { mockPrompts } from '../../lib/prompts';

// these tests spawn processes and it's all pretty slow
jest.setTimeout(1000 * 20);

export const cliBinPath = require.resolve('@keystone-6/core/bin/cli.js');

export const basicKeystoneConfig = fs.readFileSync(
  `${__dirname}/fixtures/basic-project/keystone.ts`,
  'utf8'
);

export const schemas = {
  'schema.graphql': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.graphql`, 'utf8'),
  'schema.prisma': fs.readFileSync(`${__dirname}/fixtures/basic-project/schema.prisma`, 'utf8'),
};

export const customPrismaKeystoneConfig = fs.readFileSync(
  `${__dirname}/fixtures/custom-prisma-project/keystone.ts`,
  'utf8'
);

export function recordConsole(promptResponses?: Record<string, string | boolean>) {
  let oldConsole = { ...console };
  let contents = '';
  const log = (...args: any[]) => {
    contents += '\n' + stripAnsi(format(...args));
  };

  Object.assign(console, { log, error: log, warn: log, info: log });

  const debugOutput = () =>
    `\nConsole output:\n${contents.trim()}\n\nPrompts left:\n${JSON.stringify(
      promptResponseEntries
    )}`;

  const promptResponseEntries = Object.entries(promptResponses || {});
  const getPromptAnswer = (message: string) => {
    message = stripAnsi(message);
    const response = promptResponseEntries.shift()!;
    if (!response) {
      throw new Error(
        `The prompt question "${message}" was asked but there are no responses left${debugOutput()}`
      );
    }
    const [expectedMessage, answer] = response;
    if (expectedMessage !== message) {
      throw new Error(
        `The expected prompt question was "${expectedMessage}" but the actual question was "${message}"${debugOutput()}`
      );
    }
    contents += `\nPrompt: ${message} ${answer}`;

    return answer;
  };
  mockPrompts({
    confirm: async message => {
      const answer = getPromptAnswer(message);
      if (typeof answer === 'string') {
        throw new Error(
          `The answer to "${message}" is a string but the question is a confirm prompt that should return a boolean${debugOutput()}`
        );
      }

      return answer;
    },
    text: async message => {
      const answer = getPromptAnswer(message);
      if (typeof answer === 'boolean') {
        throw new Error(
          `The answer to "${message}" is a boolean but the question is a text prompt that should return a string${debugOutput()}`
        );
      }

      return answer;
    },
    shouldPrompt: promptResponses !== undefined,
  });

  return () => {
    if (promptResponseEntries.length) {
      throw new Error(
        `Some prompt responses were left when the recording was ended.${debugOutput()}`
      );
    }
    Object.assign(console, oldConsole);
    return contents.trim();
  };
}

let f = fixturez(__dirname);

export const symlinkKeystoneDeps = Object.fromEntries(
  [
    '@keystone-6/core',
    '@keystone-6/auth',
    '@prisma/engines',
    '@prisma/client',
    'typescript',
    '@types/react',
    '@types/node',
    'next',
    'react',
    'react-dom',
  ].map(pkg => [
    `node_modules/${pkg}`,
    { kind: 'symlink' as const, path: path.dirname(require.resolve(`${pkg}/package.json`)) },
  ])
);

type Fixture = {
  [key: string]:
    | string
    | Buffer
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
  const proc = await cli(cwd, argv);
  if (typeof proc === 'function') {
    await proc();
  }
}

let dirsToRemove: string[] = [];

afterAll(async () => {
  await Promise.all(
    dirsToRemove.map(filepath => {
      return fs.remove(filepath);
    })
  );
  dirsToRemove = [];
});

export async function testdir(dir: Fixture): Promise<string> {
  const temp = f.temp();
  dirsToRemove.push(temp);
  await Promise.all(
    Object.keys(dir).map(async filename => {
      const output = dir[filename];
      const fullPath = path.join(temp, filename);
      if (typeof output === 'string' || Buffer.isBuffer(output)) {
        await fs.outputFile(fullPath, output);
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

export async function getFiles(
  dir: string,
  glob: string[] = ['**', '!node_modules/**'],
  encoding: 'utf8' | null = 'utf8'
) {
  const files = await fastGlob(glob, { cwd: dir });
  const filesObj: Record<string, string | Buffer> = {
    [dirPrintingSymbol]: true,
  };
  await Promise.all(
    files.map(async filename => {
      const filepath = path.join(dir, filename);
      filesObj[filename] = await (encoding === null
        ? fs.readFile(filepath)
        : fs.readFile(filepath, encoding));
    })
  );
  let newObj: Record<string, string | Buffer> = { [dirPrintingSymbol]: true };
  files.sort().forEach(filename => {
    newObj[filename] = filesObj[filename];
  });
  return newObj;
}

export async function introspectDb(cwd: string, url: string) {
  const engine = new MigrateEngine({ projectDir: cwd });
  try {
    const { datamodel } = await engine.introspect({
      schema: `datasource db {
  url = ${JSON.stringify(url)}
  provider = ${JSON.stringify(uriToCredentials(url).type)}
}`,
    });
    return datamodel;
  } finally {
    engine.stop();
  }
}
