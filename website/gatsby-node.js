const path = require('path');
const get = require('lodash.get');
const slugify = require('@sindresorhus/slugify');
const generateUrl = require('./generateUrl');

const PROJECT_ROOT = path.resolve('..');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const MdTemplate = path.resolve(`src/templates/MdTemplate.js`);

  // The 'fields' values are injected during the `onCreateNode` call below
  return graphql(`
    {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
              navGroup
              workspaceSlug
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    /*
    If you end up with multiple ways to generate a markdown page, you will need to split out to new templates, with their own graphql queries
    */
    result.data.allMdx.edges.forEach(({ node: { id, fields } }) => {
      // The 'fields' values are injected during the `onCreateNode` call below
      createPage({
        path: `${fields.slug}`,
        component: MdTemplate,
        context: { mdPageId: id, ...fields }, // additional data can be passed via context
      });
    });
  });
};

exports.onCreateBabelConfig = ({ actions, stage }) => {
  actions.setBabelPreset({
    name: `@babel/preset-flow`,
    stage,
  });
  actions.setBabelPlugin({
    name: `babel-plugin-extract-react-types`,
    stage,
  });
};

exports.onCreateWebpackConfig = ({ actions }) => {
  // we need these aliases so that we use the src version of the packages that require builds
  let preconstructAliases = require('preconstruct').aliases.webpack(path.join(__dirname, '..'));

  actions.setWebpackConfig({
    resolve: {
      alias: preconstructAliases,
    },
  });
};

const getEditUrl = absPath =>
  `https://github.com/keystonejs/keystone-5/edit/master/${path.relative(PROJECT_ROOT, absPath)}`;

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  // Only for our markdown files
  if (get(node, 'internal.type') === `Mdx`) {
    // Get the parent node which includes info about the file paths, etc
    const parent = getNode(node.parent);
    const fieldsToAdd = {
      // This value is added in `gatsby-config` as the "name" of the plugin.
      // Since we scan every workspace and add that as a separate plugin, we
      // have the opportunity there to add the "name", which we pull from the
      // workspace's `package.json`, and can use here.
      navGroup: parent.sourceInstanceName,
      workspaceSlug: slugify(parent.sourceInstanceName),
      editUrl: getEditUrl(get(node, 'fileAbsolutePath')),
      // The full path to this "node"
      slug: generateUrl(parent),
    };

    // see: https://github.com/gatsbyjs/gatsby/issues/1634#issuecomment-388899348
    Object.keys(fieldsToAdd).forEach(key => {
      createNodeField({
        node,
        name: key,
        value: fieldsToAdd[key],
      });
    });
  }
};
