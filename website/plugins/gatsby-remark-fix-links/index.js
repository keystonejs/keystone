const visit = require('unist-util-visit');
const path = require('path');

const generateUrl = require('../../generateUrl');

module.exports = ({ markdownAST, markdownNode, getNode }) => {
  visit(markdownAST, 'link', node => {
    // remove .md from the end of relative urls - they are left there in file so the
    // links work in github.
    if (!node.url.startsWith('//') && !node.url.startsWith('http')) {
      node.url = node.url.replace(/\.md(#.*)?$/, (match, hash) => {
        return hash || '';
      });
    }
    // This resolves relative paths to relative urls. It may be too fragile.
    if (node.url.startsWith('./') || node.url.startsWith('../')) {
      let url = generateUrl(getNode(markdownNode.parent));
      node.url = path.resolve(url, node.url);
    }
  });
};
