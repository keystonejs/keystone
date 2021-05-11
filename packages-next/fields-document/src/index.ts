import path from 'path';
import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  FieldTypeFunc,
  fieldType,
  Provider,
  ScalarDBField,
  FieldTypeWithoutDBField,
  tsgql,
  types,
  JSONValue,
  ItemRootValue,
  KeystoneContext,
  FieldInputArg,
} from '@keystone-next/types';
import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import { Relationships } from './DocumentEditor/relationship';
import { ComponentBlock } from './component-blocks';
import { DocumentFeatures } from './views';
import { validateAndNormalizeDocument } from './validation';
import { addRelationshipData } from './relationship-data';

type RelationshipsConfig = Record<
  string,
  {
    listKey: string;
    /** GraphQL fields to select when querying the field */
    selection?: string;
  } & (
    | {
        kind: 'inline';
        label: string;
      }
    | {
        kind: 'prop';
        many?: true;
      }
  )
>;

type FormattingConfig = {
  inlineMarks?:
    | true
    | {
        bold?: true;
        italic?: true;
        underline?: true;
        strikethrough?: true;
        code?: true;
        superscript?: true;
        subscript?: true;
        keyboard?: true;
      };
  listTypes?:
    | true
    | {
        ordered?: true;
        unordered?: true;
      };
  alignment?:
    | true
    | {
        center?: true;
        end?: true;
      };
  headingLevels?: true | readonly (1 | 2 | 3 | 4 | 5 | 6)[];
  blockTypes?:
    | true
    | {
        blockquote?: true;
        code?: true;
      };
  softBreaks?: true;
};

export type DocumentFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  relationships?: RelationshipsConfig;
  componentBlocks?: Record<string, ComponentBlock>;
  formatting?: true | FormattingConfig;
  links?: true;
  dividers?: true;
  layouts?: readonly (readonly [number, ...number[]])[];
};

const views = path.join(
  path.dirname(require.resolve('@keystone-next/fields-document/package.json')),
  'views'
);

function mapOutputFieldToSQLite(
  field: tsgql.OutputField<
    { id: IdType; value: JSONValue; item: ItemRootValue },
    any,
    any,
    'value',
    KeystoneContext
  >
) {
  const innerResolver = field.resolve || (({ value }) => value);
  return types.field<
    { value: string | null; item: ItemRootValue; id: IdType },
    any,
    any,
    'value',
    KeystoneContext
  >({
    type: field.type,
    args: field.args,
    deprecationReason: field.deprecationReason,
    description: field.description,
    extensions: field.extensions,
    resolve(rootVal, ...extra) {
      if (rootVal.value === null) {
        return innerResolver(rootVal, ...extra);
      }
      let value: JSONValue = null;
      try {
        value = JSON.parse(rootVal.value);
      } catch (err) {}
      return innerResolver({ id: rootVal.id, item: rootVal.item, value }, ...extra);
    },
  });
}

function mapInputArgToSQLite<Arg extends tsgql.Arg<tsgql.InputType, any>>(
  arg: FieldInputArg<JSONValue | null | undefined, Arg> | undefined
): FieldInputArg<string | null | undefined, Arg> | undefined {
  if (arg === undefined) {
    return undefined;
  }
  return {
    arg: arg.arg,
    async resolve(input: tsgql.InferValueFromArg<Arg>, context: KeystoneContext) {
      const resolvedInput = arg.resolve === undefined ? input : await arg.resolve(input, context);
      if (resolvedInput === undefined || resolvedInput === null) {
        return resolvedInput;
      }
      return JSON.stringify(resolvedInput);
    },
  } as any;
}

function jsonFieldTypePolyfilledForSQLite<
  CreateArg extends tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any>
>(
  provider: Provider,
  config: FieldTypeWithoutDBField<
    ScalarDBField<'Json', 'optional'>,
    CreateArg,
    UpdateArg,
    FilterArg,
    UniqueFilterArg
  >
) {
  if (config.input?.uniqueWhere || config.input?.where || config.input?.orderBy) {
    throw new Error(
      'jsonFieldTypePolyfilledForSQLite does not support fields that implement uniqueWhere, where or sortBy'
    );
  }

  if (provider === 'sqlite') {
    return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'String' })({
      ...config,
      input: {
        create: mapInputArgToSQLite(config.input?.create),
        update: mapInputArgToSQLite(config.input?.update),
      },
      output: mapOutputFieldToSQLite(config.output),
      extraOutputFields: Object.fromEntries(
        Object.entries(config.extraOutputFields || {}).map(([key, field]) => [
          key,
          mapOutputFieldToSQLite(field),
        ])
      ),
    });
  }
  return fieldType({ kind: 'scalar', mode: 'optional', scalar: 'Json' })(config);
}

export const document = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  componentBlocks = {},
  dividers,
  formatting,
  layouts,
  relationships: configRelationships,
  links,
  ...config
}: DocumentFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc => meta => {
  const documentFeatures = normaliseDocumentFeatures({
    dividers,
    formatting,
    layouts,
    links,
  });
  const relationships = normaliseRelationships(configRelationships);

  const inputResolver = (data: JSONValue | null | undefined): any => {
    if (data === null || data === undefined) {
      return data;
    }
    return validateAndNormalizeDocument(data, documentFeatures, componentBlocks, relationships);
  };

  return jsonFieldTypePolyfilledForSQLite(meta.provider, {
    ...config,
    input: {
      create: { arg: types.arg({ type: types.JSON }), resolve: inputResolver },
      update: { arg: types.arg({ type: types.JSON }), resolve: inputResolver },
    },
    output: types.field({
      type: types.object<{ document: JSONValue }>()({
        name: `${meta.listKey}_${meta.fieldKey}_DocumentField`,
        fields: {
          document: types.field({
            args: {
              hydrateRelationships: types.arg({
                type: types.nonNull(types.Boolean),
                defaultValue: false,
              }),
            },
            type: types.nonNull(types.JSON),
            resolve({ document }, { hydrateRelationships }, context) {
              return hydrateRelationships
                ? addRelationshipData(
                    document as any,
                    context.graphql,
                    relationships,
                    componentBlocks,
                    context.gqlNames as any
                  )
                : (document as any);
            },
          }),
        },
      }),
      resolve({ value }) {
        if (value === null) {
          return null;
        }
        return { document: value };
      },
    }),
    views,
    getAdminMeta(): Parameters<typeof import('./views').controller>[0]['fieldMeta'] {
      return {
        relationships,
        documentFeatures,
        componentBlocksPassedOnServer: Object.keys(componentBlocks),
      };
    },
  });
};

function normaliseRelationships(
  configRelationships: DocumentFieldConfig<BaseGeneratedListTypes>['relationships']
) {
  const relationships: Relationships = {};
  if (configRelationships) {
    Object.keys(configRelationships).forEach(key => {
      const relationship = configRelationships[key];
      relationships[key] =
        relationship.kind === 'inline'
          ? { ...relationship, selection: relationship.selection ?? null }
          : {
              ...relationship,
              selection: relationship.selection ?? null,
              many: relationship.many || false,
            };
    });
  }
  return relationships;
}

function normaliseDocumentFeatures(
  config: Pick<
    DocumentFieldConfig<BaseGeneratedListTypes>,
    'formatting' | 'dividers' | 'layouts' | 'links'
  >
) {
  const formatting: FormattingConfig =
    config.formatting === true
      ? {
          alignment: true,
          blockTypes: true,
          headingLevels: true,
          inlineMarks: true,
          listTypes: true,
          softBreaks: true,
        }
      : config.formatting ?? {};
  const documentFeatures: DocumentFeatures = {
    formatting: {
      alignment:
        formatting.alignment === true
          ? {
              center: true,
              end: true,
            }
          : {
              center: !!formatting.alignment?.center,
              end: !!formatting.alignment?.end,
            },
      blockTypes:
        formatting?.blockTypes === true
          ? { blockquote: true, code: true }
          : {
              blockquote: !!formatting.blockTypes?.blockquote,
              code: !!formatting.blockTypes?.code,
            },
      headingLevels:
        formatting?.headingLevels === true
          ? [1, 2, 3, 4, 5, 6]
          : [...new Set(formatting?.headingLevels)].sort(),
      inlineMarks:
        formatting.inlineMarks === true
          ? {
              bold: true,
              code: true,
              italic: true,
              keyboard: true,
              strikethrough: true,
              subscript: true,
              superscript: true,
              underline: true,
            }
          : {
              bold: !!formatting.inlineMarks?.bold,
              code: !!formatting.inlineMarks?.code,
              italic: !!formatting.inlineMarks?.italic,
              strikethrough: !!formatting.inlineMarks?.strikethrough,
              underline: !!formatting.inlineMarks?.underline,
              keyboard: !!formatting.inlineMarks?.keyboard,
              subscript: !!formatting.inlineMarks?.subscript,
              superscript: !!formatting.inlineMarks?.superscript,
            },
      listTypes:
        formatting.listTypes === true
          ? { ordered: true, unordered: true }
          : {
              ordered: !!formatting.listTypes?.ordered,
              unordered: !!formatting.listTypes?.unordered,
            },
      softBreaks: !!formatting.softBreaks,
    },
    links: !!config.links,
    layouts: [...new Set((config.layouts || []).map(x => JSON.stringify(x)))].map(x =>
      JSON.parse(x)
    ),
    dividers: !!config.dividers,
  };
  return documentFeatures;
}
