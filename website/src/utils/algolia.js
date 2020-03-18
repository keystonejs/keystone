const getQuery = navGroup => `{
  items: allMdx(filter: {fields: {navGroup: {eq: "${navGroup}"}}}) {
    edges {
      node {
        objectID: id
        fields {
          navGroup
          pageTitle
          slug
          draft
          description
          searchableContent
        }
      }
    }
  }
}`;

const flatten = arr =>
  arr
    .map(({ node: { fields, ...rest } }) => ({
      ...fields,
      ...rest,
    }))
    .filter(item => !item.draft);

const indices = [
  {
    navGroup: 'guides',
    indexName: `Guides`,
  },
  {
    navGroup: 'api',
    indexName: `API`,
  },
  {
    navGroup: 'tutorials',
    indexName: `Tutorials`,
  },
  {
    navGroup: 'quick-start',
    indexName: `Quick Start`,
  },
  {
    navGroup: 'list-plugins',
    indexName: `List Plugins`,
  },
];

const queries = indices.map(i => ({
  indexName: i.indexName,
  query: getQuery(i.navGroup),
  transformer: ({ data }) => flatten(data.items.edges),
}));

module.exports = { indices, queries };
