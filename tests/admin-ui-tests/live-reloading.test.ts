import path from 'path';
import fs from 'fs/promises';
import { Browser, Page, chromium } from 'playwright';
import { parse, print } from 'graphql';
import { ExecaChildProcess } from 'execa';
import { generalStartKeystone, loadIndex, makeGqlRequest, promiseSignal } from './utils';

const gql = ([content]: TemplateStringsArray) => content;

const testProjectPath = path.join(__dirname, '..', 'test-projects', 'live-reloading');

async function replaceSchema(
  schema: 'changed-prisma-schema' | 'initial' | 'runtime-error' | 'second' | 'syntax-error'
) {
  await fs.writeFile(
    path.join(testProjectPath, 'schemas/index.ts'),
    `export * from './${schema}';\n`
  );
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let exit = async () => {};
let process: ExecaChildProcess = undefined as any;
let page: Page = undefined as any;
let browser: Browser = undefined as any;

test('start keystone', async () => {
  // just in case a previous failing test run messed things up, let's reset it
  await replaceSchema('initial');
  ({ exit, process } = await generalStartKeystone(testProjectPath, 'dev'));
  browser = await chromium.launch();
  page = await browser.newPage();

  await loadIndex(page);
});

test('Creating an item with the GraphQL API and navigating to the item page for it', async () => {
  const {
    createSomething: { id },
  } = await makeGqlRequest(gql`
    mutation {
      createSomething(data: { text: "blah" }) {
        id
      }
    }
  `);

  await page.goto(`http://localhost:3000/somethings/${id}`);
  await page.waitForSelector('label:has-text("Text")');

  const element = await page.waitForSelector(
    'label:has-text("Initial Label For Text") >> .. >> input'
  );
  const value = await element.inputValue();
  expect(value).toBe('blah');
});

test('changing the label of a field updates in the Admin UI', async () => {
  await replaceSchema('second');

  const element = await page.waitForSelector(
    'label:has-text("Very Important Text") >> .. >> input'
  );
  const value = await element.inputValue();
  expect(value).toBe('blah');
});

test('adding a virtual field', async () => {
  const element = await page.waitForSelector('label:has-text("Virtual") >> ..');
  const value = await element.textContent();
  expect(value).toBe('Virtualblah');
});

test('the generated schema includes schema updates', async () => {
  // we want to make sure the field that we added worked
  // and the change we made to the have worked
  const schema = await fs.readFile(path.join(testProjectPath, 'schema.graphql'), 'utf8');
  const parsed = parse(schema);
  const objectTypes = parsed.definitions.filter(
    x =>
      x.kind === 'ObjectTypeDefinition' &&
      (x.name.value === 'Query' || x.name.value === 'Something')
  );
  expect(objectTypes.map(x => print(x)).join('\n\n')).toMatchInlineSnapshot(`
        "type Query {
          someNumber: Int!
          somethings(where: SomethingWhereInput! = {}, orderBy: [SomethingOrderByInput!]! = [], take: Int, skip: Int! = 0): [Something!]
          something(where: SomethingWhereUniqueInput!): Something
          somethingsCount(where: SomethingWhereInput! = {}): Int
          keystone: KeystoneMeta!
        }

        type Something {
          id: ID!
          text: String
          virtual: String
        }"
      `);
});

test("a syntax error is shown and doesn't crash the process", async () => {
  await replaceSchema('syntax-error');
  await expectContentInStdio(process, 'error - ../../schemas/syntax-error.js:4:6');
});

test("a runtime error is shown and doesn't crash the process", async () => {
  await replaceSchema('runtime-error');
  await expectContentInStdio(process, 'ReferenceError: doesNotExist is not defined');
});

test('errors can be recovered from', async () => {
  await replaceSchema('initial');

  const element = await page.waitForSelector(
    'label:has-text("Initial Label For Text") >> .. >> input'
  );
  const value = await element.inputValue();
  expect(value).toBe('blah');
});

test('changing the prisma schema crashes the process', async () => {
  await replaceSchema('changed-prisma-schema');
  await expectContentInStdio(process, 'Your prisma schema has changed, please restart Keystone');
  // the promise will reject when it exits with a non-zero exit code which is what we're expecting here
  await process.catch(() => {});
  expect(process.exitCode).toBe(1);
});

afterAll(async () => {
  await Promise.all([replaceSchema('initial'), exit(), browser.close()]);
});

async function expectContentInStdio(process: ExecaChildProcess, content: string) {
  let promise = promiseSignal();
  const listener = (chunk: any) => {
    const stringified: string = chunk.toString('utf8');
    if (stringified.includes(content)) {
      console.log('found content');
      promise.resolve();
    } else {
      console.log('did not find content, found:', stringified);
    }
  };
  process.stdout!.on('data', listener);
  process.stderr!.on('data', listener);
  try {
    await Promise.race([
      promise,
      wait(10000).then(() => {
        throw new Error(`timed out when waiting for ${content}`);
      }),
    ]);
  } finally {
    process.stdout!.off('data', listener);
    process.stderr!.off('data', listener);
  }
}
