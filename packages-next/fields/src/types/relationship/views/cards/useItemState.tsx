import { FieldMeta, ListMeta } from '@keystone-next/types';
import { useCallback, useMemo, useState } from 'react';
import { gql, useQuery } from '@keystone-next/admin-ui/apollo';
import { controller } from '../index';
import { DataGetter, makeDataGetter } from '@keystone-next/admin-ui-utils';

type ItemsState =
  | {
      kind: 'loading';
    }
  | { kind: 'error'; message: string }
  | { kind: 'loaded' };

type Items = Record<string, DataGetter<{ id: string; [key: string]: any }>>;

export function useItemState({
  selectedFields,
  localList,
  id,
  field,
}: {
  selectedFields: string;
  localList: ListMeta;
  field: ReturnType<typeof controller>;
  id: string;
}) {
  const { data, error, loading } = useQuery(
    gql`query($id: ID!) {
  item: ${localList.key}(where: {id: $id}) {
    id
    relationship: ${field.path} {
      ${selectedFields}
    }
  }
}`,
    { variables: { id }, errorPolicy: 'all' }
  );
  const { itemsArrFromData, relationshipGetter } = useMemo(() => {
    const dataGetter = makeDataGetter(data, error?.graphQLErrors);
    const relationshipGetter = dataGetter.get('item').get('relationship');
    const isMany = Array.isArray(relationshipGetter.data);
    const itemsArrFromData: DataGetter<{ id: string; [key: string]: any }>[] = (isMany
      ? relationshipGetter.data.map((_: any, i: number) => relationshipGetter.get(i))
      : [relationshipGetter]
    ).filter((x: DataGetter<any>) => x.data?.id != null);
    return { relationshipGetter, itemsArrFromData };
  }, [data, error]);
  let [{ items, itemsArrFromData: itemsArrFromDataState }, setItemsState] = useState<{
    itemsArrFromData: DataGetter<any>[];
    items: Record<
      string,
      {
        current: DataGetter<{ id: string; [key: string]: any }>;
        fromInitialQuery: DataGetter<{ id: string; [key: string]: any }> | undefined;
      }
    >;
  }>({ itemsArrFromData: [], items: {} });

  if (itemsArrFromDataState !== itemsArrFromData) {
    let newItems: Record<
      string,
      {
        current: DataGetter<{ id: string; [key: string]: any }>;
        fromInitialQuery: DataGetter<{ id: string; [key: string]: any }> | undefined;
      }
    > = {};

    itemsArrFromData.forEach(item => {
      const initialItemInState = items[item.data.id]?.fromInitialQuery;
      if (
        ((items[item.data.id] && initialItemInState) || !items[item.data.id]) &&
        (!initialItemInState ||
          item.data !== initialItemInState.data ||
          item.errors?.length !== initialItemInState.errors?.length ||
          (item.errors || []).some((err, i) => err !== initialItemInState.errors?.[i]))
      ) {
        newItems[item.data.id] = { current: item, fromInitialQuery: item };
      } else {
        newItems[item.data.id] = items[item.data.id];
      }
    });
    items = newItems;
    setItemsState({
      items: newItems,
      itemsArrFromData,
    });
  }

  return {
    items: useMemo(() => {
      const itemsToReturn: Items = {};
      Object.keys(items).forEach(id => {
        itemsToReturn[id] = items[id].current;
      });
      return itemsToReturn;
    }, [items]),
    setItems: useCallback(
      (items: Items) => {
        setItemsState(state => {
          let itemsForState: typeof state['items'] = {};
          Object.keys(items).forEach(id => {
            if (items[id] === state.items[id]?.current) {
              itemsForState[id] = state.items[id];
            } else {
              itemsForState[id] = {
                current: items[id],
                fromInitialQuery: state.items[id]?.fromInitialQuery,
              };
            }
          });
          return {
            itemsArrFromData: state.itemsArrFromData,
            items: itemsForState,
          };
        });
      },
      [setItemsState]
    ),
    state: ((): ItemsState => {
      if (loading) {
        return { kind: 'loading' };
      }
      if (error?.networkError) {
        return { kind: 'error', message: error.networkError.message };
      }
      if (field.many && !relationshipGetter.data) {
        return { kind: 'error', message: relationshipGetter.errors?.[0].message || '' };
      }
      return { kind: 'loaded' };
    })(),
  };
}

export function useFieldsObj(list: ListMeta, fields: string[] | undefined) {
  return useMemo(() => {
    const editFields: Record<string, FieldMeta> = {};
    fields?.forEach(fieldPath => {
      editFields[fieldPath] = list.fields[fieldPath];
    });
    return editFields;
  }, [fields, list.fields]);
}
