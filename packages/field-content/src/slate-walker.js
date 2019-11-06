import { identity } from '@keystonejs/utils';
const noop = () => {};

// A depth-first, top-down tree walking algorithm.
function visitNode(node, visitors) {
  const recurse = childNode => visitNode(childNode, visitors);
  let visitedNode = null;

  // Registered visitors might serialise a node.
  // If they do, it's their responsibility to also serialise all the child
  // nodes.
  // If they don't, they return falsey and we pass it to the default visitor to
  // handle.
  switch (node.object) {
    case 'document': {
      visitedNode = visitors.visitDocument(node, recurse);
      break;
    }
    case 'block': {
      visitedNode = visitors.visitBlock(node, recurse);
      break;
    }
    case 'inline': {
      visitedNode = visitors.visitInline(node, recurse);
      break;
    }
    case 'text': {
      visitedNode = visitors.visitText(node, recurse);
      break;
    }
    default: {
      throw new Error(`Encountered unknown type '${node.object}' in Slate document`);
    }
  }

  // The node (and children) weren't serialised, so we'll use the default JSON
  // for this node, and recurse onto the child nodes.
  if (!visitedNode) {
    visitedNode = visitors.defaultVisitor(node, recurse);
  }

  return visitedNode;
}

export function walkSlateNode(
  node,
  // visitors should return a JSON representation of the node and its
  // children, or return nothing to continue walking the tree.
  {
    visitDocument = noop,
    visitBlock = noop,
    visitInline = noop,
    visitText = noop,
    defaultVisitor = identity,
  }
) {
  return visitNode(node, {
    visitDocument,
    visitBlock,
    visitInline,
    visitText,
    defaultVisitor,
  });
}
