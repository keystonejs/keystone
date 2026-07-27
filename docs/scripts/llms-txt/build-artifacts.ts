// Pure builders for the llms.txt artifacts (https://llmstxt.org). No filesystem
// access, so they can be unit tested with in-memory fixtures — generate.ts wires
// them to disk I/O.
import { load } from 'js-yaml'

const SITE_URL = 'https://keystonejs.com'

// Index header — the project identity. Sourced from the site metadata in
// app/(site)/layout.tsx (defaultTitle / defaultDescription).
const SITE_NAME = 'Keystone'
const SITE_SUMMARY =
  'The superpowered Node.js Headless CMS for developers. Build faster and scale further with the programmable open source GraphQL API back-end for structured content projects.'

export const frontMatterPattern = /^---[\s]+([\s\S]*?)[\s]+---/

export type Doc = {
  slug: string
  title: string
  description: string
  /** Full on-disk file: frontmatter + body. */
  markdown: string
  /** Body only, without frontmatter. */
  body: string
}

export type NavItem = {
  label?: string
  link: { discriminant: 'page' | 'url'; value: string }
  status?: string
}
export type NavGroup = { groupName: string; items: NavItem[] }

export function extractFrontmatter(file: string, raw: string) {
  const match = frontMatterPattern.exec(raw)
  if (!match) throw new Error(`${file}: expected frontmatter with a title and description`)
  const parsed = load(match[1]) as Record<string, unknown> | null
  if (!parsed || typeof parsed !== 'object')
    throw new Error(`${file}: frontmatter is not an object`)
  const { title, description } = parsed
  if (typeof title !== 'string') throw new Error(`${file}: frontmatter is missing a string title`)
  if (typeof description !== 'string')
    throw new Error(`${file}: frontmatter is missing a string description`)
  return { title, description }
}

/** Resolve a nav item to a docs slug, if it points at a real docs page. */
export function slugForNavItem(item: NavItem, docs: Map<string, Doc>): string | null {
  if (item.link.discriminant === 'page') {
    return docs.has(item.link.value) ? item.link.value : null
  }
  // A `url` item may still point at a docs page, e.g. /docs/config/config
  if (item.link.value.startsWith('/docs/')) {
    const slug = item.link.value.slice('/docs/'.length)
    return docs.has(slug) ? slug : null
  }
  return null
}

function docLine(doc: Doc): string {
  return `- [${doc.title}](${SITE_URL}/docs/${doc.slug}.md): ${doc.description}`
}

export function buildIndex(docs: Map<string, Doc>, nav: NavGroup[]): string {
  const covered = new Set<string>()
  const sections: string[] = []

  for (const group of nav) {
    const lines: string[] = []
    for (const item of group.items) {
      const slug = slugForNavItem(item, docs)
      if (slug) {
        covered.add(slug)
        lines.push(docLine(docs.get(slug)!))
        continue
      }
      if (item.link.discriminant === 'page') {
        // A `page` reference whose value is a bare slug that no longer maps to a
        // docs file (e.g. a stale Keystatic ref). Skip it rather than emit a
        // broken link — the fallback below assumes a URL path, which a page
        // slug is not.
        console.warn(
          `llms.txt: nav item "${item.label ?? item.link.value}" points at missing page "${item.link.value}"; skipping`
        )
        continue
      }
      // A `url` item that isn't a docs page: an app route (/docs/examples) or an
      // external link. Link to it directly; it has no markdown counterpart.
      const { value } = item.link
      const url = value.startsWith('http') ? value : `${SITE_URL}${value}`
      lines.push(`- [${item.label ?? value}](${url})`)
    }
    if (lines.length) sections.push(`## ${group.groupName}\n${lines.join('\n')}`)
  }

  // Any docs page not surfaced by the nav still gets listed so the index covers
  // the whole corpus rather than silently dropping pages.
  const orphans = [...docs.values()].filter(doc => !covered.has(doc.slug))
  if (orphans.length) {
    const lines = orphans.map(docLine)
    sections.push(`## Additional pages\n${lines.join('\n')}`)
    console.warn(
      `llms.txt: ${orphans.length} docs not in navigation, listed under "Additional pages": ${orphans
        .map(d => d.slug)
        .join(', ')}`
    )
  }

  return `# ${SITE_NAME}\n\n> ${SITE_SUMMARY}\n\n${sections.join('\n\n')}\n`
}

export function buildFull(docs: Map<string, Doc>, nav: NavGroup[]): string {
  // Nav order first, then any orphan docs, deduped by slug.
  const ordered: Doc[] = []
  const seen = new Set<string>()
  const push = (slug: string) => {
    if (seen.has(slug)) return
    seen.add(slug)
    ordered.push(docs.get(slug)!)
  }
  for (const group of nav) {
    for (const item of group.items) {
      const slug = slugForNavItem(item, docs)
      if (slug) push(slug)
    }
  }
  for (const slug of docs.keys()) push(slug)

  const parts = ordered.map(
    doc => `# ${doc.title}\nSource: ${SITE_URL}/docs/${doc.slug}\n\n${doc.body}`
  )
  return `# ${SITE_NAME} documentation\n\n> ${SITE_SUMMARY}\n\n${parts.join('\n\n---\n\n')}\n`
}
