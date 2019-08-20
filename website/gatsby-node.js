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

// Used for sorting the navigation:
const GROUPS = [
  'quick-start',
  'guides',
  'api',
  'tutorials',
  'adapters',
  'field adapters',
  'apps',
  'authentication-strategies',
  'discussions',
  'field-types',
];

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
              navSubGroup
              workspaceSlug
              sortOrder
              isPackageIndex
              pageTitle
              draft
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

    const pages = result.data.allMdx.edges.filter(page => {
      const {
        node: {
          fields: { draft, navGroup },
        },
      } = page;

      return Boolean(!draft) && Boolean(navGroup !== '');
    });

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

    const isPackage = !GROUPS.includes(sourceInstanceName);
    let { data, content } = matter(node.rawBody, { delimiters: ['<!--[meta]', '[meta]-->'] });

    const navGroup = data.section;
    const navSubGroup = data.subSection;
    let pageTitle = data.title;

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
      navGroup: navGroup || 'no-section' || null,
      navSubGroup: navSubGroup || 'no-sub-nav' || null,
      workspaceSlug: slugify(sourceInstanceName),
      editUrl: getEditUrl(get(node, 'fileAbsolutePath')),
      // The full path to this "node"
      slug: generateUrl(parent),
      sortOrder: GROUPS.indexOf(navGroup) === -1 ? 999999 : GROUPS.indexOf(navGroup),
      isPackageIndex: isPackage && relativePath === 'README.md',
      pageTitle: pageTitle,
      draft: Boolean(data.draft),
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
