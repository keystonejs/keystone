/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';

import { Button } from './components';

const PANEL_TYPES = {
  note: {
    background: '#EBF8FF',
    border: '#90CDF4',
    foreground: '#2C5282',
    icon: '👋',
  },
  alert: {
    background: '#FFF5F5',
    border: '#FEB2B2',
    foreground: '#9B2C2C',
    icon: '🚨',
  },
  tip: {
    background: '#EBF4FF',
    border: '#C3DAFE',
    foreground: '#4C51BF',
    icon: '💎',
  },
  success: {
    background: '#F0FFF4',
    border: '#9AE6B4',
    foreground: '#276749',
    icon: '✅',
  },
};
type PanelType = keyof typeof PANEL_TYPES;

const PANEL_TYPE_KEYS = Object.keys(PANEL_TYPES) as PanelType[];
const DEFAULT_PANEL_TYPE = PANEL_TYPE_KEYS[0];

export const insertPanel = (editor: ReactEditor) => {
  Transforms.wrapNodes(
    editor,
    {
      type: 'panel',
      panelType: DEFAULT_PANEL_TYPE,
      children: [],
    },
    { match: node => node.type === 'paragraph' }
  );
};

function getDirectPanelParentFromSelection(editor: ReactEditor) {
  if (!editor.selection) return { isInside: false } as const;
  const [, parentPath] = Editor.parent(editor, editor.selection);
  const [maybePanelParent, maybePanelParentPath] = Editor.parent(editor, parentPath);
  const isPanel = maybePanelParent.type === 'panel';
  return isPanel
    ? ({ isInside: true, path: maybePanelParentPath } as const)
    : ({ isInside: false } as const);
}

export const withPanel = (editor: ReactEditor) => {
  const { insertBreak, deleteBackward } = editor;
  editor.deleteBackward = unit => {
    if (editor.selection) {
      const parentPanel = getDirectPanelParentFromSelection(editor);
      if (
        parentPanel.isInside &&
        Range.isCollapsed(editor.selection) &&
        // the selection is at the start of the paragraph
        editor.selection.anchor.offset === 0 &&
        // it's the first paragraph in the panel
        editor.selection.anchor.path[editor.selection.anchor.path.length - 2] === 0
      ) {
        Transforms.unwrapNodes(editor, { at: parentPanel.path });
        return;
      }
    }
    deleteBackward(unit);
  };
  editor.insertBreak = () => {
    const panel = getDirectPanelParentFromSelection(editor);
    if (editor.selection && panel.isInside) {
      const [node, nodePath] = Editor.node(editor, editor.selection);
      if (Path.isDescendant(nodePath, panel.path) && Node.string(node) === '') {
        Transforms.unwrapNodes(editor, {
          match: node => node.type === 'panel',
          split: true,
        });
        return;
      }
    }
    insertBreak();
  };
  return editor;
};

const PanelTypeSelect = ({
  value,
  onChange,
  onRemove,
}: {
  value: PanelType;
  onChange(value: PanelType): void;
  onRemove(): void;
}) => {
  return (
    <div
      css={{
        position: 'absolute',
        bottom: -32,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        contentEditable={false}
        css={{
          userSelect: 'none',
          marginTop: 8,
          padding: 6,
          background: 'white',
          borderRadius: 6,
          paddingLeft: 10,
          border: '1px solid rgba(0, 0, 0, 0.3)',
          boxShadow: `
  0 2.4px 10px rgba(0, 0, 0, 0.09),
  0 19px 80px rgba(0, 0, 0, 0.18)`,
        }}
      >
        {PANEL_TYPE_KEYS.map(type => (
          <Button
            isSelected={type === value}
            key={type}
            onMouseDown={event => {
              event.preventDefault();
              onChange(type);
            }}
          >
            {type}
          </Button>
        ))}
        <Button
          onMouseDown={event => {
            event.preventDefault();
            onRemove();
          }}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export const PanelElement = ({ attributes, children, element }: RenderElementProps) => {
  const panelTypeKey = PANEL_TYPES[element.panelType as PanelType]
    ? element.panelType
    : DEFAULT_PANEL_TYPE;
  const panelType = PANEL_TYPES[panelTypeKey as PanelType];
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  return (
    <div
      css={{
        margin: '8px 0',
        borderColor: panelType.border,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: panelType.background,
        color: panelType.foreground,
        display: 'flex',
        position: 'relative',
      }}
      {...attributes}
    >
      <div
        contentEditable={false}
        style={{
          userSelect: 'none',
          margin: 12,
          fontSize: 16,
        }}
      >
        {panelType.icon}
      </div>
      <div css={{ width: '100%', paddingRight: 8 }}>{children}</div>
      {focused && selected ? (
        <PanelTypeSelect
          value={panelTypeKey as PanelType}
          onRemove={() => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.removeNodes(editor, { at: path });
          }}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { panelType: value }, { at: path });
          }}
        />
      ) : null}
    </div>
  );
};
