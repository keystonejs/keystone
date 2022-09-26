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

const pattern =
  /{%\s+if\s+\$nextRelease\s+%}\s*([^]+?)\s*(?:{%\s+else\s+\/%}[^]*?)?{%\s+\/if\s+%}/g;

export function removeNextReleaseConditions(contents: string) {
  // ideally this would be a transform
  // but Markdoc's formatter is experimental and as of the time of writing this
  // doesn't seem to break some of our content
  const newContent = contents.replace(pattern, '$1');

  // this will report usages of variables in case the transform here is broken
  const parsed = Markdoc.parse(newContent);
  const errors = Markdoc.validate(parsed, baseMarkdocConfig);

  return { contents: newContent, errors };
}
