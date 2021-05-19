/* @jsx jsx */

import { useMemo, useState } from 'react';
import isDeepEqual from 'fast-deep-equal';
import { jsx, Stack } from '@keystone-ui/core';
import { Drawer } from '@keystone-ui/modals';
import { useToasts } from '@keystone-ui/toast';
import { LoadingDots } from '@keystone-ui/loading';

import { gql, useMutation } from '../apollo';
import { useKeystone, useList } from '../context';

import { GraphQLErrorNotice } from './GraphQLErrorNotice';

export function CreateItemDrawer({
  listKey,
  onClose,
  onCreate,
}: {
  listKey: string;
  onClose: () => void;
  onCreate: (item: { id: string; label: string }) => void;
}) {
  const { createViewFieldModes } = useKeystone();
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
    .filter(fieldPath =>
      createViewFieldModes.state === 'loaded'
        ? createViewFieldModes.lists[listKey][fieldPath] !== 'hidden'
        : false
    )
    .map((fieldPath, index) => {
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
          autoFocus={index === 0}
        />
      );
    });

  return (
    <Drawer
      title={`Create ${list.singular}`}
      width="wide"
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
                const label = data.item.label || data.item.id;
                onCreate({ id: data.item.id, label });
                toasts.addToast({
                  title: label,
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
      {createViewFieldModes.state === 'error' && (
        <GraphQLErrorNotice
          networkError={
            createViewFieldModes.error instanceof Error ? createViewFieldModes.error : undefined
          }
          errors={
            createViewFieldModes.error instanceof Error ? undefined : createViewFieldModes.error
          }
        />
      )}
      {createViewFieldModes.state === 'loading' && <LoadingDots label="Loading create form" />}
      {error && (
        <GraphQLErrorNotice networkError={error?.networkError} errors={error?.graphQLErrors} />
      )}
      <Stack gap="xlarge" paddingY="xlarge">
        {fields}
        {fields.length === 0 && 'There are no fields that you can read or edit'}
      </Stack>
    </Drawer>
  );
}
