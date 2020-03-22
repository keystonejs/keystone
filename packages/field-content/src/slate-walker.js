/**
 * A simple recursive walker for Slate.js documents.
 * @param {Array} nodes - An array of Slate.js nodes.
 * @param {Function} visitor - A visitor function to call on every node.
 * Takes the current node as a parameter and should return either the input or a mutated node.
 * @returns The mutated node array.
 */
export const walkSlateTree = (nodes, visitor) => {
  if (!visitor) {
    throw new Error('walkSlateTree requires a visitor function');
  }

  const visit = parentNode => {
    // Apply visitor
    const res = visitor(parentNode);

    // Recurse into children
    if (res.children) {
      res.children.map(childNode => visit(childNode, visitor));
    }

    return res;
  };

  return nodes.map(n => visit(n));
};
