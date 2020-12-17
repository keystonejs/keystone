/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { AlignLeftIcon } from '@keystone-ui/icons/icons/AlignLeftIcon';
import { AlignRightIcon } from '@keystone-ui/icons/icons/AlignRightIcon';
import { AlignCenterIcon } from '@keystone-ui/icons/icons/AlignCenterIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { applyRefs } from 'apply-ref';
import { useState, ComponentProps, useMemo } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { DocumentFeatures } from '../views';
import { InlineDialog, ToolbarButton, ToolbarGroup } from './primitives';

export const TextAlignMenu = ({ alignment }: { alignment: DocumentFeatures['alignment'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { dialog, trigger } = useControlledPopover(
    {
      isOpen: showMenu,
      onClose: () => setShowMenu(false),
    },
    {
      placement: 'bottom-start',
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
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tooltip content="Text alignment" weight="subtle">
        {attrs => (
          <TextAlignButton
            attrs={attrs}
            onToggle={() => {
              setShowMenu(x => !x);
            }}
            trigger={trigger}
            showMenu={showMenu}
          />
        )}
      </Tooltip>
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
          <TextAlignDialog
            alignment={alignment}
            onClose={() => {
              setShowMenu(false);
            }}
          />
        </InlineDialog>
      ) : null}
    </div>
  );
};

function TextAlignDialog({
  alignment,
  onClose,
}: {
  alignment: DocumentFeatures['alignment'];
  onClose: () => void;
}) {
  const { currentTextAlign, editor } = useTextAlignInfo();
  return (
    <ToolbarGroup>
      <Tooltip content="Align start" weight="subtle">
        {attrs => (
          <ToolbarButton
            isSelected={currentTextAlign === 'start'}
            onMouseDown={event => {
              event.preventDefault();
              Transforms.unsetNodes(editor, 'textAlign', {
                match: node => node.type === 'paragraph',
              });
              onClose();
            }}
            {...attrs}
          >
            {alignmentIcons.start}
          </ToolbarButton>
        )}
      </Tooltip>
      {alignment.center && (
        <Tooltip content="Align center" weight="subtle">
          {attrs => (
            <ToolbarButton
              isSelected={currentTextAlign === 'center'}
              onMouseDown={event => {
                event.preventDefault();
                Transforms.setNodes(
                  editor,
                  { textAlign: 'center' },
                  {
                    match: node => node.type === 'paragraph',
                  }
                );
                onClose();
              }}
              {...attrs}
            >
              {alignmentIcons.center}
            </ToolbarButton>
          )}
        </Tooltip>
      )}
      {alignment.end && (
        <Tooltip content="Align end" weight="subtle">
          {attrs => (
            <ToolbarButton
              isSelected={currentTextAlign === 'end'}
              onMouseDown={event => {
                event.preventDefault();
                Transforms.setNodes(
                  editor,
                  { textAlign: 'end' },
                  {
                    match: node => node.type === 'paragraph',
                  }
                );
                onClose();
              }}
              {...attrs}
            >
              {alignmentIcons.end}
            </ToolbarButton>
          )}
        </Tooltip>
      )}
    </ToolbarGroup>
  );
}

const alignmentIcons = {
  start: <AlignLeftIcon size="small" />,
  center: <AlignCenterIcon size="small" />,
  end: <AlignRightIcon size="small" />,
};

function useTextAlignInfo() {
  const editor = useSlate();
  const [currentParagraph] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  const alignmentAllowed = !!currentParagraph;
  const currentTextAlign: 'start' | 'center' | 'end' =
    ((currentParagraph && currentParagraph[0] && currentParagraph[0].textAlign) as any) || 'start';

  return { alignmentAllowed, currentTextAlign, editor };
}

function TextAlignButton(props: {
  onToggle: () => void;
  trigger: ReturnType<typeof useControlledPopover>['trigger'];
  showMenu: boolean;
  attrs: Parameters<ComponentProps<typeof Tooltip>['children']>[0];
}) {
  const { alignmentAllowed, currentTextAlign } = useTextAlignInfo();
  return useMemo(
    () => (
      <ToolbarButton
        isDisabled={!alignmentAllowed}
        isPressed={props.showMenu}
        onClick={event => {
          event.preventDefault();
          props.onToggle();
        }}
        {...props.attrs}
        {...props.trigger.props}
        ref={applyRefs(props.attrs.ref, props.trigger.ref)}
      >
        {alignmentIcons[currentTextAlign]}
        {downIcon}
      </ToolbarButton>
    ),
    [alignmentAllowed, currentTextAlign, props]
  );
}

const downIcon = <ChevronDownIcon size="small" />;
