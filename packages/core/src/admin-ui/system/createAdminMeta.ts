import path from 'path';
import {
  KeystoneConfig,
  MaybePromise,
  MaybeSessionFunction,
  BaseListTypeInfo,
  KeystoneContext,
  JSONValue,
  MaybeItemFunction,
} from '../../types';
import { humanize } from '../../lib/utils';
import { InitialisedList } from '../../lib/core/types-for-lists';
import { FilterOrderArgs } from '../../types/config/fields';

type ContextFunction<Return> = (context: KeystoneContext) => MaybePromise<Return>;

export type FieldMetaRootVal = {
  key: string;
  /**
   * @deprecated use .key, not .path
   */
  path: string;
  label: string;
  description: string | null;
  fieldMeta: JSONValue | null;
  viewsIndex: number;
  customViewsIndex: number | null;
  listKey: string;
  search: 'default' | 'insensitive' | null;
  isOrderable: ContextFunction<boolean>;
  isFilterable: ContextFunction<boolean>;
  isNonNull: ('read' | 'create' | 'update')[];
  createView: { fieldMode: ContextFunction<'edit' | 'hidden'> };
  // itemView is intentionally special because static values are special cased
  // and fetched when fetching the static admin ui
  itemView: {
    fieldMode: MaybeItemFunction<'edit' | 'read' | 'hidden', BaseListTypeInfo>;
    fieldPosition: MaybeItemFunction<'form' | 'sidebar', BaseListTypeInfo>;
  };
  listView: { fieldMode: ContextFunction<'read' | 'hidden'> };
};

export type FieldGroupMeta = {
  label: string;
  description: string | null;
  fields: Array<FieldMetaRootVal>;
};

export type ListMetaRootVal = {
  key: string;
  path: string;
  description: string | null;

  label: string;
  labelField: string;
  singular: string;
  plural: string;

  fields: FieldMetaRootVal[];
  fieldsByKey: Record<string, FieldMetaRootVal>;
  groups: Array<FieldGroupMeta>;

  pageSize: number;
  initialColumns: string[];
  initialSort: { field: string; direction: 'ASC' | 'DESC' } | null;
  isSingleton: boolean;

  // TODO: probably remove this
  itemQueryName: string;
  listQueryName: string;
  isHidden: ContextFunction<boolean>;
  hideCreate: ContextFunction<boolean>;
  hideDelete: ContextFunction<boolean>;
};

export type AdminMetaRootVal = {
  lists: ListMetaRootVal[];
  listsByKey: Record<string, ListMetaRootVal>;
  views: string[];
  isAccessAllowed: undefined | ((context: KeystoneContext) => MaybePromise<boolean>);
};

export function createAdminMeta(
  config: KeystoneConfig,
  initialisedLists: Record<string, InitialisedList>
) {
  const { lists } = config;
  const adminMetaRoot: AdminMetaRootVal = {
    listsByKey: {},
    lists: [],
    views: [],
    isAccessAllowed: config.ui?.isAccessAllowed,
  };

  const omittedLists: string[] = [];

  for (const [listKey, list] of Object.entries(initialisedLists)) {
    const listConfig = lists[listKey];
    if (list.graphql.isEnabled.query === false) {
      omittedLists.push(listKey);
      continue;
    }

    let initialColumns: string[];
    if (listConfig.ui?.listView?.initialColumns) {
      // If they've asked for a particular thing, give them that thing
      initialColumns = listConfig.ui.listView.initialColumns as string[];
    } else {
      // Otherwise, we'll start with the labelField on the left and then add
      // 2 more fields to the right of that. We don't include the 'id' field
      // unless it happened to be the labelField
      initialColumns = [
        list.ui.labelField,
        ...Object.keys(list.fields)
          .filter(fieldKey => list.fields[fieldKey].graphql.isEnabled.read)
          .filter(fieldKey => fieldKey !== list.ui.labelField)
          .filter(fieldKey => fieldKey !== 'id'),
      ].slice(0, 3);
    }

    const maximumPageSize = Math.min(
      listConfig.ui?.listView?.pageSize ?? 50,
      (list.graphql.types.findManyArgs.take.defaultValue ?? Infinity) as number
    );

    adminMetaRoot.listsByKey[listKey] = {
      key: listKey,
      path: list.ui.labels.path,
      description: listConfig.ui?.description ?? listConfig.description ?? null,

      label: list.ui.labels.label,
      labelField: list.ui.labelField,
      singular: list.ui.labels.singular,
      plural: list.ui.labels.plural,

      fields: [],
      fieldsByKey: {},
      groups: [],

      pageSize: maximumPageSize,
      initialColumns,
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
      isSingleton: list.isSingleton,

      // TODO: probably remove this
      itemQueryName: listKey,
      listQueryName: list.graphql.namePlural, // TODO: remove
      hideCreate: normalizeMaybeSessionFunction(
        list.graphql.isEnabled.create ? listConfig.ui?.hideCreate ?? false : false
      ),
      hideDelete: normalizeMaybeSessionFunction(
        list.graphql.isEnabled.delete ? listConfig.ui?.hideDelete ?? false : false
      ),
      isHidden: normalizeMaybeSessionFunction(listConfig.ui?.isHidden ?? false),
    };

    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[listKey]);
  }

  let uniqueViewCount = -1;
  const stringViewsToIndex: Record<string, number> = {};
  function getViewId(view: string) {
    if (stringViewsToIndex[view] !== undefined) {
      return stringViewsToIndex[view];
    }
    uniqueViewCount++;
    stringViewsToIndex[view] = uniqueViewCount;
    adminMetaRoot.views.push(view);
    return uniqueViewCount;
  }

  // populate .fields array
  for (const [listKey, list] of Object.entries(initialisedLists)) {
    if (omittedLists.includes(listKey)) continue;

    const listConfig = lists[listKey];

    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // If the field is a relationship field and is related to an omitted list, skip.
      if (field.dbField.kind === 'relation' && omittedLists.includes(field.dbField.list)) continue;

      // TODO: you could technically update, but not read
      if (field.graphql.isEnabled.read === false) continue;

      assertValidView(
        field.views,
        `The \`views\` on the implementation of the field type at lists.${listKey}.fields.${fieldKey}`
      );

      const baseOrderFilterArgs = { fieldKey, listKey: list.listKey };
      const isNonNull = (['read', 'create', 'update'] as const).filter(
        operation => field.graphql.isNonNull[operation]
      );

      const fieldMeta = {
        key: fieldKey,
        label: field.label ?? humanize(fieldKey),
        description: field.ui?.description ?? null,
        viewsIndex: getViewId(field.views),
        customViewsIndex:
          field.ui?.views === undefined
            ? null
            : (assertValidView(field.views, `lists.${listKey}.fields.${fieldKey}.ui.views`),
              getViewId(field.ui.views)),
        fieldMeta: null,
        listKey: listKey,
        search: list.ui.searchableFields.get(fieldKey) ?? null,
        createView: {
          fieldMode: normalizeMaybeSessionFunction(
            field.graphql.isEnabled.create
              ? field.ui?.createView?.fieldMode ??
                  listConfig.ui?.createView?.defaultFieldMode ??
                  'edit'
              : 'hidden'
          ),
        },
        itemView: {
          fieldMode: field.ui?.itemView.fieldMode,
          fieldPosition: field.ui?.itemView?.fieldPosition || 'form',
        },
        listView: {
          fieldMode: normalizeMaybeSessionFunction(
            field.ui?.listView?.fieldMode ?? listConfig.ui?.listView?.defaultFieldMode ?? 'read'
          ),
        },
        isFilterable: normalizeIsOrderFilter(
          field.input?.where ? field.graphql.isEnabled.filter : false,
          baseOrderFilterArgs
        ),
        isOrderable: normalizeIsOrderFilter(
          field.input?.orderBy ? field.graphql.isEnabled.orderBy : false,
          baseOrderFilterArgs
        ),
        isNonNull,

        // DEPRECATED
        path: fieldKey,
      };

      adminMetaRoot.listsByKey[listKey].fields.push(fieldMeta);
      adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey] = fieldMeta;
    }
    for (const group of list.groups) {
      adminMetaRoot.listsByKey[listKey].groups.push({
        label: group.label,
        description: group.description,
        fields: group.fields.map(
          fieldKey => adminMetaRoot.listsByKey[listKey].fieldsByKey[fieldKey]
        ),
      });
    }
  }

  // we do this seperately to the above so that fields can check other fields to validate their config or etc.
  // (ofc they won't necessarily be able to see other field's fieldMeta)
  for (const [key, list] of Object.entries(initialisedLists)) {
    if (list.graphql.isEnabled.query === false) continue;
    for (const fieldMetaRootVal of adminMetaRoot.listsByKey[key].fields) {
      const dbField = list.fields[fieldMetaRootVal.path].dbField;
      // If the field is a relationship field and is related to an omitted list, skip.
      if (dbField.kind === 'relation' && omittedLists.includes(dbField.list)) {
        continue;
      }
      currentAdminMeta = adminMetaRoot;
      try {
        fieldMetaRootVal.fieldMeta = list.fields[fieldMetaRootVal.path].getAdminMeta?.() ?? null;
      } finally {
        currentAdminMeta = undefined;
      }
    }
  }

  return adminMetaRoot;
}

let currentAdminMeta: undefined | AdminMetaRootVal;

export function getAdminMetaForRelationshipField() {
  if (currentAdminMeta === undefined) {
    throw new Error('unexpected call to getAdminMetaInRelationshipField');
  }

  return currentAdminMeta;
}

function assertValidView(view: string, location: string) {
  if (view.includes('\\')) {
    throw new Error(
      `${location} contains a backslash, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`
    );
  }

  if (path.isAbsolute(view)) {
    throw new Error(
      `${location} is an absolute path, which is invalid. You need to use a module path that is resolved from where 'keystone start' is run (see https://github.com/keystonejs/keystone/pull/7805)`
    );
  }
}

function normalizeMaybeSessionFunction<Return extends string | boolean>(
  input: MaybeSessionFunction<Return, BaseListTypeInfo>
): ContextFunction<Return> {
  if (typeof input !== 'function') {
    return () => input;
  }
  return context => input({ context, session: context.session });
}

type BaseOrderFilterArgs = { listKey: string; fieldKey: string };

function normalizeIsOrderFilter(
  input: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>),
  baseOrderFilterArgs: BaseOrderFilterArgs
): ContextFunction<boolean> {
  if (typeof input !== 'function') {
    return () => input;
  }
  return context => input({ context, session: context.session, ...baseOrderFilterArgs });
}
