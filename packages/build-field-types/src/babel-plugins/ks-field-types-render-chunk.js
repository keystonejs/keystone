const { addNamed } = require('@babel/helper-module-imports');
const nodePath = require('path');

module.exports = function(babel) {
  const { types: t } = babel;
  let isPromiseResolve = t.buildMatchMemberExpression('Promise.resolve');
  return {
    visitor: {
      CallExpression(path, state) {
        let { moduleFormat } = state.opts;
        if (path.get('callee').node.name !== '___KS_BUILD_SYSTEM_INTERNAL___importView') {
          return;
        }
        if (!state.pathJoinIdentifierName) {
          state.pathJoinIdentifierName = addNamed(path, 'join', 'path').name;
        }
        let pathJoinIdentifier = t.identifier(state.pathJoinIdentifierName);
        if (moduleFormat === 'cjs') {
          let promiseResolveCall = path.get('arguments')[0];
          if (
            promiseResolveCall.isCallExpression() &&
            isPromiseResolve(promiseResolveCall.get('callee').node)
          ) {
            let requireCall = promiseResolveCall.get('arguments')[0];

            if (
              requireCall.isCallExpression() &&
              requireCall.get('callee').node.name === 'require' &&
              requireCall.get('arguments')[0].isStringLiteral()
            ) {
              let stringLiteral = t.stringLiteral(
                nodePath.dirname(requireCall.node.arguments[0].value)
              );
              path.replaceWith(
                t.callExpression(
                  // this should use path.join(__dirname, path) but that's for the real implementation
                  pathJoinIdentifier,
                  [t.identifier('__dirname'), stringLiteral]
                )
              );
              return;
            }
          }
        }
        if (moduleFormat === 'esm') {
          let importCall = path.get('arguments.0');
          if (
            importCall.isCallExpression() &&
            importCall.get('callee').isImport() &&
            importCall.get('arguments.0').isStringLiteral()
          ) {
            let stringLiteral = t.stringLiteral(
              nodePath.dirname(importCall.node.arguments[0].value)
            );
            path.replaceWith(
              t.callExpression(pathJoinIdentifier, [t.identifier('__dirname'), stringLiteral])
            );
            return;
          }
        }
        throw new Error('invalid importView usage, this is likely not a bug in user code');
      },
    },
  };
};
