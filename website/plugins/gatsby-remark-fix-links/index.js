const visit = require('unist-util-visit');
const path = require('path');
const weakMemoize = require('@emotion/weak-memoize').default;

let fileExtensions = ['png', 'gif'];

// function getCacheKey(node) {
//   return `remark-check-links-${node.id}-${node.internal.contentDigest}`;
// }
// function getHeadingsMapKey(link, path) {
//   let key = link;
//   const hashIndex = link.indexOf('#');
//   const hasHash = hashIndex !== -1;
//   if (hasHash) {
//     key = link.startsWith('#') ? path : link.slice(0, hashIndex);
//   }
//   return {
//     key,
//     hasHash,
//     hashIndex,
//   };
// }
// function createPathPrefixer(pathPrefix) {
//   return function withPathPrefix(url) {
//     const prefixed = pathPrefix + url;
//     return prefixed.replace(/\/\//, '/');
//   };
// }

let buildFilenameToUrlMap = weakMemoize(getNode =>
  weakMemoize(files => {
    let map = {};

    for (let file of files) {
      if (file.children.length === 2) {
        map[file.absolutePath] = getNode(file.children[1]).fields.slug;
      }
    }
    return map;
  })
);

module.exports = async function plugin(
  { markdownAST, markdownNode, files, getNode, cache, getCache, pathPrefix } // { exceptions = [], ignore = [] } = {}
) {
  if (!markdownNode.fields) {
    // let the file pass if it has no fields
    return markdownAST;
  }
  const links = [];
  const headings = [];
  function visitor(node, index, parent) {
    if (parent.type === 'heading') {
      headings.push(parent.data.id);
      return;
    }
    if (node.url.startsWith('#') || /^\/(?!\/)/.test(node.url)) {
      links.push(node);
    } else if (
      node.url.startsWith('//') ||
      node.url.startsWith('http') ||
      fileExtensions.some(x => node.url.endsWith(`.${x}`))
    ) {
      // do nothing
      // these links are fine
    } else {
      throw new Error(
        `Links must be absolute to the root of the KeystoneJS repository, external links, relative links to files like images(if you're linking to a file and seeing this error, add the extension of the file to website/plugins/gatsby-remark-fix-links/index.js) or links to a heading in the same file but the link "${node.url}" in "${markdownNode.fileAbsolutePath}" is none of those.`
      );
    }
  }
  visit(markdownAST, 'link', visitor);
  let filenameToUrlMap = buildFilenameToUrlMap(getNode)(files);
  links.forEach(link => {
    if (!link.url.startsWith('#')) {
      let url = new URL(link.url, 'https://keystonejs.com');
      let absolutePath = path.join(path.resolve(__dirname, '..', '..', '..'), url.pathname);
      let resolvedUrl = filenameToUrlMap[absolutePath];
      if (resolvedUrl === undefined) {
        throw new Error(
          `Could not find file "${absolutePath}" when resolving link "${link.url}" from "${markdownNode.fileAbsolutePath}"`
        );
      }

      link.url = resolvedUrl + url.hash;
    }
  });
  // const withPathPrefix = createPathPrefixer(pathPrefix);
  // const parent = await getNode(markdownNode.parent);
  // const setAt = Date.now();
  // cache.set(getCacheKey(parent), {
  //   path: withPathPrefix(markdownNode.fields.slug),
  //   links,
  //   headings,
  //   setAt,
  // });
  // wait to see if all of the Markdown and MDX has been visited
  // const linksMap = {};
  // const headingsMap = {};
  // for (const file of files) {
  //   if (/^mdx?$/.test(file.extension)) {
  //     const key = getCacheKey(file);
  //     let visited = await cache.get(key);
  //     if (!visited && getCache) {
  //       // the cache provided to `gatsby-mdx` has its own namespace, and it
  //       // doesn't have access to `getCache`, so we have to check to see if
  //       // those files have been visited here.
  //       const mdxCache = getCache('gatsby-plugin-mdx');
  //       visited = await mdxCache.get(key);
  //     }
  //     if (visited && setAt >= visited.setAt) {
  //       linksMap[visited.path] = visited.links;
  //       headingsMap[visited.path] = visited.headings;
  //       continue;
  //     }
  //     // don't continue if a page hasn't been visited yet
  //     return;
  //   }
  // }

  return markdownAST;
};
