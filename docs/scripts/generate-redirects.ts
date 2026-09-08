import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type Redirect = {
  source: string
  destination: string
  permanent: boolean
}

/* URLs from the original next.keystonejs.com website */
const ORIGINAL_NEXT = [
  {
    source: '/faqs',
    destination: '/',
    permanent: true,
  },
  { source: '/apis/:path*', destination: '/docs/apis/:path*', permanent: true },
  { source: '/examples', destination: '/docs/examples', permanent: true },
  {
    source: '/guides/_doc-field-intro',
    destination: '/docs/guides/document-fields',
    permanent: true,
  },
  {
    source: '/docs/guides/_doc-field-intro',
    destination: '/docs/guides/document-fields',
    permanent: true,
  },
  { source: '/guides/:path*', destination: '/docs/guides/:path*', permanent: true },
  {
    source: '/tutorials/embedded-mode-with-sqlite-nextjs',
    destination: '/docs/walkthroughs/embedded-mode-with-sqlite-nextjs',
    permanent: true,
  },
  {
    source: '/tutorials/getting-started-with-create-keystone-app',
    destination: '/docs/getting-started',
    permanent: true,
  },
  {
    source: '/releases',
    destination: 'https://github.com/keystonejs/keystone/releases',
    permanent: true,
  },
  { source: '/updates', destination: '/blog', permanent: true },
  { source: '/updates/roadmap', destination: '/roadmap', permanent: true },
  { source: '/whats-new', destination: '/updates/whats-new-in-v6', permanent: true },
]

/* Current website redirections */
const CURRENT = [
  {
    source: '/guides/road-map',
    destination: '/roadmap',
    permanent: true,
  },
  // Linked to from google results (2021-06-28) and possibly elsewhere?
  {
    source: '/documentation',
    destination: '/docs',
    permanent: false,
  },
  {
    source: '/docs/guides/keystone-5-vs-keystone-next',
    destination: '/updates/keystone-5-vs-keystone-6-preview',
    permanent: true,
  },
  {
    source: '/docs/guides/keystone-5-vs-keystone-6-preview',
    destination: '/updates/keystone-5-vs-keystone-6-preview',
    permanent: true,
  },
  {
    // create-keystone-app has hidden characters in it's console output when it
    // links to this page (when a console does not support hyperlinks), adding
    // this condition in case someone copies them accidentally
    source: '/docs/guides/keystone-5-vs-keystone-next%E2%80%8B',
    destination: '/docs/guides/keystone-5-vs-keystone-next',
    permanent: true,
  },
  {
    source: '/docs/walkthroughs/getting-started-with-create-keystone-app',
    destination: '/docs/getting-started',
    permanent: true,
  },
  {
    source: '/docs/apis',
    destination: '/docs/config/overview',
    permanent: false,
  },
  {
    source: '/docs/apis/config',
    destination: '/docs/config/config',
    permanent: false,
  },
  {
    source: '/docs/apis/schema',
    destination: '/docs/config/lists',
    permanent: false,
  },
  {
    source: '/docs/apis/auth',
    destination: '/docs/config/auth',
    permanent: false,
  },
  {
    source: '/docs/apis/access-control',
    destination: '/docs/config/access-control',
    permanent: false,
  },
  {
    source: '/docs/apis/hooks',
    destination: '/docs/config/hooks',
    permanent: false,
  },
  {
    source: '/docs/apis/session',
    destination: '/docs/config/session',
    permanent: false,
  },
  {
    source: '/docs/apis/context',
    destination: '/docs/context/overview',
    permanent: false,
  },
  {
    source: '/docs/apis/query',
    destination: '/docs/context/query',
    permanent: false,
  },
  {
    source: '/docs/apis/db-items',
    destination: '/docs/context/db-items',
    permanent: false,
  },

  {
    source: '/docs/apis/graphql',
    destination: '/docs/graphql/overview',
    permanent: false,
  },
  {
    source: '/docs/apis/filters',
    destination: '/docs/graphql/filters',
    permanent: false,
  },
  {
    source: '/docs/apis/fields',
    destination: '/docs/fields/overview',
    permanent: false,
  },
  {
    source: '/docs/guides',
    destination: '/docs/guides/overview',
    permanent: false,
  },
  {
    source: '/docs/fields',
    destination: '/docs/fields/overview',
    permanent: false,
  },
  {
    source: '/docs/config',
    destination: '/docs/config/overview',
    permanent: false,
  },
  {
    source: '/docs/context',
    destination: '/docs/context/overview',
    permanent: false,
  },
  {
    source: '/docs/graphql',
    destination: '/docs/graphql/overview',
    permanent: false,
  },
  {
    source: '/enterprise',
    destination: 'https://www.thinkmill.com.au/services/keystone',
    permanent: true,
  },
  /* Telemetry - used to shorten the URL for CLI message */
  {
    source: '/telemetry',
    destination: '/docs/reference/telemetry',
    permanent: true,
  },
  /* Move updates to blog posts */
  {
    source: '/updates/general-availability',
    destination: '/blog/general-availability',
    permanent: true,
  },
  {
    source: '/updates/new-access-control',
    destination: '/blog/new-access-control',
    permanent: true,
  },
  {
    source: '/updates/new-graphql-api',
    destination: '/blog/new-graphql-api',
    permanent: true,
  },
  {
    source: '/updates/prisma-day-2021',
    destination: '/blog/prisma-day-2021',
    permanent: true,
  },
  {
    source: '/releases/2021-07-29',
    destination: 'https://github.com/keystonejs/keystone/releases/tag/2021-07-29',
    permanent: false,
  },
  {
    source: '/releases/2021-11-02',
    destination: 'https://github.com/keystonejs/keystone/releases/tag/2021-11-02',
    permanent: false,
  },
  {
    source: '/docs/walkthroughs/embedded-mode-with-sqlite-nextjs',
    destination: '/blog/embedded-mode-with-sqlite-nextjs',
    permanent: true,
  },
]

const STATIC_REDIRECTS: Redirect[] = [...CURRENT, ...ORIGINAL_NEXT]

const wildcard = /:([A-Za-z][A-Za-z0-9_]*)\*$/

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function redirectDocument(destination: string) {
  const escapedDestination = escapeHtml(destination)
  const scriptDestination = JSON.stringify(destination).replaceAll('<', '\\u003c')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${escapedDestination}">
    <link rel="canonical" href="${escapedDestination}">
    <title>Redirecting…</title>
    <script>location.replace(${scriptDestination} + location.search + location.hash)</script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapedDestination}">${escapedDestination}</a>.</p>
  </body>
</html>
`
}

function wildcardParts(path: string) {
  const match = wildcard.exec(path)
  if (!match) return undefined
  return { name: match[1], prefix: path.slice(0, match.index) }
}

export function expandRedirects(redirects: Redirect[], siteRoutes: string[]) {
  const expanded: Redirect[] = []
  const unsupported: Redirect[] = []

  for (const redirect of redirects) {
    const sourceWildcard = wildcardParts(redirect.source)
    if (!sourceWildcard) {
      expanded.push(redirect)
      continue
    }

    const destinationWildcard = wildcardParts(redirect.destination)
    if (
      !destinationWildcard ||
      destinationWildcard.name !== sourceWildcard.name ||
      !redirect.destination.startsWith('/')
    ) {
      unsupported.push(redirect)
      continue
    }

    const destinationBase = destinationWildcard.prefix.slice(0, -1)
    for (const route of [destinationBase, ...siteRoutes]) {
      const suffix =
        route === destinationBase
          ? ''
          : route.startsWith(destinationWildcard.prefix)
            ? route.slice(destinationWildcard.prefix.length)
            : undefined
      if (suffix === undefined) continue
      expanded.push({
        ...redirect,
        source: suffix ? sourceWildcard.prefix + suffix : sourceWildcard.prefix.slice(0, -1),
        destination: route,
      })
    }
  }

  // Earlier entries win in Next's redirect table. Preserve that behaviour if a
  // duplicate is accidentally introduced.
  const unique = new Map<string, Redirect>()
  for (const redirect of expanded) {
    if (!unique.has(redirect.source)) unique.set(redirect.source, redirect)
  }

  return { redirects: [...unique.values()], unsupported }
}

async function markdownRoutes(directory: string, routePrefix: string) {
  const routes: string[] = []

  async function visit(currentDirectory: string) {
    for (const entry of await readdir(currentDirectory, { withFileTypes: true })) {
      const path = join(currentDirectory, entry.name)
      if (entry.isDirectory()) {
        await visit(path)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const slug = relative(directory, path).split(sep).join('/').slice(0, -3)
        routes.push(`${routePrefix}/${slug}`)
      }
    }
  }

  await visit(directory)
  return routes
}

function outputPath(outputDirectory: string, source: string) {
  const decodedSource = decodeURIComponent(source)
  if (!decodedSource.startsWith('/') || decodedSource.includes('\0')) {
    throw new Error(`Invalid redirect source: ${source}`)
  }

  const path = resolve(outputDirectory, `.${decodedSource}`, 'index.html')
  const outputRoot = resolve(outputDirectory) + sep
  if (!path.startsWith(outputRoot))
    throw new Error(`Redirect source escapes output directory: ${source}`)
  return path
}

export async function generateRedirects(
  outputDirectory: string,
  redirects: Redirect[],
  siteRoutes: string[]
) {
  const result = expandRedirects(redirects, siteRoutes)
  const outputs = result.redirects.map(redirect => ({
    path: outputPath(outputDirectory, redirect.source),
    redirect,
  }))
  const uniquePaths = new Set(outputs.map(output => output.path))

  if (uniquePaths.size !== outputs.length) {
    throw new Error('Multiple redirects resolve to the same output file')
  }

  const existingPaths: string[] = []
  for (const output of outputs) {
    try {
      await access(output.path)
      existingPaths.push(output.path)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }

  if (existingPaths.length) {
    throw new Error(`Refusing to overwrite existing files:\n${existingPaths.join('\n')}`)
  }

  for (const output of outputs) {
    await mkdir(dirname(output.path), { recursive: true })
    await writeFile(output.path, redirectDocument(output.redirect.destination), { flag: 'wx' })
  }

  return result
}

async function main() {
  const outputArgument = process.argv[2] ?? 'out'
  const docsDirectory = new URL('../', import.meta.url)
  const contentDirectory = fileURLToPath(new URL('content/docs/', docsDirectory))
  const outputDirectory = fileURLToPath(new URL(outputArgument, docsDirectory))

  const siteRoutes = await markdownRoutes(contentDirectory, '/docs')
  const result = await generateRedirects(outputDirectory, STATIC_REDIRECTS, siteRoutes)

  console.log(`redirects: wrote ${result.redirects.length} HTML files to ${outputDirectory}`)
  for (const redirect of result.unsupported) {
    console.warn(
      `redirects: could not enumerate ${redirect.source} -> ${redirect.destination}; it needs an explicit route list or a 404-page fallback`
    )
  }
}

if (import.meta.main) {
  await main()
}
