/* URLs from v4.keystonejs.com */
const KEYSTONE_4 = [
  {
    source: '/docs/configuration',
    destination: 'https://v4.keystonejs.com/docs/configuration',
    permanent: true,
  },
  {
    source: '/docs/database',
    destination: 'https://v4.keystonejs.com/api/field/options',
    permanent: true,
  },
  {
    source: '/documentation/configuration/project-options',
    destination: 'https://v4.keystonejs.com/documentation/configuration/project-options',
    permanent: true,
  },
  {
    source: '/documentation/database',
    destination: 'https://v4.keystonejs.com/documentation/database',
    permanent: true,
  },
  // {
  //   source: '/getting-started',
  //   destination: 'https://v4.keystonejs.com/getting-started',
  //   permanent: true,
  // },
]

/* URLs from v5.keystonejs.com */
const KEYSTONE_5 = [
  {
    source: '/quick-start',
    destination: 'https://v5.keystonejs.com/quick-start/',
    permanent: true,
  },
  {
    source: '/quick-start/adapters',
    destination: 'https://v5.keystonejs.com/quick-start/adapters',
    permanent: true,
  },
  {
    source: '/discussions/:slug*',
    destination: 'https://v5.keystonejs.com/discussions/:slug*',
    permanent: true,
  },
  // Old roadmap URL just redirects to the new roadmap
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
]

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

/* Splitbee Proxy */
const SPLITBEE = [
  {
    source: '/sb.js',
    destination: 'https://cdn.splitbee.io/sb.js',
    permanent: false,
  },
  {
    source: '/_sb/:slug',
    destination: 'https://hive.splitbee.io/:slug',
    permanent: false,
  },
]

/* Current website redirections */
const CURRENT = [
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
    source: '/docs/apis/fields',
    destination: '/docs/config/fields',
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

export default async function redirects () {
  return [
    ...SPLITBEE,
    ...CURRENT,
    ...ORIGINAL_NEXT,
    ...KEYSTONE_5,
    ...KEYSTONE_4
  ]
}
