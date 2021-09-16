import path from 'path';
import {
  BaseGeneratedListTypes,
  CommonFieldConfig,
  FieldTypeFunc,
  jsonFieldTypePolyfilledForSQLite,
  graphql,
  JSONValue,
} from '@keystone-next/keystone/types';
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

export type DocumentFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    relationships?: RelationshipsConfig;
    componentBlocks?: Record<string, ComponentBlock>;
    formatting?: true | FormattingConfig;
    links?: true;
    dividers?: true;
    layouts?: readonly (readonly [number, ...number[]])[];
  };

const views = path.join(path.dirname(__dirname), 'views');

export const document =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    componentBlocks = {},
    dividers,
    formatting,
    layouts,
    relationships: configRelationships,
    links,
    ...config
  }: DocumentFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const documentFeatures = normaliseDocumentFeatures({
      dividers,
      formatting,
      layouts,
      links,
    });
    const relationships = normaliseRelationships(configRelationships);

    const inputResolver = (data: JSONValue | null | undefined): any => {
      if (data === null) {
        throw new Error(`Document fields cannot be set to null`);
      }
      if (data === undefined) {
        return data;
      }
      return validateAndNormalizeDocument(data, documentFeatures, componentBlocks, relationships);
    };

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type document");
    }

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        input: {
          create: {
            arg: graphql.arg({ type: graphql.JSON }),
            resolve(val) {
              if (val === undefined) {
                val = [{ type: 'paragraph', children: [{ text: '' }] }];
              }
              return inputResolver(val);
            },
          },
          update: { arg: graphql.arg({ type: graphql.JSON }), resolve: inputResolver },
        },
        output: graphql.field({
          type: graphql.object<{ document: JSONValue }>()({
            name: `${meta.listKey}_${meta.fieldKey}_Document`,
            fields: {
              document: graphql.field({
                args: {
                  hydrateRelationships: graphql.arg({
                    type: graphql.nonNull(graphql.Boolean),
                    defaultValue: false,
                  }),
                },
                type: graphql.nonNull(graphql.JSON),
                resolve({ document }, { hydrateRelationships }, context) {
                  return hydrateRelationships
                    ? addRelationshipData(
                        document as any,
                        context.graphql,
                        relationships,
                        componentBlocks,
                        context.gqlNames
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
      },
      {
        mode: 'required',
        default: {
          kind: 'literal',
          value: JSON.stringify([{ type: 'paragraph', children: [{ text: '' }] }]),
        },
      }
    );
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
