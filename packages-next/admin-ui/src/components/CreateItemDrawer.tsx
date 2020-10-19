/* @jsx jsx */

import { useMemo, useState } from 'react';
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
        label: ${list.labelField}
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

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(valuesByFieldPath).forEach(fieldPath => {
      const val = valuesByFieldPath[fieldPath];

      const validateFn = list.fields[fieldPath].controller.validate;
      if (validateFn) {
        const result = validateFn(val);
        if (result === false) {
          invalidFields.add(fieldPath);
        }
      }
    });
    return invalidFields;
  }, [list, valuesByFieldPath]);

  const [forceValidation, setForceValidation] = useState(false);

  const fields = Object.keys(list.fields)
    .filter(fieldPath => fieldModes[fieldPath] !== 'hidden')
    .map(fieldPath => {
      const field = list.fields[fieldPath];
      return (
        <field.views.Field
          key={fieldPath}
          field={field.controller}
          value={valuesByFieldPath[fieldPath]}
          forceValidation={forceValidation && invalidFields.has(fieldPath)}
          onChange={fieldValue => {
            setValuesByFieldPath({
              ...valuesByFieldPath,
              [fieldPath]: fieldValue,
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
            const newForceValidation = invalidFields.size !== 0;
            setForceValidation(newForceValidation);

            if (newForceValidation) return;
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
                  title: data.item.label,
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
