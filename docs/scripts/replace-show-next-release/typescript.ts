// @codemod/core is basically @babel/core but it uses recast to preserve formatting/comments better
import { transform } from '@codemod/core';
import { types } from '@babel/core';
import prettier from 'prettier';

export async function replaceShowNextRelease(filename: string, source: string) {
  const transformed = transform(source, {
    parserOpts: { plugins: filename.endsWith('.tsx') ? ['typescript', 'jsx'] : ['typescript'] },
    plugins: [
      {
        visitor: {
          MemberExpression(path) {
            const { node } = path;
            if (
              !node.computed &&
              node.property.type === 'Identifier' &&
              node.property.name === 'SHOW_NEXT_RELEASE' &&
              node.object.type === 'MemberExpression' &&
              !node.object.computed &&
              node.object.property.type === 'Identifier' &&
              node.object.property.name === 'env' &&
              node.object.object.type === 'Identifier' &&
              node.object.object.name === 'process'
            ) {
              if (
                path.parentPath.isIfStatement() &&
                path.parentKey === 'test' &&
                path.parentPath.node.consequent.type === 'BlockStatement'
              ) {
                path.parentPath.replaceWithMultiple(path.parentPath.node.consequent.body);
                return;
              }
              if (path.parentPath.isConditionalExpression() && path.parentKey === 'test') {
                const { consequent } = path.parentPath.node;
                if (
                  path.parentPath.parentPath.isJSXExpressionContainer() &&
                  consequent.type === 'JSXElement'
                ) {
                  path.parentPath.parentPath.replaceWith(consequent);
                  return;
                }
                path.parentPath.replaceWith(path.parentPath.node.consequent);
                return;
              }
              path.replaceWith(types.stringLiteral('1'));
            }
          },
        },
      },
    ],
    babelrc: false,
    configFile: false,
    babelrcRoots: false,
    filename,
  });
  const config = await prettier.resolveConfig(filename);
  return prettier.format(transformed!.code!, { filepath: filename, ...config });
}
