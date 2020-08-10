import { useRef, useState, useLayoutEffect } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

export function useDimensions() {
  const ref = useRef();
  const [dimensions, setDimensions] = useState({});

  useLayoutEffect(() => {
    setDimensions(ref.current.getBoundingClientRect().toJSON());
  }, [ref.current]);

  return [ref, dimensions];
}

const navQuery = graphql`
  query HeadingQuery {
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
export function useNavData() {
  // We filter out the index.md pages from the nav list
  let data = useStaticQuery(navQuery);
  let blogPosts = 0;
  const POST_LIMIT = 3;
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

        if (Boolean(!pageList.find(obj => obj.navTitle === navGroup))) {
          pageList.push({ navTitle: navGroup, pages: [], subNavs: [] });
        }

        if (navSubGroup === null) {
          const page = pageList.find(obj => obj.navTitle === navGroup);
          if (navGroup !== 'blog') {
            addPage(page);
          } else if (blogPosts < POST_LIMIT) {
            blogPosts++;
            addPage(page);
          }
        } else {
          const page = pageList.find(obj => obj.navTitle === navGroup);
          if (Boolean(!page.subNavs.find(obj => obj.navTitle === navSubGroup))) {
            page.subNavs.push({ navTitle: navSubGroup, pages: [] });
          }
          const subPage = page.subNavs.find(obj => obj.navTitle === navSubGroup);
          addPage(subPage);
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
