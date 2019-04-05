let createPlugin = require('./macros-thing');
let { name } = require('../../package.json');

module.exports = createPlugin({
  [name]: function({ babel, references }) {
    const { types: t } = babel;
    if (references.importView) {
      references.importView.forEach(reference => {
        // TODO: check that parentPath is a call expression
        let stringLiteral = reference.parentPath.get('arguments.0');
        // TODO: check that stringLiteral is actually a string literal
        stringLiteral.replaceWith(t.callExpression(t.import(), [stringLiteral.node]));
        reference.replaceWith(t.identifier('___KS_BUILD_SYSTEM_INTERNAL___importView'));
      });
    }
  },
});
