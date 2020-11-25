/** @jsx jsx */

import { forwardRef } from 'react';
import { Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from 'slate-react';
import { applyRefs } from 'apply-ref';

import { jsx } from '@keystone-ui/core';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { HelpCircleIcon } from '@keystone-ui/icons/icons/HelpCircleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';

import { InlineDialog } from './components/inline-dialog';
import { Button, ButtonGroup, Separator } from './components';

const PANEL_TYPES = {
  note: {
    background: '#EBF8FF',
    border: '#90CDF4',
    foreground: '#2C5282',
    icon: InfoIcon,
  },
  alert: {
    background: '#FFF5F5',
    border: '#FEB2B2',
    foreground: '#9B2C2C',
    icon: AlertOctagonIcon,
  },
  tip: {
    background: '#EBF4FF',
    border: '#C3DAFE',
    foreground: '#4C51BF',
    icon: HelpCircleIcon,
  },
  success: {
    background: '#F0FFF4',
    border: '#9AE6B4',
    foreground: '#276749',
    icon: CheckCircleIcon,
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

const PanelTypeSelect = forwardRef<
  HTMLDivElement,
  {
    value: PanelType;
    onChange(value: PanelType): void;
    onRemove(): void;
  }
>(({ value, onChange, onRemove, ...props }, ref) => {
  return (
    <InlineDialog ref={ref} {...props}>
      <ButtonGroup>
        {PANEL_TYPE_KEYS.map(type => {
          const { icon: Icon } = PANEL_TYPES[type];
          return (
            <Tooltip content={titleCase(type)} weight="subtle">
              {attrs => (
                <Button
                  isSelected={type === value}
                  key={type}
                  onMouseDown={event => {
                    event.preventDefault();
                    onChange(type);
                  }}
                  {...attrs}
                >
                  <Icon size="small" />
                </Button>
              )}
            </Tooltip>
          );
        })}
        <Separator />
        <Tooltip content="Remove" weight="subtle">
          {attrs => (
            <Button
              variant="destructive"
              onMouseDown={event => {
                event.preventDefault();
                onRemove();
              }}
              {...attrs}
            >
              <Trash2Icon size="small" />
            </Button>
          )}
        </Tooltip>
      </ButtonGroup>
    </InlineDialog>
  );
});

export const PanelElement = ({
  attributes: { ref, ...attributes },
  children,
  element,
}: RenderElementProps) => {
  const panelTypeKey = PANEL_TYPES[element.panelType as PanelType]
    ? element.panelType
    : DEFAULT_PANEL_TYPE;
  const panelType = PANEL_TYPES[panelTypeKey as PanelType];
  const Icon = panelType.icon;
  const focused = useFocused();
  const selected = useSelected();
  const editor = useSlate();
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: focused && selected,
      onClose: () => {},
    },
    {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  return (
    <div
      ref={applyRefs(ref, trigger.ref)}
      css={{
        alignItems: 'center',
        backgroundColor: panelType.background,
        borderColor: panelType.border,
        borderRadius: 8,
        borderStyle: 'solid',
        borderWidth: 1,
        color: panelType.foreground,
        display: 'flex',
        margin: '8px 0',
        position: 'relative',
      }}
      {...attributes}
      {...trigger.props}
    >
      <div
        contentEditable={false}
        style={{
          userSelect: 'none',
          margin: 12,
          fontSize: 16,
        }}
      >
        <Icon />
      </div>
      <div css={{ width: '100%', paddingRight: 8 }}>{children}</div>
      {focused && selected ? (
        <PanelTypeSelect
          ref={dialog.ref}
          value={panelTypeKey as PanelType}
          onRemove={() => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.removeNodes(editor, { at: path });
          }}
          onChange={value => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { panelType: value }, { at: path });
          }}
          {...dialog.props}
        />
      ) : null}
    </div>
  );
};

// Utils
// ------------------------------

function titleCase(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
