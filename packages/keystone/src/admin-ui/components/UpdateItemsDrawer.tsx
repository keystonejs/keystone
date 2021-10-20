/** @jsxRuntime classic */
/** @jsx jsx */

import { useCallback, useMemo, useState } from 'react';
import isDeepEqual from 'fast-deep-equal';
import { jsx, Box } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, MultiSelect } from '@keystone-ui/fields';
import { Drawer } from '@keystone-ui/modals';
import { useToasts } from '@keystone-ui/toast';
import { LoadingDots } from '@keystone-ui/loading';

import { gql, useMutation } from '../apollo';
import { useKeystone, useList } from '../context';

import { FieldMeta } from '../../types';
import { Fields } from '../utils/Fields';
import { GraphQLErrorNotice } from './GraphQLErrorNotice';

type ValueWithoutServerSideErrors = { [key: string]: { kind: 'value'; value: any } };

export function UpdateItemsDrawer({
  selectedItems,
  listKey,
  onClose,
  onUpdate,
}: {
  selectedItems: ReadonlySet<string>;
  listKey: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { createViewFieldModes } = useKeystone();
  const list = useList(listKey);

  const toasts = useToasts();

  const [updateItems, { loading, error }] = useMutation(
    useMemo(
      () =>
        gql`
        mutation($data: [${list.gqlNames.updateManyInputName}!]! ) {
          items: ${list.gqlNames.updateManyMutationName}(data: $data) {
            id
            ${list.labelField}
          }
        }
`,
      [list]
    ),
    { errorPolicy: 'all' }
  );

  const [selectedFields, setSelectedFields] = useState<{ label: string; value: FieldMeta }[]>([]);
  const [value, setValue] = useState(() => {
    const value: ValueWithoutServerSideErrors = {};
    Object.keys(list.fields).forEach(fieldPath => {
      value[fieldPath] = { kind: 'value', value: list.fields[fieldPath].controller.defaultValue };
    });
    return value;
  });

  const options = useMemo(
    // remove the `options` key from select type fields
    () => Object.entries(list.fields).map(([label, value]) => ({ label, value })),
    [list.fields]
  );

  const renderedFields: Record<string, FieldMeta> = selectedFields.reduce(
    (fields, { label, value }) => ({ ...fields, [label]: value }),
    {}
  );
  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(value).forEach(fieldPath => {
      const val = value[fieldPath].value;

      const validateFn = list.fields[fieldPath].controller.validate;
      if (renderedFields[fieldPath] && validateFn) {
        const result = validateFn(val);
        if (result === false) {
          invalidFields.add(fieldPath);
        }
      }
    });
    return invalidFields;
  }, [list, value, renderedFields]);

  const [forceValidation, setForceValidation] = useState(false);

  return (
    <Drawer
      title={`Create ${list.singular}`}
      width="narrow"
      actions={{
        confirm: {
          label: `Update ${list.plural}`,
          loading,
          action: () => {
            const newForceValidation = invalidFields.size !== 0;
            setForceValidation(newForceValidation);

            if (newForceValidation) return;
            const data: Record<string, any> = {};

            Object.keys(renderedFields).forEach(fieldPath => {
              const { controller } = list.fields[fieldPath];
              const serialized = controller.serialize(value[fieldPath].value);
              if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
                Object.assign(data, serialized);
              }
            });

            updateItems({
              variables: {
                data: [...selectedItems].map(id => ({ where: { id }, data })),
              },
            })
              .then(({ data }) => {
                onUpdate();
                toasts.addToast({
                  title: `${data.items.length} ${list.plural}`,
                  message: 'Updated Successfully',
                  tone: 'positive',
                });
              })
              // .catch(() => {});
              .catch(console.log);
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
      <FieldContainer>
        <FieldLabel htmlFor="select-items">Select Fields</FieldLabel>
        <MultiSelect
          width="medium"
          value={selectedFields}
          options={options}
          styles={{
            valueContainer: provided => ({
              ...provided,
              paddingLeft: '12px',
              paddingRight: '16px',
            }),
          }}
          portalMenu
          menuPortalTarget={document.body}
          onChange={o => {
            console.log(o);
            setSelectedFields(o);
          }}
        />
      </FieldContainer>
      <Box paddingY="xlarge">
        <Fields
          fields={renderedFields}
          fieldModes={
            createViewFieldModes.state === 'loaded' ? createViewFieldModes.lists[list.key] : null
          }
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          value={value}
          onChange={useCallback(getNewValue => {
            setValue(oldValues => getNewValue(oldValues) as ValueWithoutServerSideErrors);
          }, [])}
        />
      </Box>
    </Drawer>
  );
}
