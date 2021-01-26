import React, { ReactNode, useContext } from 'react';
import { Editor, Range, Text } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { DocumentFeatures } from '../views';
import { ComponentBlockContext } from './component-blocks';
import { ComponentBlock } from './component-blocks/api';
import {
  DocumentFeaturesForChildField,
  getChildFieldAtPropPath,
  getDocumentFeaturesForChildField,
} from './component-blocks/utils';
import { LayoutOptionsProvider } from './layouts';
import { isListType } from './lists';
import { DocumentFieldRelationshipsProvider, Relationships } from './relationship';
import { allMarks, isBlockActive, Mark } from './utils';

type BasicToolbarItem = { isSelected: boolean; isDisabled: boolean };

// component blocks are not in the ToolbarState because they're inserted in the closest available place and the selected state is not shown in the toolbar

// note that isDisabled being false here does not mean the action should be allowed
// it means that the action should be allowed if isDisabled is false AND the relevant document feature is enabled
// (because things are hidden if they're not enabled in the editor document features)
export type ToolbarState = {
  textStyles: {
    selected: 'normal' | 1 | 2 | 3 | 4 | 5 | 6;
    allowedHeadingLevels: (1 | 2 | 3 | 4 | 5 | 6)[];
  };
  marks: {
    [key in Mark]: BasicToolbarItem;
  };
  clearFormatting: {
    isDisabled: boolean;
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
  dividers: { isDisabled: boolean };
  code: BasicToolbarItem;
  relationships: { isDisabled: boolean };
  editor: ReactEditor;
  editorDocumentFeatures: DocumentFeatures;
};

const ToolbarStateContext = React.createContext<null | ToolbarState>(null);

export function useToolbarState() {
  const toolbarState = useContext(ToolbarStateContext);
  if (!toolbarState) {
    throw new Error('ToolbarStateProvider must be used to use useToolbarState');
  }
  return toolbarState;
}

export function getAncestorComponentChildFieldDocumentFeatures(
  editor: Editor,
  editorDocumentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>
): DocumentFeaturesForChildField | undefined {
  const ancestorComponentProp = Editor.above(editor, {
    match: n => n.type === 'component-inline-prop' || n.type === 'component-block-prop',
  });

  if (ancestorComponentProp) {
    const propPath = ancestorComponentProp[0].propPath;
    const ancestorComponent = Editor.parent(editor, ancestorComponentProp[1]);
    const component = ancestorComponent[0].component;
    const componentBlock = componentBlocks[component as string];
    if (componentBlock && propPath) {
      const options = getChildFieldAtPropPath(
        propPath as any,
        ancestorComponent[0].props as any,
        componentBlock.props
      )?.options;
      if (options) {
        return getDocumentFeaturesForChildField(editorDocumentFeatures, options);
      }
    }
  }
}

export const createToolbarState = (
  editor: ReactEditor,
  componentBlocks: Record<string, ComponentBlock>,
  editorDocumentFeatures: DocumentFeatures
): ToolbarState => {
  let [headingEntry] = Editor.nodes(editor, {
    match: n => n.type === 'heading',
  });

  let [listEntry] = Editor.nodes(editor, {
    match: n => isListType(n.type as string),
  });

  let [alignableEntry] = Editor.nodes(editor, {
    match: n => n.type === 'paragraph' || n.type === 'heading',
  });

  const isLinkActive = isBlockActive(editor, 'link');

  const locationDocumentFeatures: DocumentFeaturesForChildField = getAncestorComponentChildFieldDocumentFeatures(
    editor,
    editorDocumentFeatures,
    componentBlocks
  ) || {
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
    softBreaks: true,
  };

  let [maybeCodeBlockEntry] = Editor.nodes(editor, {
    match: node => node.type !== 'code' && Editor.isBlock(editor, node),
  });
  const editorMarks = Editor.marks(editor) || {};
  const marks: ToolbarState['marks'] = Object.fromEntries(
    allMarks.map(mark => [
      mark,
      {
        isDisabled:
          (locationDocumentFeatures.inlineMarks !== 'inherit' &&
            !locationDocumentFeatures.inlineMarks[mark]) ||
          !maybeCodeBlockEntry,
        isSelected: !!editorMarks[mark],
      },
    ])
  );

  // Editor.marks is "what are the marks that would be applied if text was inserted now"
  // that's not really the UX we want, if we have some a document like this
  // <paragraph>
  //   <text>
  //     <anchor />
  //     content
  //   </text>
  //   <text bold>bold</text>
  //   <text>
  //     content
  //     <focus />
  //   </text>
  // </paragraph>

  // we want bold to be shown as selected even though if you inserted text from that selection, it wouldn't be bold
  // so we look at all the text nodes in the selection to get their marks
  for (const node of Editor.nodes(editor, { match: Text.isText })) {
    for (const key of Object.keys(node[0])) {
      if (key === 'insertMenu' || key === 'text') {
        continue;
      }
      if (key in marks) {
        marks[key as Mark].isSelected = true;
      }
    }
  }

  return {
    marks,
    textStyles: {
      selected: headingEntry ? (headingEntry[0].level as any) : 'normal',
      allowedHeadingLevels:
        locationDocumentFeatures.kind === 'block' && !listEntry
          ? locationDocumentFeatures.documentFeatures.formatting.headingLevels
          : [],
    },
    relationships: { isDisabled: !locationDocumentFeatures.documentFeatures.relationships },
    code: {
      isSelected: isBlockActive(editor, 'code'),
      isDisabled: !(
        locationDocumentFeatures.kind === 'block' &&
        locationDocumentFeatures.documentFeatures.formatting.blockTypes.code
      ),
    },
    lists: {
      ordered: {
        isSelected: isBlockActive(editor, 'ordered-list'),
        isDisabled: !(
          locationDocumentFeatures.kind === 'block' &&
          locationDocumentFeatures.documentFeatures.formatting.listTypes.ordered &&
          !headingEntry
        ),
      },
      unordered: {
        isSelected: isBlockActive(editor, 'unordered-list'),
        isDisabled: !(
          locationDocumentFeatures.kind === 'block' &&
          locationDocumentFeatures.documentFeatures.formatting.listTypes.unordered &&
          !headingEntry
        ),
      },
    },
    alignment: {
      isDisabled:
        !alignableEntry &&
        !(
          locationDocumentFeatures.kind === 'block' &&
          locationDocumentFeatures.documentFeatures.formatting.alignment
        ),
      selected: alignableEntry ? (alignableEntry[0].textAlign as any) || 'start' : 'start',
    },
    blockquote: {
      isDisabled: !(
        locationDocumentFeatures.kind === 'block' &&
        locationDocumentFeatures.documentFeatures.formatting.blockTypes.blockquote
      ),
      isSelected: isBlockActive(editor, 'blockquote'),
    },
    layouts: { isSelected: isBlockActive(editor, 'layout') },
    links: {
      isDisabled:
        !editor.selection ||
        Range.isCollapsed(editor.selection) ||
        !locationDocumentFeatures.documentFeatures.links,
      isSelected: isLinkActive,
    },
    editor,
    dividers: {
      isDisabled:
        locationDocumentFeatures.kind === 'inline' ||
        !locationDocumentFeatures.documentFeatures.dividers,
    },
    clearFormatting: {
      isDisabled: !(
        Object.values(marks).some(x => x.isSelected) ||
        !!hasBlockThatClearsOnClearFormatting(editor)
      ),
    },
    editorDocumentFeatures,
  };
};

function hasBlockThatClearsOnClearFormatting(editor: Editor) {
  const [node] = Editor.nodes(editor, {
    match: node => node.type === 'heading' || node.type === 'code' || node.type === 'blockquote',
  });
  return !!node;
}

export const ToolbarStateProvider = ({
  children,
  componentBlocks,
  editorDocumentFeatures,
  relationships,
}: {
  children: ReactNode;
  componentBlocks: Record<string, ComponentBlock>;
  editorDocumentFeatures: DocumentFeatures;
  relationships: Relationships;
}) => {
  const editor = useSlate();

  return (
    <DocumentFieldRelationshipsProvider value={relationships}>
      <LayoutOptionsProvider value={editorDocumentFeatures.layouts}>
        <ComponentBlockContext.Provider value={componentBlocks}>
          <ToolbarStateContext.Provider
            value={createToolbarState(editor, componentBlocks, editorDocumentFeatures)}
          >
            {children}
          </ToolbarStateContext.Provider>
        </ComponentBlockContext.Provider>
      </LayoutOptionsProvider>
    </DocumentFieldRelationshipsProvider>
  );
};
