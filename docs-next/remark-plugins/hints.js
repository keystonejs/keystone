// Copyright 2020 Sérgio Ramos, Modified for KeystoneJS
// See https://github.com/sergioramos/remark-hint for original code

const u = require('unist-builder');

const classNames = {
  // tip
  'bg-lightblue-50 border border-lightblue-200 my-4 p-4 rounded-md text-lightblue-900': /^!&gt;|!>\s/,
  // warning
  'bg-amber-50 border border-amber-200 my-4 p-4 rounded-md text-amber-900': /^\?&gt;|\?>\s/,
  // error
  'bg-red-50 border border-red-200 my-4 p-4 rounded-md text-red-900': /^x&gt;|x>\s/,
};

// from github.com/syntax-tree/unist-util-map/blob/bb0567f651517b2d521af711d7376475b3d8446a/index.js
const map = (tree, iteratee) => {
  const preorder = (node, index, parent) => {
    const newNode = iteratee(node, index, parent);

    if (Array.isArray(newNode.children)) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, node);
      });
    }

    return newNode;
  };

  return preorder(tree, null, null);
};

module.exports = () => tree => {
  return map(tree, node => {
    const { children = [] } = node;
    if (node.type !== 'paragraph') {
      return node;
    }

    const [{ value, type }, ...siblings] = children;
    if (type !== 'text') {
      return node;
    }

    if (!Object.values(classNames).some(r => r.test(value))) {
      return node;
    }

    const [className, r] = Object.entries(classNames).find(([, r]) => {
      return r.test(value);
    });

    const newChild = {
      type,
      value: value.replace(r, ''),
    };

    const props = {
      data: {
        class: className,
        hProperties: {
          class: className,
        },
      },
    };

    return u('paragraph', props, [newChild, ...siblings]);
  });
};

module.exports.safelist = new Set(Object.keys(classNames).join(' ').split(' '));
