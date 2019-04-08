let { addNamed } = require('@babel/helper-module-imports');
let createPlugin = require('./macros-thing');
let { name } = require('../../package.json');

module.exports = createPlugin({
  [name]: function({ babel, references, state }) {
    const t = babel.types;

    if (references.importView) {
      let pathJoinIdentifier = addNamed(state.file.path, 'join', 'path');

      references.importView.forEach(reference => {
        reference.replaceWith(t.cloneNode(pathJoinIdentifier));
        reference.parentPath.node.arguments.unshift(t.identifier('__dirname'));
      });
    }
  },
});
