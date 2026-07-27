import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { type Doc, type NavGroup, buildFull, buildIndex, slugForNavItem } from './build-artifacts'

function doc(slug: string, title: string, description: string): Doc {
  return { slug, title, description, markdown: `---\n---\n${title} body`, body: `${title} body` }
}

function makeDocs(): Map<string, Doc> {
  // Insertion order matters: it's the tie-breaker for orphans in buildFull.
  return new Map([
    ['getting-started', doc('getting-started', 'Getting started', 'Get going')],
    ['guides/cli', doc('guides/cli', 'Command Line Interface', 'Use the CLI')],
    ['config/config', doc('config/config', 'System Config', 'Configure things')],
  ])
}

const nav: NavGroup[] = [
  {
    groupName: 'Start',
    items: [
      { label: 'Docs Home', link: { discriminant: 'url', value: '/docs' } },
      { label: 'Examples', link: { discriminant: 'url', value: '/docs/examples' } },
    ],
  },
  {
    groupName: 'Guides',
    items: [
      { label: 'Command Line', link: { discriminant: 'page', value: 'guides/cli' } },
      // Stale page reference — no matching doc. Must not emit a broken link.
      { label: 'Gone', link: { discriminant: 'page', value: 'guides/missing' } },
      // A `url` item that resolves to a real docs page.
      { label: 'Config', link: { discriminant: 'url', value: '/docs/config/config' } },
    ],
  },
]

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

test('slugForNavItem resolves page, url-to-doc, and returns null otherwise', () => {
  const docs = makeDocs()
  expect(slugForNavItem({ link: { discriminant: 'page', value: 'guides/cli' } }, docs)).toBe(
    'guides/cli'
  )
  expect(slugForNavItem({ link: { discriminant: 'page', value: 'guides/missing' } }, docs)).toBe(
    null
  )
  expect(
    slugForNavItem({ link: { discriminant: 'url', value: '/docs/config/config' } }, docs)
  ).toBe('config/config')
  expect(slugForNavItem({ link: { discriminant: 'url', value: '/docs/examples' } }, docs)).toBe(
    null
  )
  expect(slugForNavItem({ link: { discriminant: 'url', value: 'https://x.com' } }, docs)).toBe(null)
})

test('buildIndex links docs to .md using the page title and frontmatter description', () => {
  const out = buildIndex(makeDocs(), nav)
  expect(out).toContain(
    '- [Command Line Interface](https://keystonejs.com/docs/guides/cli.md): Use the CLI'
  )
  // A `url` item resolving to a doc is linked to its .md too.
  expect(out).toContain(
    '- [System Config](https://keystonejs.com/docs/config/config.md): Configure things'
  )
})

test('buildIndex links non-doc url items directly, without an .md suffix', () => {
  const out = buildIndex(makeDocs(), nav)
  expect(out).toContain('- [Docs Home](https://keystonejs.com/docs)')
  expect(out).toContain('- [Examples](https://keystonejs.com/docs/examples)')
})

test('buildIndex skips a stale page reference instead of emitting a broken link', () => {
  const out = buildIndex(makeDocs(), nav)
  expect(out).not.toContain('guides/missing')
  // The bug this guards against: a bare page slug concatenated onto the origin.
  expect(out).not.toContain('keystonejs.comguides')
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('guides/missing'))
})

test('buildIndex lists docs missing from the nav under "Additional pages"', () => {
  const out = buildIndex(makeDocs(), nav)
  expect(out).toContain('## Additional pages')
  expect(out).toContain(
    '- [Getting started](https://keystonejs.com/docs/getting-started.md): Get going'
  )
})

test('buildFull emits nav-order first then orphans, deduped, each with a source line', () => {
  const out = buildFull(makeDocs(), nav)
  const cli = out.indexOf('# Command Line Interface')
  const config = out.indexOf('# System Config')
  const orphan = out.indexOf('# Getting started')
  expect(cli).toBeGreaterThan(-1)
  expect(cli).toBeLessThan(config)
  expect(config).toBeLessThan(orphan)
  expect(out).toContain('# Command Line Interface\nSource: https://keystonejs.com/docs/guides/cli')
  // Deduped: config/config appears once despite being reachable via nav and keys.
  expect(out.split('# System Config').length - 1).toBe(1)
})
