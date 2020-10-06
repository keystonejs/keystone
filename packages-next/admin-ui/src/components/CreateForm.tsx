/* @jsx jsx */

import { Fragment, useState } from 'react';
import { gql, useMutation } from '../apollo';
import { jsx, Stack } from '@keystone-ui/core';
import isDeepEqual from 'fast-deep-equal';
import { useList } from '../context';
import { Button } from '@keystone-ui/button';
import { Notice } from '@keystone-ui/notice';

export function CreateForm({
  listKey,
  fieldModes,
  onClose,
  onCreate,
}: {
  listKey: string;
  fieldModes: Record<string, 'edit' | 'read' | 'hidden'>;
  onClose: () => void;
  onCreate: (id: string) => void;
}) {
  const list = useList(listKey);

  const [createItem, { loading, error }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        id
      }
    }`
  );

  const [valuesByFieldPath, setValuesByFieldPath] = useState(() => {
    const value: Record<string, unknown> = {};
    Object.keys(list.fields).forEach(fieldPath => {
      value[fieldPath] = list.fields[fieldPath].controller.defaultValue;
    });
    return value;
  });
  const fields = Object.keys(list.fields)
    .filter(fieldKey => fieldModes[fieldKey] !== 'hidden')
    .map(fieldKey => {
      const field = list.fields[fieldKey];
      const Field = list.fields[fieldKey].views.Field;
      return (
        <Field
          key={fieldKey}
          field={field.controller}
          value={valuesByFieldPath[fieldKey]}
          onChange={fieldValue => {
            setValuesByFieldPath({
              ...valuesByFieldPath,
              [fieldKey]: fieldValue,
            });
          }}
        />
      );
    });

  return (
    <Fragment>
      {error && <Notice tone="negative">{error.message}</Notice>}
      {fields}
      {fields.length === 0 && 'There are no fields that you can read or edit'}
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        <Stack across gap="small">
          <Button
            isLoading={loading}
            weight="bold"
            tone="active"
            onClick={() => {
              const data: Record<string, any> = {};
              Object.keys(list.fields).forEach(fieldPath => {
                const { controller } = list.fields[fieldPath];
                const serialized = controller.serialize(valuesByFieldPath[fieldPath]);
                if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
                  Object.assign(data, serialized);
                }
              });

              createItem({
                variables: {
                  data,
                },
              })
                .then(({ data }) => {
                  onCreate(data.item.id);
                })
                .catch(() => {});
            }}
          >
            Create
          </Button>
        </Stack>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </Fragment>
  );
}
