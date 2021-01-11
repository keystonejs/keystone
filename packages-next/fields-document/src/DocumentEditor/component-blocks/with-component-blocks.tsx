import { ReactEditor } from 'slate-react';
import { Editor, Element, Transforms, Range, NodeEntry, Path, Node, Text } from 'slate';

import { ChildField, ComponentBlock } from '../../component-blocks';
import { moveChildren } from '../utils';
import {
  DocumentFeaturesForChildField,
  findChildPropPaths,
  getDocumentFeaturesForChildField,
  VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP,
} from './utils';
import { DocumentFeatures } from '../../views';
import {
  normalizeElementBasedOnDocumentFeatures,
  normalizeInlineBasedOnLinksAndRelationships,
  normalizeTextBasedOnInlineMarksAndSoftBreaks,
} from '../document-features-normalization';
import weakMemoize from '@emotion/weak-memoize';
import { Relationships } from '../relationship';

function getAncestorComponentBlock(
  editor: ReactEditor
):
  | { isInside: false }
  | { isInside: true; componentBlock: NodeEntry<Element>; prop: NodeEntry<Element> } {
  if (editor.selection) {
    const ancestorEntry = Editor.above(editor, {
      match: node => Editor.isBlock(editor, node) && node.type !== 'paragraph',
    });
    if (
      ancestorEntry &&
      (ancestorEntry[0].type === 'component-block-prop' ||
        ancestorEntry[0].type === 'component-inline-prop')
    ) {
      return {
        isInside: true,
        componentBlock: Editor.parent(editor, ancestorEntry[1]),
        prop: ancestorEntry,
      };
    }
  }
  return { isInside: false };
}

const alreadyNormalizedThings: WeakMap<
  DocumentFeaturesForChildField,
  WeakSet<Node>
> = new WeakMap();

function normalizeNodeWithinComponentProp(
  [node, path]: NodeEntry,
  editor: ReactEditor,
  fieldOptions: DocumentFeaturesForChildField,
  relationships: Relationships
): boolean {
  let alreadyNormalizedNodes = alreadyNormalizedThings.get(fieldOptions);
  if (!alreadyNormalizedNodes) {
    alreadyNormalizedNodes = new WeakSet();
    alreadyNormalizedThings.set(fieldOptions, alreadyNormalizedNodes);
  }
  if (alreadyNormalizedNodes.has(node)) {
    return false;
  }
  let didNormalization = false;
  if (fieldOptions.inlineMarks !== 'inherit' && Text.isText(node)) {
    didNormalization = normalizeTextBasedOnInlineMarksAndSoftBreaks(
      [node, path],
      editor,
      fieldOptions.inlineMarks,
      fieldOptions.softBreaks
    );
  }
  if (Element.isElement(node)) {
    let childrenHasChanged = node.children
      .map((node, i) =>
        normalizeNodeWithinComponentProp([node, [...path, i]], editor, fieldOptions, relationships)
      )
      // .map then .some because we don't want to exit early
      .some(x => x);
    if (fieldOptions.kind === 'block') {
      didNormalization =
        normalizeElementBasedOnDocumentFeatures(
          [node, path],
          editor,
          fieldOptions.documentFeatures,
          relationships
        ) || childrenHasChanged;
    } else {
      didNormalization = normalizeInlineBasedOnLinksAndRelationships(
        [node, path],
        editor,
        fieldOptions.documentFeatures.links,
        fieldOptions.documentFeatures.relationships,
        relationships
      );
    }
  }

  if (didNormalization === false) {
    alreadyNormalizedNodes.add(node);
  }
  return didNormalization;
}

export function withComponentBlocks(
  blockComponents: Record<string, ComponentBlock | undefined>,
  editorDocumentFeatures: DocumentFeatures,
  relationships: Relationships,
  editor: ReactEditor
) {
  // note that conflicts between the editor document features
  // and the child field document features are dealt with elsewhere
  const memoizedGetDocumentFeaturesForChildField = weakMemoize(
    (options: ChildField['options']): DocumentFeaturesForChildField => {
      return getDocumentFeaturesForChildField(editorDocumentFeatures, options);
    }
  );
  const { normalizeNode, deleteBackward, insertBreak } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const ancestorComponentBlock = getAncestorComponentBlock(editor);
      if (
        ancestorComponentBlock.isInside &&
        Range.isCollapsed(editor.selection) &&
        Editor.isStart(editor, editor.selection.anchor, ancestorComponentBlock.prop[1]) &&
        ancestorComponentBlock.prop[1][ancestorComponentBlock.prop[1].length - 1] === 0
      ) {
        Transforms.unwrapNodes(editor, { at: ancestorComponentBlock.componentBlock[1] });
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.insertBreak = () => {
    const ancestorComponentBlock = getAncestorComponentBlock(editor);
    if (editor.selection && ancestorComponentBlock.isInside) {
      const {
        prop: [componentPropNode, componentPropPath],
        componentBlock: [componentBlockNode, componentBlockPath],
      } = ancestorComponentBlock;
      const isLastProp =
        componentPropPath[componentPropPath.length - 1] === componentBlockNode.children.length - 1;

      if (componentPropNode.type === 'component-block-prop') {
        const [[paragraphNode, paragraphPath]] = Editor.nodes(editor, {
          match: node => node.type === 'paragraph',
        });
        const isLastParagraph =
          paragraphPath[paragraphPath.length - 1] === componentPropNode.children.length - 1;
        if (Node.string(paragraphNode) === '' && isLastParagraph) {
          if (isLastProp) {
            Transforms.moveNodes(editor, {
              at: paragraphPath,
              to: Path.next(ancestorComponentBlock.componentBlock[1]),
            });
          } else {
            // TODO: this goes to the start of the next block, is that right?
            // should we just insertBreak always here?
            Transforms.move(editor, { distance: 1, unit: 'line' });
            Transforms.removeNodes(editor, { at: paragraphPath });
          }
          return;
        }
      }
      if (componentPropNode.type === 'component-inline-prop') {
        Editor.withoutNormalizing(editor, () => {
          Transforms.splitNodes(editor, { always: true });
          const splitNodePath = Path.next(componentPropPath);
          if (isLastProp) {
            Transforms.moveNodes(editor, {
              at: splitNodePath,
              to: Path.next(componentBlockPath),
            });
          } else {
            moveChildren(editor, splitNodePath, [...Path.next(splitNodePath), 0]);
            Transforms.removeNodes(editor, { at: splitNodePath });
          }
        });
        return;
      }
    }
    insertBreak();
  };

  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (Element.isElement(node) || Editor.isEditor(node)) {
      if (
        node.type === 'component-inline-prop' &&
        node.propPath &&
        (node.propPath as any).length === 1 &&
        (node.propPath as any)[0] === VOID_BUT_NOT_REALLY_COMPONENT_INLINE_PROP &&
        (node.children.length !== 1 ||
          !Text.isText(node.children[0]) ||
          node.children[0].text !== '')
      ) {
        Transforms.removeNodes(editor, {
          at: path,
        });
        return;
      }

      if (Element.isElement(node) && node.type === 'component-block') {
        const componentBlock = blockComponents[node.component as string];
        if (componentBlock) {
          let missingKeys = new Map(
            findChildPropPaths(node.props as any, componentBlock.props).map(x => [
              JSON.stringify(x.path),
              x.options.kind,
            ])
          );

          node.children.forEach(node => {
            missingKeys.delete(JSON.stringify(node.propPath));
          });
          if (missingKeys.size) {
            Transforms.insertNodes(
              editor,
              [...missingKeys].map(([prop, kind]) => ({
                type: `component-${kind}-prop`,
                propPath: JSON.parse(prop),
                children: [{ text: '' }],
              })),
              { at: [...path, node.children.length] }
            );
            return;
          }

          let foundProps = new Set<string>();

          let stringifiedInlinePropPaths: Record<
            string,
            { options: ChildField['options']; index: number } | undefined
          > = {};
          findChildPropPaths(
            node.props as any,
            blockComponents[node.component as string]!.props
          ).forEach((x, index) => {
            stringifiedInlinePropPaths[JSON.stringify(x.path)] = { options: x.options, index };
          });

          for (const [index, childNode] of node.children.entries()) {
            if (
              // children that are not these will be handled by
              // the generic allowedChildren normalization
              childNode.type === 'component-inline-prop' ||
              childNode.type === 'component-block-prop'
            ) {
              const childPath = [...path, index];
              const stringifiedPropPath = JSON.stringify(childNode.propPath);
              if (stringifiedInlinePropPaths[stringifiedPropPath] === undefined) {
                Transforms.removeNodes(editor, { at: childPath });
                return;
              } else {
                if (foundProps.has(stringifiedPropPath)) {
                  Transforms.removeNodes(editor, { at: childPath });
                  return;
                }
                foundProps.add(stringifiedPropPath);
                const propInfo = stringifiedInlinePropPaths[stringifiedPropPath]!;
                const expectedIndex = propInfo.index;
                if (index !== expectedIndex) {
                  Transforms.moveNodes(editor, { at: childPath, to: [...path, expectedIndex] });
                  return;
                }
                const expectedChildNodeType = `component-${propInfo.options.kind}-prop`;
                if (childNode.type !== expectedChildNodeType) {
                  Transforms.setNodes(editor, { type: expectedChildNodeType }, { at: childPath });
                  return;
                }
                const documentFeatures = memoizedGetDocumentFeaturesForChildField(propInfo.options);
                if (
                  normalizeNodeWithinComponentProp(
                    [childNode, childPath],
                    editor,
                    documentFeatures,
                    relationships
                  )
                ) {
                  return;
                }
              }
            }
          }
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
}
