const path = require('path');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const MdTemplate = path.resolve(`src/templates/MdTemplate.js`);

  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            id
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    /*
    For first effort, we are simply using the node id to generate the page urls. We likely want to rely on paths
    instead, for example (not a final spec):
        `packageFolder/README.md` to -> `website.com/docs/packages/packageName`
        `packageFolder/Something.md` to -> `website.com/docs/packages/packageName/something`
        `packageFolder/nested/Something.md` to -> `website.com/docs/packages/packageName/nested/something`

    Decisions need to be made about how these things map.
    The property you will probably end up using is the `fileAbsolutePath` instead of the `id`, though that is not amazingly useful.

    The easiest method is to add frontmatter of `path` to our markdown files, but I don't know if we want to do that everywhere.

    If you end up with multiple ways to generate a markdown page, you will need to split out to new templates, with their own graphql queries
    */
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: `${node.id}`,
        component: MdTemplate,
        context: { mdPageId: node.id }, // additional data can be passed via context
      });
    });
  });
};
