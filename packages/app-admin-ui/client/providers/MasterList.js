/* global KEYSTONE_ADMIN_META */

import React, { useContext, createContext } from 'react';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import List from '../classes/List';
import FetchingListsPage from '../pages/FetchingLists';
import { useAdminMeta } from './AdminMeta';

import { views, readViews, preloadViews } from '../FIELD_TYPES';

// TODO: eventually, we'll get everything through the query below and won't need this
const { lists: adminMetaListData } = KEYSTONE_ADMIN_META;

const MasterListContext = createContext();

const LISTS_QUERY = gql`
  query getAllLists {
    meta: _ksListsMeta(where: { auxiliary: false }) {
      key
      path
      label
      singular
      plural
      description
      access {
        create
        read
        update
        delete
      }
      schema {
        sortType
        queries {
          item
          list
          meta
        }
        mutations {
          create
          createMany
          update
          updateMany
          delete
          deleteMany
        }
        inputTypes {
          whereInput
          createInput
          createManyInput
          updateInput
          updateManyInput
        }
      }
    }
  }
`;

/**
 * Handles metadata on all available lists.
 */
export const MasterListProvider = ({ children }) => {
  const { adminPath } = useAdminMeta();
  const { data, loading } = useQuery(LISTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    partialRefetch: true,
  });

  // Don't render the rest of the app until this is done fetching everything
  if (loading) {
    return <FetchingListsPage />;
  }

  //
  // We've consciously made a design choice that the `read` permission on a
  // list is a master switch in the Admin UI (not the GraphQL API).
  //
  // - If you want to Create without the Read permission, you technically don't
  // have permission to read the result of your creation.
  // - If you want to Update an item, you can't see what the current values are.
  // - If you want to delete an item, you'd need to be given direct access to it
  // (direct URI), but can't see anything about that item. And in fact, being able
  // to load a page with a 'delete' button on it violates the read permission as
  // it leaks the fact that item exists.
  //
  // In all these cases, the Admin UI becomes unnecessarily complex,
  // so we only allow all these actions if you also have read access.
  // TODO: see if we can handle this server-side in the `where` input.
  //
  const listsCanRead = data.meta.filter(({ access: { read } }) => read !== false);

  const listsByKey = {};
  const listsByPath = {};

  const getListByKey = key => listsByKey[key];
  const getListByPath = path => listsByPath[path];

  // Create the actual List objects
  listsCanRead.forEach(
    ({
      key,
      path,
      label,
      singular,
      plural,
      description,
      access,
      schema: { sortType, queries, mutations, inputTypes },
    }) => {
      // Grab these from the global lists object since they aren't available via query yet.
      const { adminConfig, fields } = adminMetaListData[key];

      // TODO: make use of the schema in List class
      const gqlNames = {
        itemQueryName: queries.item,
        listQueryName: queries.list,
        listQueryMetaName: queries.meta,
        listSortName: sortType,
        whereInputName: inputTypes.whereInput,
        createInputName: inputTypes.createInput,
        createMutationName: mutations.create,
        createManyInputName: inputTypes.createManyInput,
        createManyMutationName: mutations.createMany,
        updateInputName: inputTypes.updateInput,
        updateMutationName: mutations.update,
        updateManyInputName: inputTypes.updateManyInput,
        updateManyMutationName: mutations.updateMany,
        deleteMutationName: mutations.delete,
        deleteManyMutationName: mutations.deleteMany,
      };

      const list = new List(
        {
          access,
          adminConfig,
          adminDoc: description, // TODO: rename in class?
          fields,
          gqlNames,
          key,
          label,
          path,
          plural,
          singular,
        },
        { readViews, preloadViews, getListByKey, adminPath },
        views[key]
      );

      listsByKey[key] = list;
      listsByPath[list.path] = list;
    }
  );

  // Get list keys ordered by list label
  const listKeys = Object.values(listsByKey)
    .sort(({ label: a }, { label: b }) => a.localeCompare(b)) // TODO: locale options once intl support is added
    .map(({ key }) => key);

  return (
    <MasterListContext.Provider
      value={{
        listKeys,
        getListByKey,
        getListByPath,
      }}
    >
      {children}
    </MasterListContext.Provider>
  );
};

export const useMasterList = () => useContext(MasterListContext);
