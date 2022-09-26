import Markdoc, { Ast, Node } from '@markdoc/markdoc';
import { baseMarkdocConfig } from './config';

function transform(node: Node): Node[] | Node {
  if (
    node.type !== 'tag' ||
    node.tag !== 'if' ||
    !Ast.isVariable(node.attributes.primary) ||
    node.attributes.primary.path.length !== 1 ||
    node.attributes.primary.path[0] !== 'nextRelease'
  ) {
    return new Ast.Node(node.type, node.attributes, node.children.flatMap(transform), node.tag);
  }
  const elseTag = node.children.findIndex(child => child.type === 'tag' && child.tag === 'else');
  return elseTag === -1 ? node.children : node.children.slice(0, elseTag);
}

export function removeNextReleaseConditions(root: Node) {
  const transformed = new Ast.Node(
    root.type,
    root.attributes,
    root.children.flatMap(transform),
    root.tag
  );
  const contents = Markdoc.__EXPERIMENTAL__format(transformed);

  // we parse it again before validating so that positions are correct
  const reparsed = Markdoc.parse(contents);
  // this will report usages of variables in case the transform here is broken
  const errors = Markdoc.validate(reparsed, baseMarkdocConfig);

  return { contents, errors };
}
