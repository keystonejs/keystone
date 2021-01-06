import React, { ReactNode, useContext, useMemo } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { DocumentFeatures } from '../views';
import { ComponentBlock } from './component-blocks/api';
import {
  DocumentFeaturesForChildField,
  findChildPropPaths,
  getDocumentFeaturesForChildField,
} from './component-blocks/utils';
import { getAncestorComponentBlock } from './component-blocks/with-component-blocks';
import { areArraysEqual } from './document-features-normalization';
import { allMarks, isBlockActive, Mark } from './utils';

type BasicToolbarItem = { isSelected: boolean; isDisabled: boolean };

// divider and component blocks are not here at all becuase they're inserted and the selected state is not shown in the toolbar

// note that isDisabled being false here does not mean the action should be allowed
// it means that the action should be allowed if isDisabled is false AND the relevant document feature is enabled
// (because things are hidden if they're not enabled in the editor document features)
export type ToolbarState = {
  textStyles: {
    selected: 'normal' | 1 | 2 | 3 | 4 | 5 | 6;
    isDisabled: boolean;
  };
  marks: {
    [key in Mark]: BasicToolbarItem;
  };
  alignment: {
    selected: 'start' | 'center' | 'end';
    isDisabled: boolean;
  };
  lists: { ordered: BasicToolbarItem; unordered: BasicToolbarItem };
  links: BasicToolbarItem;
  blockquote: BasicToolbarItem;
  // note that layouts can't be disabled because they are inserted
  // so they will be inserted to the closest valid location
  // unlike the other things here which wrap elements
  layouts: { isSelected: boolean };
  code: { isDisabled: boolean };
  relationships: { isDisabled: boolean };
  editor: ReactEditor;
};

const ToolbarStateContext = React.createContext<null | ToolbarState>(null);

export function useToolbarState() {
  const toolbarState = useContext(ToolbarStateContext);
  if (!toolbarState) {
    throw new Error('ToolbarStateProvider must be used to use useToolbarState');
  }
  return toolbarState;
}

export const ToolbarStateProvider = ({
  children,
  componentBlocks,
  editorDocumentFeatures,
}: {
  children: ReactNode;
  componentBlocks: Record<string, ComponentBlock>;
  editorDocumentFeatures: DocumentFeatures;
}) => {
  const editor = useSlate();
  const editorMarks = Editor.marks(editor) || {};
  const marks: ToolbarState['marks'] = Object.fromEntries(
    allMarks.map(mark => [mark, { isDisabled: false, isSelected: !!editorMarks[mark] }])
  );
  let [headingEntry] = Editor.nodes(editor, {
    match: n => n.type === 'heading',
  });

  let [alignableEntry] = Editor.nodes(editor, {
    match: n => n.type === 'paragraph' || n.type === 'heading',
  });

  const isLinkActive = isBlockActive(editor, 'link');

  let locationDocumentFeatures: DocumentFeaturesForChildField = useMemo(
    () => ({
      kind: 'block',
      inlineMarks: 'inherit',
      documentFeatures: {
        dividers: true,
        formatting: {
          alignment: { center: true, end: true },
          blockTypes: { blockquote: true, code: true },
          headingLevels: [1, 2, 3, 4, 5, 6],
          listTypes: { ordered: true, unordered: true },
        },
        layouts: editorDocumentFeatures.layouts,
        links: true,
        relationships: true,
      },
    }),
    [editorDocumentFeatures]
  );

  //   const ancestorComponentBlock = getAncestorComponentBlock(editor);
  //   if (ancestorComponentBlock.isInside) {
  //     const propPath = ancestorComponentBlock.prop[0].propPath;
  //     const component = ancestorComponentBlock.componentBlock[0].component;
  //     const componentBlock = componentBlocks[component as string];
  //     if (componentBlock) {
  //       // TODO: implement this more efficiently
  //       const options = findChildPropPaths(
  //         ancestorComponentBlock.componentBlock[0],
  //         componentBlock.props
  //       ).find(({ path }) => areArraysEqual(path, propPath as any))?.options;
  //       if (options) {
  //         locationDocumentFeatures = getDocumentFeaturesForChildField(
  //           editorDocumentFeatures,
  //           options
  //         );
  //       }
  //     }
  //   }

  const state: ToolbarState = {
    marks,
    textStyles: {
      selected: headingEntry ? (headingEntry[0].level as any) : 'normal',
      isDisabled: false,
    },
    relationships: { isDisabled: false },
    code: { isDisabled: false },
    lists: {
      ordered: { isSelected: isBlockActive(editor, 'ordered-list'), isDisabled: false },
      unordered: { isSelected: isBlockActive(editor, 'ordered-list'), isDisabled: false },
    },
    alignment: {
      isDisabled: !alignableEntry,
      selected: alignableEntry ? (alignableEntry[0].textAlign as any) || 'start' : 'start',
    },
    blockquote: { isDisabled: false, isSelected: isBlockActive(editor, 'blockquote') },
    layouts: { isSelected: isBlockActive(editor, 'layout') },
    links: {
      isDisabled: !isLinkActive && (!editor.selection || Range.isCollapsed(editor.selection)),
      isSelected: isLinkActive,
    },
    editor,
  };
  return <ToolbarStateContext.Provider value={state}>{children}</ToolbarStateContext.Provider>;
};
