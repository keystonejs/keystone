const bolt = require('bolt');
const fs = require('fs');

async function getPackagePlugins() {
  const { dir: rootDir } = await bolt.getProject({ cwd: '../' });

  const workspaces = await bolt.getWorkspaces({ cwd: rootDir });

  return [
    ...workspaces
      .map(({ dir, config }) => ({ dir, name: config.name }))
      .filter(({ dir }) => fs.existsSync(dir))
      .map(({ name, dir }) => ({
        resolve: 'gatsby-source-filesystem',
        options: {
          // This `name` will show up as `sourceInstanceName` on a node's "parent"
          // See `gatsby-node.js` for where it's used.
          name,
          path: `${dir}/`,
        },
      })),
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'docs',
        path: `${rootDir}/docs`,
      },
    },
  ];
}

async function getGatsbyConfig() {
  const packageFilesPlugins = await getPackagePlugins();
  return {
    plugins: [
      ...packageFilesPlugins,
      {
        resolve: 'gatsby-source-filesystem',
        options: { name: 'tutorials', path: `${__dirname}/tutorials/` },
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: { name: 'guides', path: `${__dirname}/guides/` },
      },
      `gatsby-plugin-sharp`,
      {
        resolve: `gatsby-mdx`,
        options: {
          extensions: ['.mdx', '.md'],
          gatsbyRemarkPlugins: [
            {
              resolve: 'gatsby-remark-images',
              options: {
                maxWidth: 1035,
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
            { name: 'slug', store: true },
            { name: 'workspace', store: true },
            { name: 'heading', store: true, attributes: { boost: 20 } },
          ],
          // How to resolve each field's value for a supported node type
          resolvers: {
            // For any node of type mdx, list how to resolve the fields' values
            Mdx: {
              content: node => node.rawBody,
              slug: node => node.fields.slug,
              workspace: node => node.fields.workspace,
              heading: node => node.fields.heading,
            },
          },
          //custom index file name, default is search_index.json
          filename: 'search_index.json',
        },
      },
    ],
  };
}

module.exports = getGatsbyConfig();
