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
        sort: { fields: [context___sortOrder, context___pageTitle] }
      ) {
        edges {
          node {
            path
            context {
              navGroup
              isPackageIndex
              pageTitle
            }
          }
        }
      }
    }
  `);
  console.log(data.allSitePage.edges);

  const navData = data.allSitePage.edges.reduce((pageList, { node }) => {
    if (node.context.navGroup !== null) {
      // finding out what directory the file is in (eg '/keystone-alpha')
      pageList[node.context.navGroup] = pageList[node.context.navGroup] || [];
      if (node.context.pageTitle === 'Introduction') {
        pageList[node.context.navGroup].unshift(node);
      } else if (node.context.navGroup !== 'packages' || node.context.isPackageIndex) {
        pageList[node.context.navGroup].push(node);
      }
    }

    return pageList;
  }, {});

  return navData;
}
