import type { KeystoneConfig, AdminMetaRootVal } from '@keystone-next/types';
import { humanize } from '@keystone-next/utils-legacy';
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
  };

  for (const [key, list] of Object.entries(initialisedLists)) {
    const listConfig = lists[key];
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
          .filter(fieldKey => list.fields[fieldKey].access.read !== false)
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
  const views: string[] = [];
  function getViewId(view: string) {
    if (stringViewsToIndex[view] !== undefined) {
      return stringViewsToIndex[view];
    }
    uniqueViewCount++;
    stringViewsToIndex[view] = uniqueViewCount;
    views.push(view);
    return uniqueViewCount;
  }
  // Populate .fields array
  for (const [key, list] of Object.entries(initialisedLists)) {
    for (const [fieldKey, field] of Object.entries(list.fields)) {
      if (field.access.read === false) continue;
      adminMetaRoot.listsByKey[key].fields.push({
        label: field.label ?? humanize(fieldKey),
        viewsIndex: getViewId(field.views),
        customViewsIndex: field.ui?.views === undefined ? null : getViewId(field.ui.views),
        fieldMeta: field.getAdminMeta?.(adminMetaRoot) ?? null,
        isOrderable: !!field.input?.orderBy,
        path: fieldKey,
        listKey: key,
      });
    }
  }

  return adminMetaRoot;
}
