import { JSONValue } from '../types';
import { gql } from './apollo';

export const staticAdminMetaQuery = gql`
  query StaticAdminMeta {
    keystone {
      __typename
      adminMeta {
        __typename
        lists {
          __typename
          key
          itemQueryName
          listQueryName
          initialSort {
            __typename
            field
            direction
          }
          path
          label
          singular
          plural
          description
          initialColumns
          pageSize
          labelField
          isSingleton
          groups {
            __typename
            label
            description
            fields {
              path
            }
          }
          fields {
            __typename
            path
            label
            description
            fieldMeta
            viewsIndex
            customViewsIndex
            search
            isNonNull
            itemView {
              fieldMode
            }
          }
        }
      }
    }
  }
`;

export type StaticAdminMetaQuery = {
  keystone: {
    __typename: 'KeystoneMeta';
    adminMeta: {
      __typename: 'KeystoneAdminMeta';
      lists: Array<{
        __typename: 'KeystoneAdminUIListMeta';
        key: string;
        path: string;
        description: string | null;

        label: string;
        labelField: string;
        singular: string;
        plural: string;

        fields: Array<{
          __typename: 'KeystoneAdminUIFieldMeta';
          path: string;
          label: string;
          description: string | null;
          fieldMeta: JSONValue | null;
          viewsIndex: number;
          customViewsIndex: number | null;
          search: QueryMode | null;
          isNonNull: ('read' | 'create' | 'update')[];
          itemView: {
            __typename: 'KeystoneAdminUIFieldMetaItemView';
            fieldPosition: KeystoneAdminUIFieldMetaItemViewFieldPosition | null;
            fieldMode: KeystoneAdminUIFieldMetaItemViewFieldMode | null;
          } | null;
        }>;
        groups: Array<{
          __typename: 'KeystoneAdminUIFieldGroupMeta';
          label: string;
          description: string | null;
          fields: Array<{
            __typename: 'KeystoneAdminUIFieldMeta';
            path: string;
          }>;
        }>;

        pageSize: number;
        initialColumns: Array<string>;
        initialSort: {
          __typename: 'KeystoneAdminUISort';
          field: string;
          direction: KeystoneAdminUISortDirection;
        } | null;
        isSingleton: boolean;

        // TODO: probably remove this
        itemQueryName: string;
        listQueryName: string;
      }>;
    };
  };
};

type QueryMode = 'default' | 'insensitive';

type KeystoneAdminUIFieldMetaItemViewFieldMode = 'edit' | 'read' | 'hidden';

type KeystoneAdminUIFieldMetaItemViewFieldPosition = 'form' | 'sidebar';

type KeystoneAdminUISortDirection = 'ASC' | 'DESC';
