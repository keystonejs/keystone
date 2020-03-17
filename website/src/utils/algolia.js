const guidesQuery = `{
  guides: allMdx(filter: {fields: {navGroup: {eq: "guides"}}}) {
    edges {
      node {
        fields {
          navGroup
          pageTitle
          slug
          draft
          isPackageIndex
        }
      }
    }
  }
}`;

const apiQuery = `{
  api: allMdx(filter: {fields: {navGroup: {eq: "api"}}}) {
    edges {
      node {
        fields {
          navGroup
          pageTitle
          slug
          draft
          isPackageIndex
        }
      }
    }
  }
}`;

const flatten = arr =>
  arr.map(({ node: { fields, ...rest } }) => ({
    ...fields,
    ...rest,
  }));

const queries = [
  {
    query: guidesQuery,
    transformer: ({ data }) => flatten(data.guides.edges),
    indexName: `Guides`,
  },
  {
    query: apiQuery,
    transformer: ({ data }) => flatten(data.api.edges),
    indexName: `API`,
  },
];

module.exports = queries;
