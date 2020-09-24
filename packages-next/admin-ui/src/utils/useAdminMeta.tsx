import { useEffect, useMemo, useState } from 'react';
import { ApolloClient, useQuery, gql } from '../apollo';
import hashString from '@emotion/hash';
import { SerializedAdminMeta, AdminMeta, FieldViews } from '@keystone-spike/types';

let expectedExports: Record<string, boolean> = {
  Cell: true,
  Field: true,
  controller: true,
};

const adminMetaLocalStorageKey = 'keystone.adminMeta';

let _mustRenderServerResult = true;

function useMustRenderServerResult() {
  let [, forceUpdate] = useState(0);
  useEffect(() => {
    _mustRenderServerResult = false;
    forceUpdate(1);
  });

  if (typeof window === 'undefined') {
    return true;
  }

  return _mustRenderServerResult;
}

export function useAdminMeta(
  client: ApolloClient<any>,
  adminMetaHash: string,
  fieldViews: FieldViews
) {
  const adminMetaFromLocalStorage = useMemo(() => {
    if (typeof window === 'undefined') {
      return;
    }
    let item = localStorage.getItem(adminMetaLocalStorageKey);
    if (item === null) {
      return;
    }
    try {
      let parsed = JSON.parse(item);
      if (parsed.hash === adminMetaHash) {
        return parsed.meta as SerializedAdminMeta;
      }
    } catch (err) {
      return;
    }
  }, []);
  const { data, error, refetch } = useQuery(
    gql`
      query {
        _adminMeta
      }
    `,
    { client, skip: adminMetaFromLocalStorage !== undefined }
  );

  const runtimeAdminMeta = useMemo(() => {
    if ((!data || error) && !adminMetaFromLocalStorage) {
      return undefined;
    }
    const adminMeta: SerializedAdminMeta = adminMetaFromLocalStorage
      ? adminMetaFromLocalStorage
      : data._adminMeta;
    const runtimeAdminMeta: AdminMeta = {
      enableSessionItem: adminMeta.enableSessionItem,
      enableSignout: adminMeta.enableSignout,
      lists: {},
    };
    Object.keys(adminMeta.lists).forEach(key => {
      const list = adminMeta.lists[key];
      runtimeAdminMeta.lists[key] = {
        initialColumns: list.initialColumns,
        gqlNames: list.gqlNames,
        key,
        fields: {},
        label: list.label,
        singular: list.singular,
        plural: list.plural,
        path: list.path,
        description: list.description,
        pageSize: list.pageSize,
      };
      Object.keys(list.fields).forEach(fieldKey => {
        const field = list.fields[fieldKey];

        Object.keys(expectedExports).forEach(exportName => {
          if ((fieldViews[field.views] as any)[exportName] === undefined) {
            throw new Error(
              `View for field at path ${key}.${fieldKey} is missing ${exportName} export`
            );
          }
        });
        Object.keys(fieldViews[field.views]).forEach(exportName => {
          if (expectedExports[exportName] === undefined) {
            throw new Error(
              `Unexpected export named ${exportName} from view from field at ${key}.${fieldKey}`
            );
          }
        });
        runtimeAdminMeta.lists[key].fields[fieldKey] = {
          label: field.label,
          views: fieldViews[field.views],
          fieldMeta: field.fieldMeta,
          controller: fieldViews[field.views].controller({
            fieldMeta: field.fieldMeta,
            label: field.label,
            path: fieldKey,
          }),
        };
      });
    });
    if (typeof window !== 'undefined' && !adminMetaFromLocalStorage) {
      localStorage.setItem(
        adminMetaLocalStorageKey,
        JSON.stringify({
          hash: hashString(JSON.stringify(adminMeta)),
          meta: adminMeta,
        })
      );
    }
    return runtimeAdminMeta;
  }, [data, error, adminMetaFromLocalStorage]);
  let mustRenderServerResult = useMustRenderServerResult();
  if (mustRenderServerResult) {
    return {
      state: 'loading' as const,
    };
  }
  if (runtimeAdminMeta) {
    return {
      state: 'loaded' as const,
      value: runtimeAdminMeta,
    };
  }
  if (error) {
    return {
      state: 'error' as const,
      error,
      refetch: () => {
        refetch();
      },
    };
  }
  return {
    state: 'loading' as const,
  };
}
