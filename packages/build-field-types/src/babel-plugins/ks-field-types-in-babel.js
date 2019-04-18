let createPlugin = require('./macros-thing');
let path = require('path');
let hashString = require('@emotion/hash').default;

let resolve = require('resolve');
let { name } = require('../../package.json');

module.exports = createPlugin({
  [name]: function({ babel, references, state }) {
    const { types: t } = babel;
    if (references.importView) {
      references.importView.forEach(reference => {
        // TODO: check that parentPath is a call expression
        let stringLiteral = reference.parentPath.get('arguments.0');
        let hash = hashString(
          path.relative(
            state.opts.pkgDir,
            resolve.sync(stringLiteral.node.value, {
              basedir: path.dirname(reference.hub.file.opts.filename),
              extensions: ['.js', '.jsx', '.ts', '.tsx'],
            })
          )
        );
        // TODO: check that stringLiteral is actually a string literal
        stringLiteral.replaceWith(t.callExpression(t.import(), [stringLiteral.node]));
        reference.parentPath.node.arguments[1] = t.stringLiteral(hash);

        reference.replaceWith(t.identifier('___KS_BUILD_SYSTEM_INTERNAL___importView'));
      });
    }
  },
});
