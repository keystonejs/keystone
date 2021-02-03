/** @jsx jsx */

import { gql, useMutation } from '@keystone-next/admin-ui/apollo';
import { GraphQLErrorNotice } from '@keystone-next/admin-ui/components';
import {
  deserializeValue,
  ItemData,
  useInvalidFields,
  Fields,
  useChangedFieldsAndDataForUpdate,
  makeDataGetter,
  DataGetter,
} from '@keystone-next/admin-ui-utils';
import { ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { jsx, Stack } from '@keystone-ui/core';
import { useToasts } from '@keystone-ui/toast';
import { useCallback, useState } from 'react';
import { useFieldsObj } from './useItemState';
import { Tooltip } from '@keystone-ui/tooltip';

export function InlineEdit({
  fields,
  list,
  selectedFields,
  itemGetter,
  onCancel,
  onSave,
}: {
  fields: string[];
  list: ListMeta;
  selectedFields: string;
  itemGetter: DataGetter<ItemData>;
  onCancel: () => void;
  onSave: (newItemGetter: DataGetter<ItemData>) => void;
}) {
  const fieldsObj = useFieldsObj(list, fields);

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
          item: ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
            ${selectedFields}
          }
        }`,
    {
      errorPolicy: 'all',
    }
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(fieldsObj, itemGetter);
    return {
      value,
      item: itemGetter.data,
    };
  });

  if (state.item !== itemGetter.data && itemGetter.errors?.every(x => x.path?.length !== 1)) {
    const value = deserializeValue(fieldsObj, itemGetter);
    setValue({
      value,
      item: itemGetter.data,
    });
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    fieldsObj,
    itemGetter,
    state.value
  );

  const invalidFields = useInvalidFields(fieldsObj, state.value);

  const [forceValidation, setForceValidation] = useState(false);
  const toasts = useToasts();
  const saveButtonProps = {
    isLoading: loading,
    weight: 'bold',
    size: 'small',
    tone: 'active',
    onClick: () => {
      const newForceValidation = invalidFields.size !== 0;
      setForceValidation(newForceValidation);
      if (newForceValidation) return;

      update({
        variables: {
          data: dataForUpdate,
          id: itemGetter.get('id').data,
        },
      })
        .then(({ data, errors }) => {
          // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
          // which are handled seperately and do not indicate a failure to update the item
          const error = errors?.find(x => x.path?.length === 1);
          if (error) {
            toasts.addToast({
              title: 'Failed to update item',
              tone: 'negative',
              message: error.message,
            });
          } else {
            toasts.addToast({
              title: data.item[list.labelField] || data.item.id,
              tone: 'positive',
              message: 'Saved successfully',
            });
            onSave(makeDataGetter(data, errors).get('item'));
          }
        })
        .catch(err => {
          toasts.addToast({
            title: 'Failed to update item',
            tone: 'negative',
            message: err.message,
          });
        });
    },
    children: 'Save',
  } as const;

  return (
    <Stack gap="xlarge">
      {error && (
        <GraphQLErrorNotice
          networkError={error?.networkError}
          // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
          // which are handled seperately and do not indicate a failure to update the item
          errors={error?.graphQLErrors.filter(x => x.path?.length === 1)}
        />
      )}
      <Fields
        fieldModes={null}
        fields={fieldsObj}
        forceValidation={forceValidation}
        invalidFields={invalidFields}
        onChange={useCallback(
          value => {
            setValue(state => ({
              item: state.item,
              value: value(state.value),
            }));
          },
          [setValue]
        )}
        value={state.value}
      />
      <Stack across gap="small">
        {changedFields.size ? (
          <Button {...saveButtonProps} />
        ) : (
          <Tooltip content="No fields have been modified so you cannot save changes">
            {props => (
              <Button
                {...props}
                {...saveButtonProps}
                // making onClick undefined instead of making the button disabled so the button can be focussed so keyboard users can see the tooltip
                onClick={undefined}
              />
            )}
          </Tooltip>
        )}
        <Button size="small" weight="none" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
