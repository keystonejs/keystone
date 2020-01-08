const getWorkspaces = require('get-workspaces').default;
const fs = require('fs');
const path = require('path');

async function getPackagePlugins() {
  const rootDir = path.resolve(__dirname, '..');
  const docSections = fs.readdirSync(`${rootDir}/docs/`).filter(dir => {
    const fullDir = path.join(`${rootDir}/docs/`, dir);
    return fs.existsSync(fullDir) && fs.lstatSync(fullDir).isDirectory();
  });

  const workspaces = await getWorkspaces({ cwd: rootDir });

  return [
    ...docSections.map(name => ({
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
          ignore: [`**/**/CHANGELOG.md`, '**/*.{js,json}'],
        },
      })),
  ];
}

async function getGatsbyConfig() {
  const packageFilesPlugins = await getPackagePlugins();
  return {
    siteMetadata: {
      title: `KeystoneJS`,
      siteUrl: `https://keystonejs.com`,
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
        // https://github.com/gatsbyjs/gatsby/issues/15486#issuecomment-509405867
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [`gatsby-remark-images`],
        },
      },
      {
        resolve: `gatsby-plugin-mdx`,
        options: {
          extensions: ['.mdx', '.md'],
          defaultLayouts: {
            default: require.resolve('./src/components/mdx-renderer.js'),
          },
          gatsbyRemarkPlugins: [
            {
              resolve: 'gatsby-remark-autolink-headers',
              options: {
                icon: false, // we include our own icon
              },
            },
            { resolve: require.resolve('./plugins/gatsby-remark-fix-links') },

            {
              resolve: 'gatsby-remark-images',
              options: {
                maxWidth: 848, // TODO: remove magic number -- width of main col
              },
            },
            // This is needed to resolve svgs
            { resolve: 'gatsby-remark-copy-linked-files' },
          ],
          rehypePlugins: [[require('@mapbox/rehype-prism'), { ignoreMissing: true }]],
        },
      },
      {
        resolve: 'gatsby-plugin-lunr',
        options: {
          languages: [
            {
              name: 'en',
              filterNodes: node => {
                const { context } = node;
                const { fields } = node;
                // I'm not sure why... but we get different types of nodes here
                if (context || fields) {
                  // Only only return false if draft is set to true,
                  // undefined should default to not draft
                  const draft = (context && context.draft) || (fields && fields.draft) || false;
                  return Boolean(!draft);
                }
                return true;
              },
            },
          ],
          // Fields to index. If store === true value will be stored in index file.
          // Attributes for custom indexing logic. See https://lunrjs.com/docs/lunr.Builder.html for details
          fields: [
            { name: 'content' },
            { name: 'navGroup', store: true },
            { name: 'navSubGroup', store: true },
            { name: 'slug', store: true },
            { name: 'title', store: true, attributes: { boost: 20 } },
          ],
          // How to resolve each field's value for a supported node type
          resolvers: {
            // For any node of type mdx, list how to resolve the fields' values
            Mdx: {
              content: node => node.rawBody,
              navGroup: node => node.fields.navGroup,
              navSubGroup: node => node.fields.navSubGroup,
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
          trackingId: 'UA-43970386-3',
          head: true,
        },
      },
    ],
  };
}

module.exports = getGatsbyConfig();
