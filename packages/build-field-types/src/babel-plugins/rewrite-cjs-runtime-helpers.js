const helperPath = /^@babel\/runtime\/helpers\/esm\/(\w+)$/;

module.exports = ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      if (path.get('callee').node.name !== 'require') {
        return;
      }

      const argument = path.get('arguments.0');

      if (!argument.isStringLiteral()) {
        return;
      }

      const nodeModule = argument.node.value;

      if (!helperPath.test(nodeModule)) {
        return;
      }

      const rewritten = nodeModule.replace(helperPath, '@babel/runtime/helpers/$1');

      argument.replaceWith(t.stringLiteral(rewritten));
    },
  },
});
