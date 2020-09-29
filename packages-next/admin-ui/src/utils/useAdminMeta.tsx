import { useEffect, useMemo, useState } from 'react';
import { ApolloClient, useQuery } from '../apollo';
import hashString from '@emotion/hash';
import { SerializedAdminMeta, AdminMeta, FieldViews, getGqlNames } from '@keystone-spike/types';
import { StaticAdminMetaQuery, staticAdminMetaQuery } from '../admin-meta-graphql';

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
  const { data, error, refetch } = useQuery(staticAdminMetaQuery, {
    client,
    skip: adminMetaFromLocalStorage !== undefined,
  });

  const runtimeAdminMeta = useMemo(() => {
    if ((!data || error) && !adminMetaFromLocalStorage) {
      return undefined;
    }
    const adminMeta: StaticAdminMetaQuery['keystone']['adminMeta'] = adminMetaFromLocalStorage
      ? adminMetaFromLocalStorage
      : data.keystone.adminMeta;
    const runtimeAdminMeta: AdminMeta = {
      enableSessionItem: adminMeta.enableSessionItem,
      enableSignout: adminMeta.enableSignout,
      lists: {},
    };
    adminMeta.lists.forEach(list => {
      runtimeAdminMeta.lists[list.key] = {
        ...list,
        gqlNames: getGqlNames({
          listKey: list.key,
          itemQueryName: list.itemQueryName,
          listQueryName: list.listQueryName,
        }),
        fields: {},
      };
      list.fields.forEach(field => {
        Object.keys(expectedExports).forEach(exportName => {
          if ((fieldViews[field.views] as any)[exportName] === undefined) {
            throw new Error(
              `View for field at path ${list.key}.${field.path} is missing ${exportName} export`
            );
          }
        });
        Object.keys(fieldViews[field.views]).forEach(exportName => {
          if (expectedExports[exportName] === undefined) {
            throw new Error(
              `Unexpected export named ${exportName} from view from field at ${list.key}.${field.path}`
            );
          }
        });
        runtimeAdminMeta.lists[list.key].fields[field.path] = {
          ...field,
          views: fieldViews[field.views],
          controller: fieldViews[field.views].controller({
            fieldMeta: field.fieldMeta,
            label: field.label,
            path: field.path,
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
