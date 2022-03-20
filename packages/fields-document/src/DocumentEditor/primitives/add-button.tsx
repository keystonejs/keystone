/** @jsxRuntime classic */
/** @jsx jsx */
import { Button } from '@keystone-ui/button';
import { Box, jsx, Stack } from '@keystone-ui/core';
import { PlusCircleIcon } from '@keystone-ui/icons/icons/PlusCircleIcon';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';
import { useSelect } from 'downshift';

export function AddButton<Value extends string>(props: {
  options: readonly { label: string; value: Value }[];
  onInsert: (initialValue: Value extends any ? { discriminant: Value } : never) => void;
}) {
  const { dialog, trigger, isOpen, setOpen } = usePopover({
    modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
  });

  const { getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex } = useSelect<{
    label: string;
    value: Value;
  }>({
    items: props.options as typeof props.options[number][],
    itemToString: x => x?.label ?? '',
    selectedItem: null,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        props.onInsert({ discriminant: selectedItem.value } as any);
      }
    },
    onIsOpenChange: ({ isOpen }) => {
      setOpen(!!isOpen);
    },
    isOpen,
  });
  return (
    <div>
      <Button
        {...getToggleButtonProps({
          ref: trigger.ref,
          ...trigger.props,
        })}
        tone="active"
        weight="bold"
      >
        <span css={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <PlusCircleIcon size="smallish" /> <span>Add</span>
        </span>
      </Button>
      <PopoverDialog isVisible={isOpen}>
        <button />
        <Stack
          {...getMenuProps({ ref: dialog.ref, ...dialog.props })}
          gap="xsmall"
          paddingY="small"
          paddingX="small"
          background="white"
          css={{
            minWidth: 120,
            boxShadow: '0px 8px 11px -2px rgba(9, 30, 66, 0.12), 0px 0px 1px rgba(9, 30, 66, 0.31)',
            borderRadius: 8,
            listStyle: 'none',
          }}
        >
          {props.options.map((option, i) => {
            return (
              <Box
                key={option.value}
                {...getItemProps({ item: option, index: i, role: 'menuitem' })}
                css={{
                  cursor: 'pointer',
                  backgroundColor: highlightedIndex === i ? '#F6F8FC' : '',
                  borderRadius: 4,
                }}
                paddingX="medium"
                paddingY="small"
              >
                {option.label}
              </Box>
            );
          })}
        </Stack>
      </PopoverDialog>
    </div>
  );
}
