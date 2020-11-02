/** @jsx jsx */
import { ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Divider, Heading, jsx, Stack } from '@keystone-ui/core';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { Options } from '@keystone-ui/options';
import { PopoverDialog, usePopover } from '@keystone-ui/popover';
import { Fragment } from 'react';
import { useRouter } from '../../router';
import { fieldSelectionOptionsComponents } from './FieldSelection';
import { useSort } from './useSort';

export function SortSelection({ list }: { list: ListMeta }) {
  const sort = useSort(list);
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  return (
    <Fragment>
      <Button
        {...trigger.props}
        weight="link"
        css={{ padding: 4 }}
        ref={trigger.ref}
        onClick={() => setOpen(true)}
      >
        <span css={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
          {sort
            ? `${list.fields[sort.field].label} ${
                { ASC: 'ascending', DESC: 'descending' }[sort.direction]
              }`
            : 'No field'}
          <ChevronDownIcon size="smallish" />
        </span>
      </Button>

      <PopoverDialog arrow={arrow} isVisible={isOpen} {...dialog.props} ref={dialog.ref}>
        {isOpen && (
          <SortSelectionPopoverContent
            onClose={() => {
              setOpen(false);
            }}
            list={list}
          />
        )}
      </PopoverDialog>
    </Fragment>
  );
}

const noFieldOption = {
  label: 'No field',
  value: '___________NO_FIELD___________',
};

function SortSelectionPopoverContent({ onClose, list }: { onClose: () => void; list: ListMeta }) {
  const sort = useSort(list);
  const router = useRouter();

  return (
    <Stack padding="medium" css={{ minWidth: 320 }} gap="small">
      <div css={{ position: 'relative' }}>
        <Heading textAlign="center" type="h5">
          Sort
        </Heading>
      </div>
      <Divider />
      <Options
        value={
          sort
            ? {
                label: list.fields[sort.field].label,
                value: sort.field,
              }
            : noFieldOption
        }
        components={fieldSelectionOptionsComponents}
        onChange={newVal => {
          const fieldPath: string = (newVal as any).value;
          if (fieldPath === noFieldOption.value) {
            const { sortBy, ...restOfQuery } = router.query;
            router.push({
              query: restOfQuery,
            });
          } else {
            router.push({
              query: {
                ...router.query,
                sortBy:
                  sort?.field === fieldPath && sort.direction === 'ASC'
                    ? `-${sort.field}`
                    : fieldPath,
              },
            });
          }

          onClose();
        }}
        options={Object.keys(list.fields)
          .filter(fieldPath => list.fields[fieldPath].isOrderable)
          .map(fieldPath => ({
            label: list.fields[fieldPath].label,
            value: fieldPath,
          }))
          .concat(noFieldOption)}
      />
    </Stack>
  );
}
