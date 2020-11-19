/** @jsx jsx */
import React, { useRef, forwardRef, ButtonHTMLAttributes, ReactElement, useEffect } from 'react';
import { jsx, useForkedRef } from '@keystone-ui/core';
import { useCollectionFocus } from './useCollectionFocus';
import { Button, ButtonProps } from '@keystone-ui/button';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';
import { Menu } from './Menu';
import { ChevronUpIcon } from '@keystone-ui/icons/icons/ChevronUpIcon';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';

// Button
// ------------------------------

const DropdownButton = forwardRef<any, ButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      type="button"
      {...props}
      iconAfter={props.isSelected ? ChevronUpIcon : ChevronDownIcon}
    />
  );
});

// Menu
// ------------------------------

const alignment = {
  left: 'bottom-start',
  right: 'bottom-end',
} as const;

type TriggerRendererType = (options: {
  isOpen: boolean;
  triggerProps: ButtonHTMLAttributes<HTMLButtonElement>;
}) => ReactElement;

type DropdownMenuProps = {
  align?: keyof typeof alignment;
  trigger: string | TriggerRendererType;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  trigger,
  align = 'left',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalTriggerRef = useRef<HTMLElement>();
  const { isOpen, setOpen, dialog, trigger: popoverTrigger, arrow } = usePopover({
    placement: alignment[align],
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  // handle focus
  // NOTE: we should close the popover if the user tabs outside the dropdown menu
  useCollectionFocus({
    containerRef: containerRef as any,
    direction: 'vertical',
    targetRoles: ['menuitem', 'menuitemradio', 'menuitemcheckbox'],
    listenWhen: isOpen,
    onSelect: () => setOpen(false),
  });

  // focus the target element on close
  useEffect(() => {
    let trigger = internalTriggerRef.current;
    if (isOpen) {
      return () => {
        trigger?.focus();
      };
    }
  }, [isOpen]);

  // trigger UI
  const forkedTriggerRef = useForkedRef(internalTriggerRef, popoverTrigger.ref);
  const triggerProps = {
    ref: forkedTriggerRef,
    onClick: () => setOpen(s => !s),
    ...popoverTrigger.props,
  };
  const triggerElement =
    typeof trigger === 'function' ? (
      trigger({ isOpen, triggerProps })
    ) : (
      <DropdownButton isSelected={isOpen} {...triggerProps}>
        {trigger}
      </DropdownButton>
    );

  return (
    <div>
      {triggerElement}
      <PopoverDialog ref={dialog.ref} {...dialog.props} isVisible={isOpen} arrow={arrow}>
        <Menu ref={containerRef}>{children}</Menu>
      </PopoverDialog>
    </div>
  );
};
