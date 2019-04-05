let createPlugin = require('./macros-thing');
let { name } = require('../../package.json');

module.exports = createPlugin({
  [name]: function({ babel, references }) {
    const { types: t } = babel;
    if (references.importView) {
      references.importView.forEach(reference => {
        reference.replaceWith(t.memberExpression(t.identifier('require'), t.identifier('resolve')));
      });
    }
  },
});
