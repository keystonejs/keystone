import { GraphQLString, isInputObjectType } from 'graphql';
import {
  KeystoneConfig,
  AdminMetaRootVal,
  QueryMode,
  CommonModelMetaRootVal,
  ModelMetaRootVal,
  ListMetaRootVal,
} from '../../types';
import { assertNever, humanize } from '../../lib/utils';
import { InitialisedModel } from '../../lib/core/types-for-lists';

export function createAdminMeta(
  config: KeystoneConfig,
  initialisedModels: Record<string, InitialisedModel>
) {
  const { ui, session } = config;
  const adminMetaRoot: AdminMetaRootVal = {
    enableSessionItem: ui?.enableSessionItem || false,
    enableSignout: session !== undefined,
    modelByKey: {},
    models: [],
    views: [],
  };

  const omittedModels: string[] = [];

  for (const [key, model] of Object.entries(initialisedModels)) {
    if (model.graphql.isEnabled.query === false) {
      // If graphql querying is disabled on the model,
      // push the key into the omittedModel array for use further down in the procedure and skip.
      omittedModels.push(key);

      continue;
    }

    const commonModelMeta: CommonModelMetaRootVal = {
      key,
      description: model.config.ui?.description ?? model.config.description ?? null,
      fields: [],
      label: model.adminUILabels.label,
      singular: model.adminUILabels.singular,
      path: model.adminUILabels.path,
    };

    let modelMeta: ModelMetaRootVal;
    if (model.kind === 'list') {
      // Default the labelField to `name`, `label`, or `title` if they exist; otherwise fall back to `id`
      const labelField =
        (model.config.ui?.labelField as string | undefined) ??
        (model.config.fields.label
          ? 'label'
          : model.config.fields.name
          ? 'name'
          : model.config.fields.title
          ? 'title'
          : 'id');

      let initialColumns: string[];
      if (model.config.ui?.listView?.initialColumns) {
        // If they've asked for a particular thing, give them that thing
        initialColumns = model.config.ui.listView.initialColumns as string[];
      } else {
        // Otherwise, we'll start with the labelField on the left and then add
        // 2 more fields to the right of that. We don't include the 'id' field
        // unless it happened to be the labelField
        initialColumns = [
          labelField,
          ...Object.keys(model.fields)
            .filter(fieldKey => model.fields[fieldKey].graphql.isEnabled.read)
            .filter(fieldKey => fieldKey !== labelField)
            .filter(fieldKey => fieldKey !== 'id'),
        ].slice(0, 3);
      }
      modelMeta = {
        ...commonModelMeta,
        kind: 'list',
        labelField,
        plural: model.adminUILabels.plural,
        pageSize: model.config.ui?.listView?.pageSize ?? 50,
        initialColumns,
        initialSort:
          (model.config.ui?.listView?.initialSort as
            | { field: string; direction: 'ASC' | 'DESC' }
            | undefined) ?? null,
        graphqlPlural: model.pluralGraphQLName,
      };
    } else if (model.kind === 'singleton') {
      modelMeta = {
        ...commonModelMeta,
        kind: 'singleton',
      };
    } else {
      assertNever(model);
    }

    adminMetaRoot.modelByKey[key] = modelMeta;
    adminMetaRoot.models.push(modelMeta);
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
  for (const [key, model] of Object.entries(initialisedModels)) {
    if (omittedModels.includes(key)) continue;
    let searchFields: Set<string>;

    if (model.kind === 'list') {
      searchFields = new Set(model.config.ui?.searchFields ?? []);
      if (searchFields.has('id')) {
        throw new Error(
          `The ui.searchFields option on the ${key} model includes 'id'. Model can always be searched by an item's id so it must not be specified as a search field`
        );
      }
      const whereInputFields = model.types.where.graphQLType.getFields();
      const possibleSearchFields = new Map<string, 'default' | 'insensitive' | null>();

      for (const fieldKey of Object.keys(model.fields)) {
        const filterType = whereInputFields[fieldKey]?.type;
        const fieldFilterFields = isInputObjectType(filterType)
          ? filterType.getFields()
          : undefined;
        if (fieldFilterFields?.contains?.type === GraphQLString) {
          possibleSearchFields.set(
            fieldKey,
            fieldFilterFields?.mode?.type === QueryMode.graphQLType ? 'insensitive' : 'default'
          );
        }
      }
      if (model.config.ui?.searchFields === undefined) {
        const labelField = (adminMetaRoot.modelByKey[key] as ListMetaRootVal).labelField;
        if (possibleSearchFields.has(labelField)) {
          searchFields.add(labelField);
        }
      }

      for (const [fieldKey, field] of Object.entries(model.fields)) {
        // If the field is a relationship field and is related to an omitted list, skip.
        if (field.dbField.kind === 'relation' && omittedModels.includes(field.dbField.list)) {
          continue;
        }
        // FIXME: Disabling this entirely for now until the Admin UI can properly
        // handle `omit: ['read']` correctly.
        if (field.graphql.isEnabled.read === false) continue;
        let search = searchFields.has(fieldKey) ? possibleSearchFields.get(fieldKey) ?? null : null;
        if (searchFields.has(fieldKey) && search === null) {
          throw new Error(
            `The ui.searchFields option on the ${key} model includes '${fieldKey}' but that field doesn't have a contains filter that accepts a GraphQL String`
          );
        }
        adminMetaRoot.modelByKey[key].fields.push({
          label: field.label ?? humanize(fieldKey),
          description: field.ui?.description ?? null,
          viewsIndex: getViewId(field.views),
          customViewsIndex: field.ui?.views === undefined ? null : getViewId(field.ui.views),
          fieldMeta: null,
          path: fieldKey,
          modelKey: key,
          search,
        });
      }
    }
  }

  // we do this seperately to the above so that fields can check other fields to validate their config or etc.
  // (ofc they won't necessarily be able to see other field's fieldMeta)
  for (const [key, model] of Object.entries(initialisedModels)) {
    if (model.graphql.isEnabled.query === false) continue;
    for (const fieldMetaRootVal of adminMetaRoot.modelByKey[key].fields) {
      const dbField = model.fields[fieldMetaRootVal.path].dbField;
      // If the field is a relationship field and is related to an omitted list, skip.
      if (dbField.kind === 'relation' && omittedModels.includes(dbField.list)) {
        continue;
      }
      fieldMetaRootVal.fieldMeta =
        model.fields[fieldMetaRootVal.path].getAdminMeta?.(adminMetaRoot) ?? null;
    }
  }

  return adminMetaRoot;
}
