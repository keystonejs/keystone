import { GraphQLString, isInputObjectType } from 'graphql';
import { KeystoneConfig, AdminMetaRootVal, QueryMode } from '../../types';
import { humanize } from '../../lib/utils';
import { InitialisedList } from '../../lib/core/types-for-lists';

export function createAdminMeta(
  config: KeystoneConfig,
  initialisedLists: Record<string, InitialisedList>
) {
  const { ui, lists, session } = config;
  const adminMetaRoot: AdminMetaRootVal = {
    enableSessionItem: ui?.enableSessionItem || false,
    enableSignout: session !== undefined,
    listsByKey: {},
    lists: [],
    views: [],
  };

  const omittedLists: string[] = [];

  for (const [key, list] of Object.entries(initialisedLists)) {
    const listConfig = lists[key];
    if (list.graphql.isEnabled.query === false) {
      // If graphql querying is disabled on the list,
      // push the key into the ommittedLists array for use further down in the procedure and skip.
      omittedLists.push(key);

      continue;
    }
    // Default the labelField to `name`, `label`, or `title` if they exist; otherwise fall back to `id`
    const labelField =
      (listConfig.ui?.labelField as string | undefined) ??
      (listConfig.fields.label
        ? 'label'
        : listConfig.fields.name
        ? 'name'
        : listConfig.fields.title
        ? 'title'
        : 'id');

    let initialColumns: string[];
    if (listConfig.ui?.listView?.initialColumns) {
      // If they've asked for a particular thing, give them that thing
      initialColumns = listConfig.ui.listView.initialColumns as string[];
    } else {
      // Otherwise, we'll start with the labelField on the left and then add
      // 2 more fields to the right of that. We don't include the 'id' field
      // unless it happened to be the labelField
      initialColumns = [
        labelField,
        ...Object.keys(list.fields)
          .filter(fieldKey => list.fields[fieldKey].graphql.isEnabled.read)
          .filter(fieldKey => fieldKey !== labelField)
          .filter(fieldKey => fieldKey !== 'id'),
      ].slice(0, 3);
    }

    adminMetaRoot.listsByKey[key] = {
      key,
      labelField,
      description: listConfig.ui?.description ?? listConfig.description ?? null,
      label: list.adminUILabels.label,
      singular: list.adminUILabels.singular,
      plural: list.adminUILabels.plural,
      path: list.adminUILabels.path,
      fields: [],
      pageSize: listConfig.ui?.listView?.pageSize ?? 50,
      initialColumns,
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
      // TODO: probably remove this from the GraphQL schema and here
      itemQueryName: key,
      listQueryName: list.pluralGraphQLName,
    };
    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[key]);
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
  // Populate .fields array
  for (const [key, list] of Object.entries(initialisedLists)) {
    if (omittedLists.includes(key)) continue;
    const searchFields = new Set(config.lists[key].ui?.searchFields ?? []);
    if (searchFields.has('id')) {
      throw new Error(
        `The ui.searchFields option on the ${key} list includes 'id'. Lists can always be searched by an item's id so it must not be specified as a search field`
      );
    }
    const whereInputFields = list.types.where.graphQLType.getFields();
    const possibleSearchFields = new Map<string, 'default' | 'insensitive' | null>();

    for (const fieldKey of Object.keys(list.fields)) {
      const filterType = whereInputFields[fieldKey]?.type;
      const fieldFilterFields = isInputObjectType(filterType) ? filterType.getFields() : undefined;
      if (fieldFilterFields?.contains?.type === GraphQLString) {
        possibleSearchFields.set(
          fieldKey,
          fieldFilterFields?.mode?.type === QueryMode.graphQLType ? 'insensitive' : 'default'
        );
      }
    }
    if (config.lists[key].ui?.searchFields === undefined) {
      const labelField = adminMetaRoot.listsByKey[key].labelField;
      if (possibleSearchFields.has(labelField)) {
        searchFields.add(labelField);
      }
    }

    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // If the field is a relationship field and is related to an omitted list, skip.
      if (field.dbField.kind === 'relation' && omittedLists.includes(field.dbField.list)) continue;
      // FIXME: Disabling this entirely for now until the Admin UI can properly
      // handle `omit: ['read']` correctly.
      if (field.graphql.isEnabled.read === false) continue;
      let search = searchFields.has(fieldKey) ? possibleSearchFields.get(fieldKey) ?? null : null;
      if (searchFields.has(fieldKey) && search === null) {
        throw new Error(
          `The ui.searchFields option on the ${key} list includes '${fieldKey}' but that field doesn't have a contains filter that accepts a GraphQL String`
        );
      }
      adminMetaRoot.listsByKey[key].fields.push({
        label: field.label ?? humanize(fieldKey),
        viewsIndex: getViewId(field.views),
        customViewsIndex: field.ui?.views === undefined ? null : getViewId(field.ui.views),
        fieldMeta: null,
        path: fieldKey,
        listKey: key,
        search,
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
      fieldMetaRootVal.fieldMeta =
        list.fields[fieldMetaRootVal.path].getAdminMeta?.(adminMetaRoot) ?? null;
    }
  }

  return adminMetaRoot;
}
