import type { KeystoneConfig, BaseKeystone, AdminMetaRootVal } from '@keystone-next/types';
import { viewHash } from '../utils/viewHash';

export function createAdminMeta(config: KeystoneConfig, keystone: BaseKeystone) {
  const { ui, lists, session } = config;
  const adminMetaRoot: AdminMetaRootVal = {
    enableSessionItem: ui?.enableSessionItem || false,
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
      itemQueryName: list.gqlNames.itemQueryName,
      listQueryName: list.gqlNames.listQueryName.replace('all', ''),
    };
    adminMetaRoot.lists.push(adminMetaRoot.listsByKey[key]);
  });
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
        viewsHash: viewHash(field.views),
        customViewsHash:
          field.config.ui?.views === undefined ? null : viewHash(field.config.ui.views),
        fieldMeta: field.getAdminMeta?.(key, fieldKey, adminMetaRoot) ?? null,
        isOrderable: list.fieldsByPath[fieldKey].isOrderable || fieldKey === 'id',
        path: fieldKey,
        listKey: key,
      });
    }
  });

  return adminMetaRoot;
}
