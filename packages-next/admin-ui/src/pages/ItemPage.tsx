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
import { DataGetter, DeepNullable, makeDataGetter } from '../utils/dataGetter';
import { getRootFieldsFromSelection } from '../utils/getRootFieldsFromSelection';
import { GraphQLError } from 'graphql';

type ItemPageProps = {
  listKey: string;
};

type DeserializedValue = Record<
  string,
  | { kind: 'error'; errors: readonly [GraphQLError, ...GraphQLError[]] }
  | { kind: 'value'; value: any }
>;

function deserializeValue(list: ListMeta, itemGetter: DataGetter<ItemData>) {
  const value: DeserializedValue = {};
  Object.keys(list.fields).forEach(fieldKey => {
    const field = list.fields[fieldKey];
    const itemForField: Record<string, any> = {};
    const errors = new Set<GraphQLError>();
    for (const graphqlField of getRootFieldsFromSelection(field.controller.graphqlSelection)) {
      const fieldGetter = itemGetter.get(graphqlField);
      if (fieldGetter.errors) {
        fieldGetter.errors.forEach(error => {
          errors.add(error);
        });
      }
      itemForField[graphqlField] = fieldGetter.data;
    }
    if (errors.size) {
      value[fieldKey] = { kind: 'error', errors: [...errors] as any };
    } else {
      value[fieldKey] = { kind: 'value', value: field.controller.deserialize(itemForField) };
    }
  });
  return value;
}

function serializeValueToObjByFieldKey(list: ListMeta, value: DeserializedValue) {
  const obj: Record<string, Record<string, JSONValue>> = {};
  Object.keys(list.fields).map(fieldKey => {
    const val = value[fieldKey];
    if (val.kind === 'value') {
      obj[fieldKey] = list.fields[fieldKey].controller.serialize(val.value);
    }
  });
  return obj;
}

type ItemData = DeepNullable<{ id: string; _label_: string; [key: string]: any }>;

function ItemForm({
  listKey,
  itemGetter,
  selectedFields,
  fieldModes,
  showDelete,
}: {
  listKey: string;
  itemGetter: DataGetter<ItemData>;
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
    { variables: { id: itemGetter.get('id').data } }
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list, itemGetter);
    return {
      value,
      item: itemGetter.data,
    };
  });

  if (state.item !== itemGetter.data) {
    const value = deserializeValue(list, itemGetter);
    setValue({
      value,
      item: itemGetter.data,
    });
  }

  const serializedValuesFromItem = useMemo(() => {
    const value = deserializeValue(list, itemGetter);
    return serializeValueToObjByFieldKey(list, value);
  }, [list, itemGetter]);
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
          id: itemGetter.get('id').data,
        },
      });
    },
    children: 'Save Changes',
  } as const;
  const fields = Object.keys(list.fields)
    .filter(fieldKey => fieldModes[fieldKey] !== 'hidden')
    .map(fieldKey => {
      const field = list.fields[fieldKey];
      const value = state.value[fieldKey];
      const fieldMode = fieldModes[fieldKey];
      const Field = list.fields[fieldKey].views.Field;

      if (value.kind === 'error') {
        return (
          <div>
            {field.label}: <span css={{ color: 'red' }}>{value.errors[0].message}</span>
          </div>
        );
      }
      return (
        <Field
          key={fieldKey}
          field={field.controller}
          value={value.value}
          onChange={
            fieldMode === 'edit'
              ? fieldValue => {
                  setValue({
                    value: { ...state.value, [fieldKey]: { kind: 'value', value: fieldValue } },
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
                item: itemGetter.data,
                value: deserializeValue(list, itemGetter),
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
  let { data, error, loading } = useQuery(query, {
    variables: { id, listKey },
    errorPolicy: 'all',
  });

  const dataGetter = makeDataGetter<
    DeepNullable<{
      item: ItemData;
      keystone: {
        adminMeta: {
          list: {
            fields: {
              path: string;
              itemView: {
                fieldMode: 'edit' | 'read' | 'hidden';
              };
            }[];
          };
        };
      };
    }>
  >(data, error?.graphQLErrors);

  let itemViewFieldModesByField = useMemo(() => {
    let itemViewFieldModesByField: Record<string, 'edit' | 'read' | 'hidden'> = {};
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach(field => {
      if (field !== null && field.path !== null && field?.itemView?.fieldMode != null) {
        itemViewFieldModesByField[field.path] = field.itemView.fieldMode;
      }
    });
    return itemViewFieldModesByField;
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields]);
  const errorsFromMetaQuery = dataGetter.get('keystone').errors;
  return (
    <PageContainer>
      <h2>
        List:{' '}
        <Link href={`/${list.path}`}>
          <a>{list.label}</a>
        </Link>
      </h2>
      {loading ? (
        'Loading...'
      ) : errorsFromMetaQuery ? (
        <div css={{ color: 'red' }}>{errorsFromMetaQuery[0].message}</div>
      ) : (
        <Fragment>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
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
            itemGetter={dataGetter.get('item')}
          />
        </Fragment>
      )}
    </PageContainer>
  );
};
