// Generates the llms.txt family of artifacts (https://llmstxt.org) into public/
// at build time, so agents can discover and fetch the Keystone docs as markdown:
//
//   public/llms.txt            index of the docs, grouped by the sidebar nav
//   public/docs/<slug>.md      each docs page as raw markdown
//   public/llms-full.txt       every docs page concatenated in nav order
//
// Scope is the docs collection only (content/docs/**); blog and examples are
// excluded. The pure formatting logic lives in build-artifacts.ts.
import fs, { glob } from 'node:fs/promises'
import path from 'node:path'
import { load } from 'js-yaml'
import {
  type Doc,
  type NavGroup,
  buildFull,
  buildIndex,
  extractFrontmatter,
  frontMatterPattern,
} from './build-artifacts'

const DOCS_DIR = 'content/docs'
const PUBLIC_DIR = 'public'

async function loadDocs(): Promise<Map<string, Doc>> {
  const files: string[] = []
  for await (const file of glob(`${DOCS_DIR}/**/*.md`)) files.push(file)
  files.sort()
  const docs = new Map<string, Doc>()
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { title, description } = extractFrontmatter(file, raw)
    // Normalise to forward slashes so slugs/URLs are stable across platforms.
    const slug = path.relative(DOCS_DIR, file).split(path.sep).join('/').replace(/\.md$/, '')
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
