const visit = require('unist-util-visit');
const slugify = require('@sindresorhus/slugify');
const fs = require('fs');

function insertAtEnd(node, { children }) {
  // find index of last import
  return children.push(node);
}

module.exports = () => {
  const fileMap = {
    headings: {},
  };
  return (tree, file) => {
    const headings = [];
    const slug = slugify(file.basename.replace('.mdx', ''));
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

    fileMap.headings[slug] = headings;

    visit(tree, 'export', node => {
      if (node.default) {
        const key = 'Markdown';
        const index = node.value.indexOf(key);
        if (index > -1) {
          const offset = index + key.length;
          // console.log(node.value, typeof node.value);
          const beginning = node.value.slice(0, offset);
          const end = node.value.slice(offset);
          node.value = `${beginning} meta={meta} ${end}`;
        }
      }
    });

    insertAtEnd(
      {
        type: 'export',
        default: false,
        value: `export const meta = {
        headings: ${JSON.stringify(headings, null, 2)}
        }`,
      },
      tree
    );
  };
};
