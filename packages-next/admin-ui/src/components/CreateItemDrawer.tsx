/* @jsx jsx */

import { useState } from 'react';
import { gql, useMutation } from '../apollo';
import { jsx } from '@keystone-ui/core';
import isDeepEqual from 'fast-deep-equal';
import { useList } from '../context';
import { Notice } from '@keystone-ui/notice';
import { Drawer } from '@keystone-ui/modals';
import { useToasts } from '@keystone-ui/toast';

export function CreateItemDrawer({
  listKey,
  fieldModes,
  onClose,
  onCreate,
}: {
  listKey: string;
  fieldModes: Record<string, 'edit' | 'hidden'>;
  onClose: () => void;
  onCreate: (id: string) => void;
}) {
  const list = useList(listKey);

  const toasts = useToasts();

  const [createItem, { loading, error }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        id
        _label_
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
    <Drawer
      width="wide"
      title={`Create ${list.singular}`}
      actions={{
        confirm: {
          label: `Create ${list.singular}`,
          loading,
          action: () => {
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
                toasts.addToast({
                  title: data.item._label_,
                  message: 'Created Successfully',
                  tone: 'positive',
                });
              })
              .catch(() => {});
          },
        },
        cancel: {
          label: 'Cancel',
          action: onClose,
        },
      }}
    >
      {error && <Notice tone="negative">{error.message}</Notice>}
      {fields}
      {fields.length === 0 && 'There are no fields that you can read or edit'}
    </Drawer>
  );
}
