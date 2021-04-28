import type { KeystoneConfig, BaseKeystone, AdminMetaRootVal } from '@keystone-next/types';

export function createAdminMeta(config: KeystoneConfig, keystone: BaseKeystone) {
  const { lists, session } = config;
  const adminMetaRoot: AdminMetaRootVal = {
    enableSignout: session !== undefined,
    listsByKey: {},
    lists: [],
  };

  Object.keys(lists).forEach(key => {
    const listConfig = lists[key];
    const list = keystone.lists[key];
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
        ...Object.keys(listConfig.fields)
          .filter(fieldKey => listConfig.fields[fieldKey].config.access?.read !== false)
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
      itemQueryName: list.gqlNames.itemQueryName,
      listQueryName: list.gqlNames.listQueryName.replace('all', ''),
    };
    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[key]);
  });

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
  Object.keys(lists).forEach(key => {
    const listConfig = lists[key];
    const list = keystone.lists[key];
    for (const fieldKey of Object.keys(listConfig.fields).filter(
      path => listConfig.fields[path].config.access?.read !== false
    )) {
      const field = listConfig.fields[fieldKey];
      adminMetaRoot.listsByKey[key].fields.push({
        label: list.fieldsByPath[fieldKey].label,
        viewsIndex: getViewId(field.views),
        customViewsIndex:
          field.config.ui?.views === undefined ? null : getViewId(field.config.ui.views),
        fieldMeta: field.getAdminMeta?.(key, fieldKey, adminMetaRoot) ?? null,
        isOrderable: list.fieldsByPath[fieldKey].isOrderable || fieldKey === 'id',
        path: fieldKey,
        listKey: key,
      });
    }
  });

  return adminMetaRoot;
}
