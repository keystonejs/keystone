const path = require('path');
const slugify = require('@sindresorhus/slugify');
const get = require('lodash.get');

const INDEX_FILES = ['index', 'readme'];

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const MdTemplate = path.resolve(`src/templates/MdTemplate.js`);

  // The 'fields' values are injected during the `onCreateNode` call below
  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              slug
              workspace
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
    result.data.allMarkdownRemark.edges.forEach(({ node: { id, fields } }) => {
      // The 'fields' values are injected during the `onCreateNode` call below
      createPage({
        path: `${fields.slug}`,
        component: MdTemplate,
        context: { mdPageId: id, ...fields }, // additional data can be passed via context
      });
    });
  });
};

const slugifyPath = pathToSlugify =>
  pathToSlugify
    .split('/')
    .map(slugify)
    .join('/');

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  // Only for our markdown files
  if (get(node, 'internal.type') === `MarkdownRemark`) {
    // Get the parent node which includes info about the file paths, etc
    const parent = getNode(node.parent);

    const fieldsToAdd = {
      // This value is added in `gatsby-config` as the "name" of the plugin.
      // Since we scan every workspace and add that as a separate plugin, we
      // have the opportunity there to add the "name", which we pull from the
      // workspace's `package.json`, and can use here.
      workspace: parent.sourceInstanceName,
      workspaceSlug: slugify(parent.sourceInstanceName),
      // The full path to this "node"
      slug: [
        `/${slugifyPath(parent.sourceInstanceName)}`,
        parent.relativeDirectory ? `/${slugifyPath(parent.relativeDirectory)}` : '',
        `/${INDEX_FILES.includes(parent.name.toLowerCase()) ? '' : slugifyPath(parent.name)}`,
      ].join(''),
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
