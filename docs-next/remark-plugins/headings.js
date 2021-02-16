const visit = require('unist-util-visit');
const slugify = require('@sindresorhus/slugify');
module.exports = () => {
  const headings = [];
  return (tree, file) => {
    visit(tree, 'heading', node => {
      if (node.depth > 1) {
        let heading = {
          depth: node.depth,
          doc: file.history,
        };
        visit(node, 'text', textNode => {
          // We should probably account for multiple children here at some point?
          heading.label = textNode.value;
          textNode.value = textNode.value;
          heading.id = slugify(textNode.value);
        });
        headings.push(heading);
      }
    });

    visit(tree, 'export', node => {
      if (!node.default) {
        node.value = `export  const meta = {
                headings: ${JSON.stringify(headings, null, 2)}
        }`;
      }
    });
  };
};
