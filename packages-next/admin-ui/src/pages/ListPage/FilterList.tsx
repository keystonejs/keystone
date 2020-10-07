/** @jsx jsx */
import { Inline, jsx, Stack } from '@keystone-ui/core';
import { FieldMeta, ListMeta } from '@keystone-spike/types';
import { Filter } from './useFilters';
import { Link, useRouter } from '../../router';
import { Button } from '@keystone-ui/button';
import { usePopover, PopoverDialog } from '@keystone-ui/popover';
import { tabbable } from 'tabbable';
import { FormEvent, Fragment, useState } from 'react';
import { Pill } from '@keystone-ui/pill';

export function FilterList({ filters, list }: { filters: Filter[]; list: ListMeta }) {
  const { query } = useRouter();
  return (
    <p>
      Filters:
      <Inline gap="small">
        {filters.map(filter => {
          const field = list.fields[filter.field];
          return (
            <FilterPill key={`${filter.field}_${filter.type}`} field={field} filter={filter} />
          );
        })}
      </Inline>
    </p>
  );
}

function FilterPill({ filter, field }: { filter: Filter; field: FieldMeta }) {
  const router = useRouter();
  const { isOpen, setOpen, trigger, dialog } = usePopover({
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
      <Pill
        onClick={() => {
          setOpen(true);
        }}
        {...trigger.props}
        ref={trigger.ref}
        onRemove={() => {
          const { [`!${filter.field}_${filter.type}`]: _ignore, ...queryToKeep } = router.query;

          router.push({ query: queryToKeep });
        }}
      >
        {field.label}{' '}
        {field.controller.filter!.format({
          label: field.controller.filter!.types[filter.type].label,
          type: filter.type,
          value: filter.value,
        })}
      </Pill>
      <PopoverDialog {...dialog.props} ref={dialog.ref} isVisible={isOpen}>
        <EditDialog
          onClose={() => {
            setOpen(false);
          }}
          field={field}
          filter={filter}
        />
      </PopoverDialog>
    </Fragment>
  );
}

function EditDialog({
  filter,
  field,
  onClose,
}: {
  filter: Filter;
  field: FieldMeta;
  onClose: () => void;
}) {
  const Filter = field.controller.filter!.Filter;
  const router = useRouter();
  const [value, setValue] = useState(filter.value);
  return (
    <Stack
      as="form"
      padding="small"
      gap="small"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        router.push({
          query: {
            ...router.query,
            [`!${filter.field}_${filter.type}`]: JSON.stringify(value),
          },
        });
        onClose();
      }}
    >
      <div
        ref={node => {
          if (node) {
            tabbable(node)[0]?.focus();
          }
        }}
      >
        <Filter type={filter.type} value={value} onChange={setValue} />
      </div>
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </Stack>
  );
}
