const { addNamed } = require('@babel/helper-module-imports');
const nodePath = require('path');

module.exports = function(babel) {
  const { types: t } = babel;
  return {
    visitor: {
      CallExpression(path, state) {
        let { pkgDir, filename } = state.opts;
        if (path.get('callee').node.name !== '___KS_BUILD_SYSTEM_INTERNAL___importView') {
          return;
        }
        if (!state.pathJoinIdentifierName) {
          state.pathJoinIdentifierName = addNamed(path, 'join', 'path').name;
        }
        let pathJoinIdentifier = t.identifier(state.pathJoinIdentifierName);
        let chunkPath = nodePath.join(pkgDir, 'dist', path.node.arguments[1].value);
        let relativePath = nodePath.relative(
          nodePath.dirname(nodePath.join(pkgDir, filename)),
          chunkPath
        );

        path.replaceWith(
          t.callExpression(pathJoinIdentifier, [
            t.identifier('__dirname'),
            t.stringLiteral(relativePath),
          ])
        );
        return;
      },
    },
  };
};
