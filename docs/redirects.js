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
    source: '/docs/getting-started',
    destination: 'https://v4.keystonejs.com/getting-started',
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
  {
    source: '/getting-started',
    destination: 'https://v4.keystonejs.com/getting-started',
    permanent: true,
  },
];

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
    source: '/blog/:slug*',
    destination: 'https://v5.keystonejs.com/blog/:slug*',
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
    destination: '/updates/roadmap',
    permanent: true,
  },
  // Linked to from google results (2021-06-28) and possibly elsewhere?
  {
    source: '/documentation',
    destination: '/docs',
    permanent: false,
  },
];

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
    destination: '/docs/walkthroughs/getting-started-with-create-keystone-app',
    permanent: true,
  },
  { source: '/roadmap', destination: '/updates/roadmap', permanent: true },
  { source: '/whats-new', destination: '/updates/whats-new-in-v6', permanent: true },
];

/* URLs from the current website */
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
];

module.exports = [...CURRENT, ...ORIGINAL_NEXT, ...KEYSTONE_5, ...KEYSTONE_4];
