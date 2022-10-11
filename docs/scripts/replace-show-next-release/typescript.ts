// @codemod/core is basically @babel/core but it uses recast to preserve formatting/comments better
import { transform } from '@codemod/core';
import { NodePath, Node, types } from '@babel/core';
import prettier from 'prettier';

function truthyConditionalExpression(path: NodePath<Node>) {
  if (path.parentPath?.isConditionalExpression() && path.parentKey === 'test') {
    return { consequent: path.parentPath.node.consequent, path: path.parentPath };
  }
  if (
    path.parentPath?.isLogicalExpression() &&
    path.parentKey === 'left' &&
    path.parentPath.node.operator === '&&'
  ) {
    return { consequent: path.parentPath.node.right, path: path.parentPath };
  }
}

export async function replaceShowNextRelease(filename: string, source: string) {
  const transformed = transform(source, {
    parserOpts: { plugins: filename.endsWith('.tsx') ? ['typescript', 'jsx'] : ['typescript'] },
    plugins: [
      {
        visitor: {
          MemberExpression(path) {
            const { node } = path;
            if (
              !(
                !node.computed &&
                node.property.type === 'Identifier' &&
                node.property.name === 'SHOW_NEXT_RELEASE' &&
                node.object.type === 'MemberExpression' &&
                !node.object.computed &&
                node.object.property.type === 'Identifier' &&
                node.object.property.name === 'env' &&
                node.object.object.type === 'Identifier' &&
                node.object.object.name === 'process'
              )
            ) {
              return;
            }
            if (
              path.parentPath.isIfStatement() &&
              path.parentKey === 'test' &&
              path.parentPath.node.consequent.type === 'BlockStatement'
            ) {
              path.parentPath.replaceWithMultiple(path.parentPath.node.consequent.body);
              return;
            }

            const conditional = truthyConditionalExpression(path);
            if (conditional) {
              if (
                conditional.path.parentPath?.isJSXExpressionContainer() &&
                conditional.consequent.type === 'JSXElement'
              ) {
                conditional.path.parentPath.replaceWith(conditional.consequent);
                return;
              }
              conditional.path.replaceWith(conditional.consequent);
              return;
            }
            path.replaceWith(types.stringLiteral('1'));
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
