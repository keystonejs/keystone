import type { KeystoneConfig, AdminMetaRootVal } from '@keystone-next/types';
import { humanize } from '@keystone-next/utils-legacy';
import { InitialisedList } from './core/types-for-lists';

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
      initialColumns: (listConfig.ui?.listView?.initialColumns as string[]) ?? [labelField],
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
      itemQueryName: list.singularGraphQLName,
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
        isOrderable: !!field.input?.sortBy,
        path: fieldKey,
        listKey: key,
      });
    }
  }

  return adminMetaRoot;
}
