const visit = require('unist-util-visit');
const path = require('path');
const weakMemoize = require('@emotion/weak-memoize').default;

let fileExtensions = ['png', 'gif'];

let repoRoot = path.resolve(__dirname, '..', '..', '..');

let buildFilenameToMdxNodeMap = weakMemoize(getNode =>
  weakMemoize(files => {
    let map = {};

    for (let file of files) {
      if (file.children.length === 2) {
        map[file.absolutePath] = getNode(file.children[1]);
      }
    }
    return map;
  })
);

module.exports = async function plugin({ markdownAST, markdownNode, files, getNode }) {
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
      node.url.startsWith('mailto:') ||
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
  let filenameToMdxNodeMap = buildFilenameToMdxNodeMap(getNode)(files);
  links.forEach(link => {
    let originalUrl = link.url;
    if (link.url.startsWith('#')) {
      link.url = path.relative(repoRoot, markdownNode.fileAbsolutePath) + link.url;
    }

    let url = new URL(link.url, 'https://keystonejs.com'); // note that the second arg here doesn't end up mattering because we only use the pathname
    let absolutePath = path.join(repoRoot, url.pathname);
    let mdxNode = filenameToMdxNodeMap[absolutePath];
    if (mdxNode === undefined) {
      throw new Error(
        `Could not find file "${absolutePath}" when resolving link "${originalUrl}" from "${markdownNode.fileAbsolutePath}"`
      );
    }

    if (url.hash !== '' && !mdxNode.fields.headingIds.includes(url.hash.replace(/^#/, ''))) {
      throw new Error(
        `"${
          markdownNode.fileAbsolutePath
        }" links to "${originalUrl}" but the heading does not exist in the file being linked to.\nThe headings that do exist in the file being linked to are:\n${mdxNode.fields.headingIds.join(
          '\n'
        )}`
      );
    }

    link.url = mdxNode.fields.slug + url.hash;
  });

  return markdownAST;
};
