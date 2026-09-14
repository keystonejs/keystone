import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { expandRedirects, generateRedirects, redirectDocument } from './generate-redirects.ts'

test('expands local wildcard redirects from known site routes', () => {
  const result = expandRedirects(
    [{ source: '/guides/:path*', destination: '/docs/guides/:path*', permanent: true }],
    ['/docs/guides/auth', '/docs/fields/text']
  )

  assert.deepEqual(result, {
    redirects: [
      { source: '/guides', destination: '/docs/guides', permanent: true },
      { source: '/guides/auth', destination: '/docs/guides/auth', permanent: true },
    ],
    unsupported: [],
  })
})

test('reports external wildcard redirects that cannot be enumerated locally', () => {
  const redirect = {
    source: '/discussions/:slug*',
    destination: 'https://example.com/discussions/:slug*',
    permanent: true,
  }
  assert.deepEqual(expandRedirects([redirect], []).unsupported, [redirect])
})

test('keeps the first redirect when sources are duplicated', () => {
  const result = expandRedirects(
    [
      { source: '/old', destination: '/first', permanent: false },
      { source: '/old', destination: '/second', permanent: false },
    ],
    []
  )
  assert.equal(result.redirects[0]?.destination, '/first')
})

test('writes an HTML redirect page', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'keystone-redirects-'))
  t.after(() => rm(directory, { recursive: true, force: true }))

  await generateRedirects(
    directory,
    [{ source: '/old/path', destination: '/new?literal=1&two=2', permanent: true }],
    []
  )
  const html = await readFile(join(directory, 'old/path/index.html'), 'utf8')

  assert.equal(html, redirectDocument('/new?literal=1&two=2'))
  assert.match(html, /href="\/new\?literal=1&amp;two=2"/)
})

test('does not overwrite files or partially generate redirects', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'keystone-redirects-'))
  t.after(() => rm(directory, { recursive: true, force: true }))

  const existingPath = join(directory, 'existing/index.html')
  await mkdir(join(directory, 'existing'), { recursive: true })
  await writeFile(existingPath, 'existing content')

  await assert.rejects(
    generateRedirects(
      directory,
      [
        { source: '/new', destination: '/destination', permanent: true },
        { source: '/existing', destination: '/destination', permanent: true },
      ],
      []
    ),
    /Refusing to overwrite existing files/
  )

  assert.equal(await readFile(existingPath, 'utf8'), 'existing content')
  await assert.rejects(readFile(join(directory, 'new/index.html')), { code: 'ENOENT' })
})
