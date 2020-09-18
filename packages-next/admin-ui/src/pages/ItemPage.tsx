/* @jsx jsx */

import { Fragment, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '../apollo';
import { jsx, Stack } from '@keystone-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useList } from '../KeystoneContext';
import { Navigation } from '../components/Navigation';
import { PageContainer } from '../components/PageContainer';
import { Button } from '@keystone-ui/button';
import { JSONValue, ListMeta } from '@keystone-spike/types';
import isDeepEqual from 'fast-deep-equal';
import { Notice } from '@keystone-ui/notice';

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
}: {
  listKey: string;
  item: Record<string, any>;
  selectedFields: string;
}) {
  const list = useList(listKey);

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
        id
        _label_
        ${selectedFields}
      }
    }`
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
  return (
    <Fragment>
      {error && <Notice tone="negative">{error.message}</Notice>}
      {Object.keys(list.fields).map(fieldKey => {
        const field = list.fields[fieldKey];
        const Field = list.fields[fieldKey].views.Field;
        return (
          <Field
            key={fieldKey}
            field={field.controller}
            value={state.value[fieldKey]}
            onChange={fieldValue => {
              setValue({
                value: { ...state.value, [fieldKey]: fieldValue },
                item: state.item,
              });
            }}
          />
        );
      })}
      <Stack across gap="small">
        <Button
          isLoading={loading}
          isDisabled={!fieldsEquality.someFieldsChanged}
          weight="bold"
          tone="active"
          onPress={() => {
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
          }}
        >
          Save
        </Button>
        <Button
          isDisabled={!fieldsEquality.someFieldsChanged}
          onPress={() => {
            setValue({
              item,
              value: deserializeValue(list, item),
            });
          }}
        >
          Reset changes
        </Button>
      </Stack>
    </Fragment>
  );
}

export const ItemPage = ({ listKey }: ItemPageProps) => {
  const router = useRouter();
  const { id } = router.query;
  const list = useList(listKey);
  const { query, selectedFields } = useMemo(() => {
    let selectedFields = Object.keys(list.fields)
      .map(fieldPath => {
        return list.fields[fieldPath].controller.graphqlSelection;
      })
      .join('\n');
    return {
      selectedFields,
      query: gql`
  query ItemPage($id: ID!) {
    item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
      id
      _label_
      ${selectedFields}
    }
  }
`,
    };
  }, [list]);
  let { data, error } = useQuery(query, { variables: { id } });

  return (
    <PageContainer>
      <Navigation />
      <h2>
        List:{' '}
        <Link href={`/${list.path}`}>
          <a>{list.label}</a>
        </Link>
      </h2>
      <h3>Item: {id}</h3>
      {error ? (
        error.message
      ) : data ? (
        <ItemForm selectedFields={selectedFields} listKey={listKey} item={data.item} />
      ) : (
        'Loading...'
      )}
    </PageContainer>
  );
};
