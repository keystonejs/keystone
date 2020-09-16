const path = require('path');
const get = require('lodash.get');
const slugify = require('@sindresorhus/slugify');
const visit = require('unist-util-visit');
const rawMDX = require('@mdx-js/mdx');
const matter = require('gray-matter');
const mdastToString = require('mdast-util-to-string');
const createPaginatedPages = require('gatsby-paginate');

const generateUrl = require('./generateUrl');

const compiler = rawMDX.createMdxAstCompiler({ remarkPlugins: [] });

// we're using github-slugger for heading ids so that we're consistent with GitHub & because gatsby-remark-autolink-headers which adds the actual links uses github-slugger
const slugs = require('github-slugger')();

const PROJECT_ROOT = path.resolve('..');

// Used for sorting the navigation:
const GROUPS = [
  '',
  'quick-start',
  'blog',
  'tutorials',
  'guides',
  'API',
  'discussions',
  'list-plugins',
  'road-map',
];
const SUB_GROUPS = [
  '',
  'apps',
  'field-types',
  'adapters',
  'field-adapters',
  'api',
  'authentication-strategies',
  'utilities',
];

const createDocsPages = async ({ createPage, graphql }) =>
  graphql(`
    {
      allMdx(
        sort: {
          fields: [fields___sortOrder, fields___sortSubOrder, fields___order, fields___pageTitle]
        }
      ) {
        edges {
          node {
            id
            excerpt
            fields {
              slug
              description
              navGroup
              navSubGroup
              workspaceSlug
              sortOrder
              sortSubOrder
              order
              author
              date
              isPackageIndex
              isIndex
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

    const pages = result.data.allMdx.edges.filter(page => {
      const {
        node: {
          fields: { draft },
        },
      } = page;

      return Boolean(!draft);
    });

    let navGroups = {};

    pages.forEach(({ node: { id, fields } }) => {
      if (fields.navGroup) {
        if (!navGroups[fields.navGroup]) {
          navGroups[fields.navGroup] = [{ node: { id, fields } }];
        } else {
          navGroups[fields.navGroup].push({ node: { id, fields } });
        }
      }

      // navGroups.add(fields.navGroup)
      createPage({
        path: `${fields.slug}`,
        component: path.resolve(`src/templates/docs.js`),
        context: {
          mdPageId: id,
          ...fields,
          isBlog: fields.navGroup === 'blog',
        }, // additional data can be passed via context
      });
    });

    Object.entries(navGroups).forEach(([baseSlug, pages]) => {
      if (baseSlug !== 'quick-start' && baseSlug !== 'API') {
        createPaginatedPages({
          edges: pages,
          pathPrefix: slugify(baseSlug),
          createPage: createPage,
          context: { name: baseSlug, showSearch: true },
          pageTemplate: 'src/templates/listPage.js',
        });
      }
    });
  });

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;
  return createDocsPages({ createPage, graphql });
};

const getEditUrl = absPath =>
  `https://github.com/keystonejs/keystone/edit/master/${path.relative(PROJECT_ROOT, absPath)}`;

exports.onCreateNode = async ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  // Only for our markdown files
  if (get(node, 'internal.type') === `Mdx`) {
    // Get the parent node which includes info about the file paths, etc
    const parent = getNode(node.parent);
    const { sourceInstanceName, relativePath } = parent;

    const isPackage = !GROUPS.includes(sourceInstanceName);
    let { data, content } = matter(node.rawBody, { delimiters: ['<!--[meta]', '[meta]-->'] });

    const navGroup = data.section === 'api' ? 'API' : data.section;
    const navSubGroup = data.subSection;
    const order = data.order || 99999999999;
    let pageTitle = data.title || '';

    const ast = compiler.parse(content);
    let description;
    let heading;
    slugs.reset();
    let headingIds = [];

    visit(ast, node => {
      if (!description && node.type === 'paragraph') {
        description = mdastToString(node);
      }
      if (!heading && node.type === 'heading' && node.depth === 1) {
        heading = mdastToString(node);
      }
      if (node.type === 'heading') {
        headingIds.push(slugs.slug(mdastToString(node)));
      }
    });

    // This value is added in `gatsby-config` as the "name" of the plugin.
    // Since we scan every workspace and add that as a separate plugin, we
    // have the opportunity there to add the "name", which we pull from the
    // workspace's `package.json`, and can use here.

    const fieldsToAdd = {
      navGroup: navGroup || null, // Empty string is fine
      navSubGroup: navSubGroup || null,
      workspaceSlug: slugify(sourceInstanceName),
      editUrl: getEditUrl(get(node, 'fileAbsolutePath')),
      // The full path to this "node"
      slug: data.slug || generateUrl(parent),
      sortOrder: GROUPS.indexOf(navGroup) === -1 ? 999999 : GROUPS.indexOf(navGroup),
      sortSubOrder:
        SUB_GROUPS.indexOf(navSubGroup) === -1 ? 999999 : SUB_GROUPS.indexOf(navSubGroup),
      order,
      isPackageIndex: isPackage && relativePath === 'README.md',
      isIndex: !isPackage && relativePath === 'index.md',
      pageTitle: pageTitle,
      author: data.author,
      date: new Date(data.date).toDateString(),
      draft: Boolean(data.draft),
      description,
      heading,
      headingIds,
    };

    // see: https://github.com/gatsbyjs/gatsby/issues/1634#issuecomment-388899348
    Object.keys(fieldsToAdd)
      .filter(key => fieldsToAdd[key] !== undefined || fieldsToAdd[key] !== null)
      .forEach(key => {
        createNodeField({
          node,
          name: key,
          value: fieldsToAdd[key],
        });
      });
  }
};
