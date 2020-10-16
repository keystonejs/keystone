/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
  ListMeta,
} from '@keystone-spike/types';
import { RelationshipSelect } from './RelationshipSelect';
import { useKeystone, useList } from '@keystone-spike/admin-ui/context';
import { Link } from '@keystone-spike/admin-ui/router';
import { Fragment } from 'react';
import { Button } from '@keystone-ui/button';

function LinkToRelatedItems({
  value,
  list,
}: {
  value: FieldProps<typeof controller>['value'];
  list: ListMeta;
}) {
  if (value.kind === 'many') {
    return (
      <Button
        as="a"
        css={{ textDecoration: 'none' }}
        // What happens when there are 10,000 ids? The URL would be too
        // big, so we arbitrarily limit it to the first 100
        // TODO: we should be able to filter by this, no?
        href={`/${list.path}?!id_in="${value.value
          .slice(0, 100)
          .map(({ id }) => id)
          .join(',')}"`}
      >
        View List of Related Items
      </Button>
    );
  }
  return (
    <Button
      css={{ textDecoration: 'none' }}
      as="a"
      href={`/${list.path}/${value.value?.id}`}
      target="_blank"
    >
      View Item Details
    </Button>
  );
}

export const Field = ({ field, autoFocus, value, onChange }: FieldProps<typeof controller>) => {
  const keystone = useKeystone();
  const list = useList(field.refListKey);

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <RelationshipSelect
        autoFocus={autoFocus}
        isDisabled={onChange === undefined}
        list={useList(field.refListKey)}
        state={
          value.kind === 'many'
            ? {
                kind: 'many',
                value: value.value,
                onChange(newItems) {
                  onChange?.({
                    ...value,
                    value: newItems,
                  });
                },
              }
            : {
                kind: 'one',
                value: value.value,
                onChange(newVal) {
                  onChange?.({
                    ...value,
                    value: newVal,
                  });
                },
              }
        }
      />
      {keystone.authenticatedItem.state === 'authenticated' &&
        keystone.authenticatedItem.listKey === field.refListKey && (
          <Button
            isDisabled={onChange === undefined}
            onClick={() => {
              if (keystone.authenticatedItem.state === 'authenticated') {
                const val = {
                  label: keystone.authenticatedItem.label,
                  id: keystone.authenticatedItem.id,
                };
                if (value.kind === 'many') {
                  onChange?.({
                    ...value,
                    value: [...value.value, val],
                  });
                } else {
                  onChange?.({
                    ...value,
                    value: val,
                  });
                }
              }
            }}
          >
            {value.kind === 'many' ? 'Add ' : 'Set as '}
            {keystone.authenticatedItem.label}
          </Button>
        )}
      {!!(value.kind === 'many' ? value.value.length : value.value) && (
        <LinkToRelatedItems list={list} value={value} />
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent<typeof controller> = ({ field, item }) => {
  const list = useList(field.refListKey);
  const data = item[field.path];
  return (
    <Fragment>
      {(Array.isArray(data) ? data : [data])
        .filter(item => item)
        .map((item, index) => (
          <Fragment key={item.id}>
            {!!index ? ', ' : ''}
            <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`}>
              {item.label || item.id}
            </Link>
          </Fragment>
        ))}
    </Fragment>
  );
};

type RelationshipController = FieldController<
  | {
      kind: 'many';
      initialValue: { label: string; id: string }[];
      value: { label: string; id: string }[];
    }
  | {
      kind: 'one';
      initialValue: { label: string; id: string } | null;
      value: { label: string; id: string } | null;
    }
> & {
  refLabelField: string;
  refListKey: string;
};

export const controller = (
  config: FieldControllerConfig<{ refListKey: string; many: boolean; refLabelField: string }>
): RelationshipController => {
  return {
    path: config.path,
    label: config.label,
    refLabelField: config.fieldMeta.refLabelField,
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection: `${config.path} {
      id
      label: ${config.fieldMeta.refLabelField}
    }`,
    defaultValue: config.fieldMeta.many
      ? {
          kind: 'many',
          initialValue: [],
          value: [],
        }
      : { kind: 'one', value: null, initialValue: null },
    deserialize: data => {
      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map((x: any) => ({
          id: x.id,
          label: x.label || x.id,
        }));
        return {
          kind: 'many',
          initialValue: value,
          value,
        };
      }
      let value = data[config.path];
      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id,
        };
      }
      return {
        kind: 'one',
        value,
        initialValue: value,
      };
    },
    serialize: state => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map(x => x.id));
        const initialIds = new Set(state.initialValue.map(x => x.id));
        let disconnect = state.initialValue
          .filter(x => !newAllIds.has(x.id))
          .map(x => ({ id: x.id }));
        let connect = state.value.filter(x => !initialIds.has(x.id)).map(x => ({ id: x.id }));
        if (disconnect.length || connect.length) {
          let output: any = {};

          if (disconnect.length) {
            output.disconnect = disconnect;
          }

          if (connect.length) {
            output.connect = connect;
          }

          return {
            [config.path]: output,
          };
        }
      } else {
        if (state.initialValue && !state.value) {
          return {
            [config.path]: {
              disconnect: {
                id: state.initialValue.id,
              },
            },
          };
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          };
        }
      }
      return {};
    },
  };
};
