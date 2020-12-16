/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { AlignLeftIcon } from '@keystone-ui/icons/icons/AlignLeftIcon';
import { AlignRightIcon } from '@keystone-ui/icons/icons/AlignRightIcon';
import { AlignCenterIcon } from '@keystone-ui/icons/icons/AlignCenterIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { useControlledPopover } from '@keystone-ui/popover';
import { Tooltip } from '@keystone-ui/tooltip';
import { applyRefs } from 'apply-ref';
import { useState, useCallback, memo } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { DocumentFeatures } from '../views';
import { InlineDialog, ToolbarButton, ToolbarGroup } from './primitives';

export const TextAlignMenu = ({ alignment }: { alignment: DocumentFeatures['alignment'] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const editor = useSlate();
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

  const [currentParagraph] = Editor.nodes(editor, {
    match: node => node.type === 'paragraph',
  });
  const alignmentAllowed = !!currentParagraph;
  const currentTextAlign: 'start' | 'center' | 'end' =
    ((currentParagraph && currentParagraph[0] && currentParagraph[0].textAlign) as any) || 'start';

  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <TextAlignButton
        alignmentAllowed={alignmentAllowed}
        currentTextAlign={currentTextAlign}
        onToggle={useCallback(() => {
          setShowMenu(x => !x);
        }, [])}
        trigger={trigger}
        showMenu={showMenu}
      />
      {showMenu ? (
        <InlineDialog ref={dialog.ref} {...dialog.props}>
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
                    }}
                    {...attrs}
                  >
                    {alignmentIcons.end}
                  </ToolbarButton>
                )}
              </Tooltip>
            )}
          </ToolbarGroup>
        </InlineDialog>
      ) : null}
    </div>
  );
};

const alignmentIcons = {
  start: <AlignLeftIcon size="small" />,
  center: <AlignCenterIcon size="small" />,
  end: <AlignRightIcon size="small" />,
};

const TextAlignButton = memo(function TextAlignButton({
  currentTextAlign,
  alignmentAllowed,
  trigger,
  showMenu,
  onToggle,
}: {
  currentTextAlign: 'start' | 'center' | 'end';
  alignmentAllowed: boolean;
  onToggle: () => void;
  trigger: ReturnType<typeof useControlledPopover>['trigger'];
  showMenu: boolean;
}) {
  return (
    <Tooltip content="Text alignment" weight="subtle">
      {({ ref, ...attrs }) => (
        <ToolbarButton
          ref={applyRefs(ref, trigger.ref)}
          isDisabled={!alignmentAllowed}
          isPressed={showMenu}
          onClick={event => {
            event.preventDefault();
            onToggle();
          }}
          {...attrs}
          {...trigger.props}
        >
          {alignmentIcons[currentTextAlign]}
          <ChevronDownIcon size="small" />
        </ToolbarButton>
      )}
    </Tooltip>
  );
});
