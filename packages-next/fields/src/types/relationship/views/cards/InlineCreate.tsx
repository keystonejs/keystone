/* @jsx jsx */

import { useMemo, useState } from 'react';
import { gql, useMutation } from '@keystone-next/admin-ui/apollo';
import { jsx, Stack } from '@keystone-ui/core';
import isDeepEqual from 'fast-deep-equal';
import { useToasts } from '@keystone-ui/toast';
import { GraphQLErrorNotice } from '@keystone-next/admin-ui/components';
import { ItemData, makeDataGetter, DataGetter } from '@keystone-next/admin-ui-utils';
import { Button } from '@keystone-ui/button';
import { ListMeta } from '@keystone-next/types';
import { useFieldsObj } from './useItemState';

export function InlineCreate({
  list,
  onCancel,
  onCreate,
  fields: fieldPaths,
  selectedFields,
}: {
  list: ListMeta;
  selectedFields: string;
  fields: string[];
  onCancel: () => void;
  onCreate: (itemGetter: DataGetter<ItemData>) => void;
}) {
  const toasts = useToasts();
  const fields = useFieldsObj(list, fieldPaths);

  const [createItem, { loading, error }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        ${selectedFields}
    }
  }`
  );

  const [valuesByFieldPath, setValuesByFieldPath] = useState(() => {
    const value: Record<string, unknown> = {};
    Object.keys(fields).forEach(fieldPath => {
      value[fieldPath] = fields[fieldPath].controller.defaultValue;
    });
    return value;
  });

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(valuesByFieldPath).forEach(fieldPath => {
      const val = valuesByFieldPath[fieldPath];

      const validateFn = fields[fieldPath].controller.validate;
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

  const onCreateClick = () => {
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);

    if (newForceValidation) return;
    const data: Record<string, any> = {};
    Object.keys(fields).forEach(fieldPath => {
      const { controller } = fields[fieldPath];
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
      .then(({ data, errors }) => {
        // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
        // which are handled seperately and do not indicate a failure to update the item
        const error = errors?.find(x => x.path?.length === 1);
        if (error) {
          toasts.addToast({
            title: 'Failed to create item',
            tone: 'negative',
            message: error.message,
          });
        } else {
          toasts.addToast({
            title: data.item[list.labelField] || data.item.id,
            tone: 'positive',
            message: 'Saved successfully',
          });
          onCreate(makeDataGetter(data, errors).get('item'));
        }
      })
      .catch(err => {
        toasts.addToast({
          title: 'Failed to update item',
          tone: 'negative',
          message: err.message,
        });
      });
  };

  return (
    <Stack gap="xlarge">
      {error && (
        <GraphQLErrorNotice networkError={error?.networkError} errors={error?.graphQLErrors} />
      )}
      {Object.keys(fields).map((fieldPath, index) => {
        const field = fields[fieldPath];
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
      })}
      <Stack gap="xsmall" across>
        <Button
          isLoading={loading}
          size="small"
          tone="positive"
          weight="bold"
          onClick={onCreateClick}
        >
          Create {list.singular}
        </Button>
        <Button size="small" weight="none" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
