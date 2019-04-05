// todo: needs to support ESM
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
              path.replaceWith(
                t.callExpression(
                  // this should use path.join(__dirname, path) but that's for the real implementation
                  t.memberExpression(t.identifier('require'), t.identifier('resolve')),
                  [requireCall.node.arguments[0]]
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
            let stringLiteral = importCall.get('arguments.0').node;
            path.replaceWith(
              t.callExpression(
                t.memberExpression(t.identifier('require'), t.identifier('resolve')),
                [stringLiteral]
              )
            );
            return;
          }
        }
        throw new Error('invalid importView usage, this is likely not a bug in user code');
      },
    },
  };
};
