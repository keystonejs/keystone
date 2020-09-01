import { graphql, useStaticQuery } from 'gatsby';

// Not in hooks.js - because of how queries currently work in Gatsby, we support only a single instance of useStaticQuery in a file
// See: https://www.gatsbyjs.org/docs/use-static-query/

// This also has to be duplicated because: https://github.com/gatsbyjs/gatsby/issues/13764
// Yay Gatsby \o/
export const navQuery = graphql`
  query BlogNavQuery {
    allSitePage(
      filter: { path: { ne: "/dev-404-page/" }, context: { isIndex: { ne: true } } }
      sort: {
        fields: [context___sortOrder, context___sortSubOrder, context___order, context___pageTitle]
      }
    ) {
      edges {
        node {
          path
          context {
            navGroup
            navSubGroup
            order
            isPackageIndex
            pageTitle
          }
        }
      }
    }
  }
`;

export function useNavDataBlog() {
  // We filter out the index.md pages from the nav list
  let data = useStaticQuery(navQuery);
  let blogPosts = 0;
  const POST_LIMIT = 50;
  const navData = data.allSitePage.edges.reduce(
    (
      pageList,
      {
        node,
        node: {
          context: { navGroup, navSubGroup },
        },
      }
    ) => {
      if (navGroup !== null) {
        // finding out what directory the file is in (eg '/keystone-alpha')

        const addPage = page => {
          page.pages.push(node);
        };

        if (navGroup === 'blog' && Boolean(!pageList.find(obj => obj.navTitle === navGroup))) {
          pageList.push({ navTitle: navGroup, pages: [], subNavs: [] });
        }

        if (navSubGroup === null) {
          const page = pageList.find(obj => obj.navTitle === navGroup);
          if (navGroup === 'blog' && blogPosts < POST_LIMIT) {
            blogPosts++;
            addPage(page);
          }
        }
      }
      return pageList;
    },
    []
  );

  // Add more posts link
  if (Boolean(navData.find(obj => obj.navTitle === 'blog'))) {
    navData
      .find(obj => obj.navTitle === 'blog')
      .pages.push({
        context: {
          navGroup: 'blog',
          navSubGroup: null,
          order: 99999999999,
          isPackageIndex: false,
          pageTitle: 'More posts...',
        },
        path: '/blog/',
      });
  }

  return navData;
}
