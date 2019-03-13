const bolt = require('bolt');
const fs = require('fs');
const mdx = require('@mdx-js/mdx');
const compiler = mdx.createMdxAstCompiler({ mdPlugins: [] });
const prune = require('underscore.string/prune');
const visit = require('unist-util-visit');

async function getPackagePlugins() {
  const { dir: rootDir } = await bolt.getProject({ cwd: '../' });

  const workspaces = await bolt.getWorkspaces({ cwd: rootDir });

  return [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'quick-start',
        path: `${rootDir}/docs/quick-start/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'tutorials',
        path: `${rootDir}/docs/tutorials/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'guides',
        path: `${rootDir}/docs/guides`,
      },
    },
    ...workspaces
      .map(({ dir, config }) => ({ dir, name: config.name }))
      .filter(({ dir }) => fs.existsSync(dir))
      .filter(({ dir }) => !dir.includes('website') && !dir.includes('arch'))
      .map(({ name, dir }) => ({
        resolve: 'gatsby-source-filesystem',
        options: {
          // This `name` will show up as `sourceInstanceName` on a node's "parent"
          // See `gatsby-node.js` for where it's used.
          name: `api/${name}`,
          path: `${dir}`,
          ignore: [`**/**/CHANGELOG.md`],
        },
      })),
  ];
}

async function getGatsbyConfig() {
  const packageFilesPlugins = await getPackagePlugins();
  return {
    plugins: [
      ...packageFilesPlugins,
      `gatsby-plugin-sharp`,
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
            { name: 'preview', store: true },
            { name: 'slug', store: true },
            { name: 'navGroup', store: true },
            { name: 'heading', store: true, attributes: { boost: 20 } },
          ],
          // How to resolve each field's value for a supported node type
          resolvers: {
            // For any node of type mdx, list how to resolve the fields' values
            Mdx: {
              content: node => node.rawBody,
              preview: node => {
                // gatsby-plugin-lunr doesn't fetch stuff with gql, it just reads from the node
                // and excerpt is implemented as a resolver so we can't call it
                // we'll probably switch to algolia when this is public so we can remove this
                // https://github.com/ChristopherBiscardi/gatsby-mdx/blob/46aad4a35ad287b28f02c5191b440335986fbfc3/packages/gatsby-mdx/gatsby/extend-node-type.js#L141-L156
                const ast = compiler.parse(node.rawBody);
                const excerptNodes = [];
                visit(ast, mdNode => {
                  if (mdNode.type === 'text' || mdNode.type === 'inlineCode') {
                    excerptNodes.push(mdNode.value);
                  }
                });

                return prune(excerptNodes.join(' '), 280, '…');
              },
              slug: node => node.fields.slug,
              navGroup: node => node.fields.navGroup,
              heading: node => node.fields.heading,
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
