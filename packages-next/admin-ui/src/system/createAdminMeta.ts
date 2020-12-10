import type {
  SerializedAdminMeta,
  KeystoneConfig,
  FieldType,
  BaseKeystone,
} from '@keystone-next/types';
import { viewHash } from '../utils/viewHash';

export function createAdminMeta(config: KeystoneConfig, keystone: BaseKeystone) {
  const { ui, lists } = config;
  const adminMeta: SerializedAdminMeta = {
    enableSessionItem: ui?.enableSessionItem || false,
    enableSignout: config.session !== undefined,
    lists: {},
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
    adminMeta.lists[key] = {
      key,
      labelField,
      description: listConfig.ui?.description ?? listConfig.description ?? null,
      label: list.adminUILabels.label,
      singular: list.adminUILabels.singular,
      plural: list.adminUILabels.plural,
      path: list.adminUILabels.path,
      fields: {},
      pageSize: listConfig.ui?.listView?.pageSize ?? 50,
      gqlNames: list.gqlNames,
      initialColumns: (listConfig.ui?.listView?.initialColumns as string[]) ?? [labelField],
      initialSort:
        (listConfig.ui?.listView?.initialSort as
          | { field: string; direction: 'ASC' | 'DESC' }
          | undefined) ?? null,
    };
  });
  Object.keys(adminMeta.lists).forEach(key => {
    const listConfig = lists[key];
    const list = keystone.lists[key];
    for (const fieldKey of Object.keys(listConfig.fields)) {
      const field: FieldType<any> = listConfig.fields[fieldKey];
      adminMeta.lists[key].fields[fieldKey] = {
        label: list.fieldsByPath[fieldKey].label,
        viewsIndex: viewHash(field.views),
        customViews: field.config.ui?.views === undefined ? null : viewHash(field.config.ui.views),
        fieldMeta: field.getAdminMeta?.(key, fieldKey, adminMeta) ?? null,
        isOrderable: list.fieldsByPath[fieldKey].isOrderable || fieldKey === 'id',
      };
    }
  });

  return { adminMeta };
}
