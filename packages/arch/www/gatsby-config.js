module.exports = {
  siteMetadata: {
    title: 'Arch - Keystone UI Kit',
  },
  plugins: [
    `gatsby-plugin-flow`,
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'packages',
        path: `../packages/`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
            },
          },
          'gatsby-remark-component',
        ],
      },
    },
  ],
};
