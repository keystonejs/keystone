import { afterEach, expect, test } from 'vitest'
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import esbuild from 'esbuild'
import { getEsbuildConfig } from '../../packages/core/src/scripts/esbuild.ts'

const directories: string[] = []
afterEach(async () => {
  await Promise.all(directories.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true })))
})

async function fixture(type: 'module' | 'commonjs' = 'module') {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'keystone-esm-interop-'))
  directories.push(cwd)
  const files = {
    'package.json': JSON.stringify({ type }),
    'node_modules/dependency/package.json': JSON.stringify({ type: 'module' }),
    'node_modules/dependency/esm.js': `let value = 1;
export { value as default };
export const __esModule = false;
export function change() { value++; }`,
    'node_modules/dependency/cjs.cjs': `exports.__esModule = true;
exports.default = 'inner default';
exports.named = 'named';`,
    'node_modules/dependency/namespace.cjs': `module.exports = require('./esm.js');`,
    'node_modules/dependency/default.mjs': `export { default } from './cjs.cjs';`,
    'node_modules/dependency/named.mjs': `export const named = 7;`,
    'node_modules/dependency/false-positive.mjs': `export const defaultValue = 'default';`,
    'node_modules/dependency/star.mjs': `export * from './esm.js'; // default is not re-exported`,
    'node_modules/conditional/package.json': JSON.stringify({
      type: 'module',
      exports: { import: './esm.js', require: './cjs.cjs' },
    }),
    'node_modules/conditional/esm.js': 'export default "import branch";',
    'node_modules/conditional/cjs.cjs': 'module.exports = "require branch";',
    'node_modules/import-only/package.json': JSON.stringify({
      type: 'module',
      exports: { import: './esm.js' },
    }),
    'node_modules/import-only/esm.js': 'export default "import only";',
    'node_modules/untyped/index.js': 'exports.__esModule = true; exports.default = "untyped";',
  }
  await Promise.all(
    Object.entries(files).map(async ([name, contents]) => {
      const filename = path.join(cwd, name)
      await fs.mkdir(path.dirname(filename), { recursive: true })
      await fs.writeFile(filename, contents)
    })
  )
  return cwd
}

const source = `import esm, * as namespace from 'dependency/esm.js';
import cjs from 'dependency/cjs.cjs';
import cjsNamespace from 'dependency/namespace.cjs';
import defaultFacade from 'dependency/default.mjs';
import * as namedOnly from 'dependency/named.mjs';
import * as falsePositive from 'dependency/false-positive.mjs';
import * as star from 'dependency/star.mjs';
import conditional from 'conditional';
import importOnly from 'import-only';
import untyped from 'untyped/index.js';
export { change } from 'dependency/esm.js';
export function read() {
  return [esm, namespace.default, namespace.__esModule, cjs, cjsNamespace,
    defaultFacade, namedOnly.named, Object.keys(namespace).sort(), conditional, untyped,
    'default' in namedOnly, 'default' in falsePositive, 'default' in star, importOnly];
}`

test.each([false, true])('snapshots external ESM defaults (minify: %s)', async minify => {
  const cwd = await fixture()
  await fs.writeFile(path.join(cwd, 'keystone.ts'), source)
  await fs.writeFile(path.join(cwd, 'native.mjs'), source)
  await esbuild.build({ ...(await getEsbuildConfig(cwd)), minify })
  const output = await fs.readFile(path.join(cwd, '.keystone/config.js'), 'utf8')
  expect(output).toContain('require("dependency/esm.js")')
  expect(output).toContain('require("../node_modules/import-only/esm.js")')
  expect(output).not.toContain('keystone-esm-proxy:/')
  await promisify(execFile)(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import assert from 'node:assert/strict';
import * as native from './native.mjs';
import { createRequire } from 'node:module';
const bundled = createRequire(import.meta.url)('./.keystone/config.js');
assert.deepStrictEqual(bundled.read(), native.read());
assert.equal(bundled.read()[0], 1);
assert.equal(bundled.read()[3].default, 'inner default');
native.change();
assert.equal(native.read()[0], 2);
assert.equal(bundled.read()[0], 1);`,
    ],
    { cwd }
  )
})

test('uses a relative path when a bundled workspace resolves a different dependency copy', async () => {
  const cwd = await fixture()
  const nested = path.join(cwd, 'workspace/node_modules/dependency')
  await fs.mkdir(nested, { recursive: true })
  await fs.writeFile(path.join(nested, 'package.json'), JSON.stringify({ type: 'module' }))
  await fs.writeFile(path.join(nested, 'esm.js'), 'export default 2;')
  await fs.writeFile(
    path.join(cwd, 'workspace/index.js'),
    `export { default } from 'dependency/esm.js';`
  )
  await fs.writeFile(
    path.join(cwd, 'keystone.ts'),
    `import root from 'dependency/esm.js';
import nested from './workspace/index.js';
export default [root, nested];`
  )
  await esbuild.build(await getEsbuildConfig(cwd))
  const output = await fs.readFile(path.join(cwd, '.keystone/config.js'), 'utf8')
  expect(output).toContain('require("dependency/esm.js")')
  expect(output).toContain('require("../workspace/node_modules/dependency/esm.js")')
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ['-e', `console.log(JSON.stringify(require('./.keystone/config.js').default))`],
    { cwd }
  )
  expect(JSON.parse(stdout)).toEqual([1, 2])
})

test('retains Babel-style default imports outside Node ESM mode', async () => {
  const cwd = await fixture('commonjs')
  await fs.writeFile(
    path.join(cwd, 'keystone.ts'),
    `import value from 'dependency/cjs.cjs'; export default value;
export { default as conditional } from 'conditional';`
  )
  await esbuild.build(await getEsbuildConfig(cwd))
  expect(await fs.readFile(path.join(cwd, '.keystone/config.js'), 'utf8')).toContain(
    'require("conditional")'
  )
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      '-e',
      `const config = require('./.keystone/config.js'); console.log(config.default, config.conditional)`,
    ],
    { cwd }
  )
  expect(stdout.trim()).toBe('inner default require branch')
})

test('works across config rebuilds', async () => {
  const cwd = await fixture()
  await fs.writeFile(path.join(cwd, 'keystone.ts'), source)
  const context = await esbuild.context(await getEsbuildConfig(cwd))
  try {
    await context.rebuild()
    await fs.writeFile(path.join(cwd, 'keystone.ts'), source + '\nexport const changed = true;')
    await context.rebuild()
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        '-e',
        `const config = require('./.keystone/config.js'); console.log(config.changed, config.read()[0])`,
      ],
      { cwd }
    )
    expect(stdout.trim()).toBe('true 1')
  } finally {
    await context.dispose()
  }
})
