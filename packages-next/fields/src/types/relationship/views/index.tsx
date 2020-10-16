/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';
import { RelationshipSelect } from './RelationshipSelect';
import { useList } from '@keystone-spike/admin-ui/context';
import { Link } from '@keystone-spike/admin-ui/router';
import { Fragment } from 'react';

export const Field = ({ field, autoFocus, value, onChange }: FieldProps<typeof controller>) => {
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
          label: value.value || value.id,
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
        console.log({ connect, disconnect });
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
            [config.path]: { disconnect: { id: state.initialValue.id } },
          };
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: { connect: { id: state.value.id } },
          };
        }
      }
      return {};
    },
  };
};
