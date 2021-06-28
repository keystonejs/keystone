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

module.exports = [...ORIGINAL_NEXT, ...KEYSTONE_5];
