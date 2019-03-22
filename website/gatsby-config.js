const bolt = require('bolt');
const fs = require('fs');

async function getPackagePlugins() {
  const { dir: rootDir } = await bolt.getProject({ cwd: '../' });

  const workspaces = await bolt.getWorkspaces({ cwd: rootDir });

  return [
    ...['quick-start', 'tutorials', 'guides', 'discussions'].map(name => ({
      resolve: 'gatsby-source-filesystem',
      options: { name, path: `${rootDir}/docs/${name}/` },
    })),
    ...workspaces
      .filter(({ config }) => !config.private)
      .filter(({ dir }) => fs.existsSync(dir))
      .filter(({ dir }) => !dir.includes('arch'))
      .map(({ dir, config }) => ({
        resolve: 'gatsby-source-filesystem',
        options: {
          // This `name` will show up as `sourceInstanceName` on a node's "parent"
          // See `gatsby-node.js` for where it's used.
          name: config.name,
          path: `${dir}`,
          ignore: [`**/**/CHANGELOG.md`],
        },
      })),
  ];
}

async function getGatsbyConfig() {
  const packageFilesPlugins = await getPackagePlugins();
  return {
    siteMetadata: {
      title: `KeystoneJS`,
      siteUrl: `https://v5.keystonejs.com`,
      description: `A scalable platform and CMS to build Node.js applications.`,
      twitter: `@keystonejs`,
    },
    plugins: [
      ...packageFilesPlugins,
      `gatsby-plugin-sharp`, // image processing
      `gatsby-plugin-react-helmet`,
      {
        resolve: `gatsby-plugin-manifest`,
        options: {
          name: 'KeystoneJS Docs',
          short_name: 'Docs',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
        },
      },
      {
        resolve: `gatsby-mdx`,
        options: {
          extensions: ['.mdx', '.md'],
          globalScope: `import { Props } from '${require.resolve('./src/components/props')}'
          export default { Props }
          `,
          defaultLayouts: {
            default: require.resolve('./src/components/mdx-renderer.js'),
          },
          gatsbyRemarkPlugins: [
            { resolve: require.resolve('./plugins/gatsby-remark-fix-links') },

            {
              resolve: 'gatsby-remark-images',
              options: {
                maxWidth: 848, // TODO: remove magic number -- width of main col
                sizeByPixelDensity: true,
              },
            },
            // This is needed to resolve svgs
            { resolve: 'gatsby-remark-copy-linked-files' },
          ],
        },
      },
      {
        resolve: 'gatsby-plugin-lunr',
        options: {
          languages: [{ name: 'en' }],
          // Fields to index. If store === true value will be stored in index file.
          // Attributes for custom indexing logic. See https://lunrjs.com/docs/lunr.Builder.html for details
          fields: [
            { name: 'content' },
            { name: 'navGroup', store: true },
            { name: 'slug', store: true },
            { name: 'title', store: true, attributes: { boost: 20 } },
          ],
          // How to resolve each field's value for a supported node type
          resolvers: {
            // For any node of type mdx, list how to resolve the fields' values
            Mdx: {
              content: node => node.rawBody,
              navGroup: node => node.fields.navGroup,
              slug: node => node.fields.slug,
              title: node => node.fields.pageTitle,
            },
          },
          //custom index file name, default is search_index.json
          filename: 'search_index.json',
        },
      },
      {
        resolve: `gatsby-plugin-google-analytics`,
        options: {
          trackingId: 'UA-43970386-1',
          head: true,
        },
      },
    ],
  };
}

module.exports = getGatsbyConfig();
