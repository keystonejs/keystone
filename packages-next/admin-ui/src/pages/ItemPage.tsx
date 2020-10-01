/* @jsx jsx */

import { Fragment, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '../apollo';
import { jsx, Stack, useTheme } from '@keystone-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useList } from '../context';
import { PageContainer } from '../components/PageContainer';
import { Button } from '@keystone-ui/button';
import { JSONValue, ListMeta } from '@keystone-spike/types';
import isDeepEqual from 'fast-deep-equal';
import { Notice } from '@keystone-ui/notice';
import { Tooltip } from '@keystone-ui/tooltip';
import copyToClipboard from 'clipboard-copy';

type ItemPageProps = {
  listKey: string;
};

function deserializeValue(list: ListMeta, item: Record<string, any>) {
  const value: Record<string, any> = {};
  Object.keys(list.fields).forEach(fieldKey => {
    const field = list.fields[fieldKey];
    value[fieldKey] = field.controller.deserialize(item);
  });
  return value;
}

function serializeValueToObjByFieldKey(list: ListMeta, value: Record<string, unknown>) {
  let obj: Record<string, Record<string, JSONValue>> = {};
  Object.keys(list.fields).map(fieldKey => {
    obj[fieldKey] = list.fields[fieldKey].controller.serialize(value[fieldKey]);
  });
  return obj;
}

function ItemForm({
  listKey,
  item,
  selectedFields,
  fieldModes,
  showDelete,
}: {
  listKey: string;
  item: Record<string, any>;
  selectedFields: string;
  fieldModes: Record<string, 'edit' | 'read' | 'hidden'>;
  showDelete: boolean;
}) {
  const list = useList(listKey);
  const router = useRouter();

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
        id
        _label_
        ${selectedFields}
      }
    }`
  );

  const [deleteItem, { loading: isDeletePending }] = useMutation(
    gql`mutation ($id: ID!) {
      ${list.gqlNames.deleteMutationName}(id: $id) {
        id
      }
    }`,
    { variables: { id: item.id } }
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list, item);
    return {
      value,
      item,
    };
  });

  if (state.item !== item) {
    const value = deserializeValue(list, item);
    setValue({
      value,
      item,
    });
  }

  const serializedValuesFromItem = useMemo(() => {
    const value = deserializeValue(list, item);
    return serializeValueToObjByFieldKey(list, value);
  }, [list, item]);
  const serializedFieldValues = useMemo(() => {
    return serializeValueToObjByFieldKey(list, state.value);
  }, [state.value, list]);

  const fieldsEquality = useMemo(() => {
    let someFieldsChanged = false;
    let fieldsChanged: Record<string, boolean> = {};
    Object.keys(serializedFieldValues).forEach(fieldKey => {
      let isEqual = isDeepEqual(
        serializedFieldValues[fieldKey],
        serializedValuesFromItem[fieldKey]
      );
      if (!isEqual && someFieldsChanged === false) {
        someFieldsChanged = true;
      }
      fieldsChanged[fieldKey] = !isEqual;
    });
    return {
      someFieldsChanged,
      fieldsChanged,
    };
  }, [serializedFieldValues, serializedValuesFromItem, list]);
  const saveButtonProps = {
    isLoading: loading,
    weight: 'bold',
    tone: 'active',
    onClick: () => {
      const data: Record<string, any> = {};
      Object.keys(fieldsEquality.fieldsChanged).forEach(fieldKey => {
        if (fieldsEquality.fieldsChanged[fieldKey]) {
          Object.assign(data, serializedFieldValues[fieldKey]);
        }
      });
      update({
        variables: {
          data,
          id: item.id,
        },
      });
    },
    children: 'Save Changes',
  } as const;
  const fields = Object.keys(list.fields)
    .filter(fieldKey => fieldModes[fieldKey] !== 'hidden')
    .map(fieldKey => {
      const fieldMode = fieldModes[fieldKey];
      const field = list.fields[fieldKey];
      const Field = list.fields[fieldKey].views.Field;
      return (
        <Field
          key={fieldKey}
          field={field.controller}
          value={state.value[fieldKey]}
          onChange={
            fieldMode === 'edit'
              ? fieldValue => {
                  setValue({
                    value: { ...state.value, [fieldKey]: fieldValue },
                    item: state.item,
                  });
                }
              : undefined
          }
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
          {fieldsEquality.someFieldsChanged ? (
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
          <Button
            onClick={() => {
              setValue({
                item,
                value: deserializeValue(list, item),
              });
            }}
          >
            Reset changes
          </Button>
        </Stack>
        {showDelete && (
          <Button
            tone="negative"
            weight="outline"
            isLoading={isDeletePending}
            onClick={async () => {
              await deleteItem();
              router.push(`/${list.path}`);
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </Fragment>
  );
}

export const ItemPage = ({ listKey }: ItemPageProps) => {
  const router = useRouter();
  const { id } = router.query;
  const list = useList(listKey);
  const { spacing } = useTheme();

  const { query, selectedFields } = useMemo(() => {
    let selectedFields = Object.keys(list.fields)
      .map(fieldPath => {
        return list.fields[fieldPath].controller.graphqlSelection;
      })
      .join('\n');
    return {
      selectedFields,
      query: gql`
  query ItemPage($id: ID!, $listKey: String!) {
    item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
      id
      _label_
      ${selectedFields}
    }
    keystone {
      adminMeta {
        list(key: $listKey) {
          hideDelete
          fields {
            path
            itemView(id: $id) {
              fieldMode
            }
          }
        }
      }
    }
  }
`,
    };
  }, [list]);
  let { data, error } = useQuery(query, { variables: { id, listKey } });

  let itemViewFieldModesByField = useMemo(() => {
    let itemViewFieldModesByField: Record<string, 'edit' | 'read' | 'hidden'> = {};
    data?.keystone.adminMeta.list?.fields.forEach(
      (field: { path: string; itemView: { fieldMode: 'edit' | 'read' | 'hidden' } }) => {
        itemViewFieldModesByField[field.path] = field.itemView.fieldMode;
      }
    );
    return itemViewFieldModesByField;
  }, [data?.keystone.adminMeta.list?.fields]);
  return (
    <PageContainer>
      <h2>
        List:{' '}
        <Link href={`/${list.path}`}>
          <a>{list.label}</a>
        </Link>
      </h2>
      {error ? (
        error.message
      ) : data ? (
        <Fragment>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {' '}
            <h3>Item: {data.item._label_}</h3>
            <div css={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span css={{ marginRight: spacing.small }}>ID: {data.item.id}</span>
              <Button
                // TODO: this should be an IconButton
                onClick={() => {
                  copyToClipboard(data.item.id);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
          <ItemForm
            fieldModes={itemViewFieldModesByField}
            selectedFields={selectedFields}
            showDelete={!data.keystone.adminMeta.list!.hideDelete}
            listKey={listKey}
            item={data.item}
          />
        </Fragment>
      ) : (
        'Loading...'
      )}
    </PageContainer>
  );
};
