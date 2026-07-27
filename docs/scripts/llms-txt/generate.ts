// Generates the llms.txt family of artifacts (https://llmstxt.org) into public/
// at build time, so agents can discover and fetch the Keystone docs as markdown:
//
//   public/llms.txt            index of the docs, grouped by the sidebar nav
//   public/docs/<slug>.md      each docs page as raw markdown
//   public/llms-full.txt       every docs page concatenated in nav order
//
// Scope is the docs collection only (content/docs/**); blog and examples are
// excluded.
import fs, { glob } from 'node:fs/promises'
import path from 'node:path'
import { load } from 'js-yaml'

// Keep in sync with next-sitemap.config.js
const SITE_URL = 'https://keystonejs.com'
const DOCS_DIR = 'content/docs'
const PUBLIC_DIR = 'public'

// Index header — the project identity. Sourced from the site metadata in
// app/(site)/layout.tsx (defaultTitle / defaultDescription).
const SITE_NAME = 'Keystone'
const SITE_SUMMARY =
  'The superpowered Node.js Headless CMS for developers. Build faster and scale further with the programmable open source GraphQL API back-end for structured content projects.'

const frontMatterPattern = /^---[\s]+([\s\S]*?)[\s]+---/

type Doc = {
  slug: string
  title: string
  description: string
  /** Full on-disk file: frontmatter + body. */
  markdown: string
  /** Body only, without frontmatter. */
  body: string
}

type NavItem = {
  label?: string
  link: { discriminant: 'page' | 'url'; value: string }
  status?: string
}
type NavGroup = { groupName: string; items: NavItem[] }

function extractFrontmatter(file: string, raw: string) {
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

async function loadDocs(): Promise<Map<string, Doc>> {
  const files: string[] = []
  for await (const file of glob(`${DOCS_DIR}/**/*.md`)) files.push(file)
  files.sort()
  const docs = new Map<string, Doc>()
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { title, description } = extractFrontmatter(file, raw)
    const slug = path.relative(DOCS_DIR, file).replace(/\.md$/, '')
    const body = raw.replace(frontMatterPattern, '').trimStart()
    docs.set(slug, { slug, title, description, markdown: raw, body })
  }
  return docs
}

async function loadNav(): Promise<NavGroup[]> {
  const raw = await fs.readFile('content/navigation.yaml', 'utf8')
  const parsed = load(raw) as { navGroups?: NavGroup[] } | null
  return parsed?.navGroups ?? []
}

/** Resolve a nav item to a docs slug, if it points at a real docs page. */
function slugForNavItem(item: NavItem, docs: Map<string, Doc>): string | null {
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

function buildIndex(docs: Map<string, Doc>, nav: NavGroup[]): string {
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
      // Not a docs-collection page (an app route like /docs/examples, or an
      // external URL). Link to it directly; it has no markdown counterpart.
      const { value } = item.link
      const url = value.startsWith('http') ? value : `${SITE_URL}${value}`
      const label = item.label ?? value
      lines.push(`- [${label}](${url})`)
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

function buildFull(docs: Map<string, Doc>, nav: NavGroup[]): string {
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

async function writeFile(relPath: string, contents: string) {
  const target = path.join(PUBLIC_DIR, relPath)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, contents, 'utf8')
}

async function main() {
  const [docs, nav] = await Promise.all([loadDocs(), loadNav()])

  await writeFile('llms.txt', buildIndex(docs, nav))
  await writeFile('llms-full.txt', buildFull(docs, nav))
  await Promise.all([...docs.values()].map(doc => writeFile(`docs/${doc.slug}.md`, doc.markdown)))

  console.log(
    `llms.txt: wrote public/llms.txt, public/llms-full.txt and ${docs.size} per-page files under public/docs/`
  )
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
