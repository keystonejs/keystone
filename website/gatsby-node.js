const path = require('path');
const bolt = require('bolt');
const get = require('lodash.get');
const slugify = require('@sindresorhus/slugify');
const visit = require('unist-util-visit');
const rawMDX = require('@mdx-js/mdx');
const matter = require('gray-matter');
const mdastToString = require('mdast-util-to-string');

const generateUrl = require('./generateUrl');

const compiler = rawMDX.createMdxAstCompiler({ remarkPlugins: [] });

const PROJECT_ROOT = path.resolve('..');
const GROUPS = [
  'quick-start',
  'tutorials',
  'guides',
  'api',
  'discussions',
  'packages',
  'field-types',
];
const GROUPS_NO_PKG = GROUPS.filter(s => s !== 'packages');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const template = path.resolve(`src/templates/docs.js`);

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
              sortOrder
              isPackageIndex
              pageTitle
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
      If you end up with multiple ways to generate a markdown page, you will
      need to split out to new templates, with their own graphql queries
    */
    const pages = result.data.allMdx.edges;

    pages.forEach(({ node: { id, fields } }) => {
      // The 'fields' values are injected during the `onCreateNode` call below
      createPage({
        path: `${fields.slug}`,
        component: template,
        context: {
          mdPageId: id,
          ...fields,
        }, // additional data can be passed via context
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

const getEditUrl = absPath =>
  `https://github.com/keystonejs/keystone-5/edit/master/${path.relative(PROJECT_ROOT, absPath)}`;

exports.onCreateNode = async ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  // Only for our markdown files
  if (get(node, 'internal.type') === `Mdx`) {
    // Get the parent node which includes info about the file paths, etc
    const parent = getNode(node.parent);
    const { sourceInstanceName, relativePath } = parent;

    const isPackage = !GROUPS_NO_PKG.includes(sourceInstanceName);
    let { data, content } = matter(node.rawBody, { delimiters: ['<!--[meta]', '[meta]-->'] });

    const navGroup = data.section;
    let pageTitle = data.title;

    if (isPackage && sourceInstanceName !== '@keystone-alpha/fields') {
      const { dir: rootDir } = await bolt.getProject({ cwd: '../' });
      const workspaces = await bolt.getWorkspaces({ cwd: rootDir, only: sourceInstanceName });
      pageTitle = workspaces[0].name;
    }

    const ast = compiler.parse(content);
    let description;
    let heading;

    visit(ast, node => {
      if (!description && node.type === 'paragraph') {
        description = mdastToString(node);
      }
      if (!heading && node.type === 'heading' && node.depth === 1) {
        heading = mdastToString(node);
      }
    });

    // This value is added in `gatsby-config` as the "name" of the plugin.
    // Since we scan every workspace and add that as a separate plugin, we
    // have the opportunity there to add the "name", which we pull from the
    // workspace's `package.json`, and can use here.
    const fieldsToAdd = {
      navGroup: navGroup,
      workspaceSlug: slugify(sourceInstanceName),
      editUrl: getEditUrl(get(node, 'fileAbsolutePath')),
      // The full path to this "node"
      slug: generateUrl(parent),
      sortOrder: GROUPS.indexOf(navGroup),
      isPackageIndex: isPackage && relativePath === 'README.md',
      pageTitle: pageTitle,
      description,
      heading,
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
