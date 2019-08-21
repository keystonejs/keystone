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

export function useNavData() {
  let data = useStaticQuery(graphql`
    query HeadingQuery {
      allSitePage(
        filter: { path: { ne: "/dev-404-page/" } }
        sort: { fields: [context___sortOrder, context___sortSubOrder, context___pageTitle] }
      ) {
        edges {
          node {
            path
            context {
              navGroup
              navSubGroup
              isPackageIndex
              pageTitle
            }
          }
        }
      }
    }
  `);

  const navData = data.allSitePage.edges.reduce(
    (
      pageList,
      {
        node,
        node: {
          context,
          context: { navGroup, navSubGroup },
        },
      }
    ) => {
      if (navGroup !== null) {
        // finding out what directory the file is in (eg '/keystone-alpha')

        const addPage = page => {
          if (context.pageTitle === 'Introduction') {
            page.pages.unshift(node);
          } else if (navGroup !== 'packages' || context.isPackageIndex) {
            page.pages.push(node);
          }
        };

        if (Boolean(!pageList.find(obj => obj.navTitle === navGroup))) {
          pageList.push({ navTitle: navGroup, pages: [], subNavs: [] });
        }

        if (navSubGroup === null) {
          const page = pageList.find(obj => obj.navTitle === navGroup);
          addPage(page);
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
  return navData;
}
