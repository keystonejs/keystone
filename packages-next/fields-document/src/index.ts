import path from 'path';
import type { FieldType, BaseGeneratedListTypes, FieldConfig } from '@keystone-next/types';
import { DocumentImplementation, PrismaDocumentInterface } from './Implementation';
import { Relationships } from './DocumentEditor/relationship';
import { ComponentBlock } from './component-blocks';
import { DocumentFeatures } from './views';
import { validateAndNormalizeDocument } from './validation';

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
> = FieldConfig<TGeneratedListTypes> & {
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

export const document = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: DocumentFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => {
  const relationships: Relationships = {};
  const configRelationships = config.relationships;
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
  const componentBlocks = config.componentBlocks || {};
  return {
    type: {
      type: 'Document',
      implementation: DocumentImplementation,
      adapters: { prisma: PrismaDocumentInterface },
    },
    config: {
      ...config,
      componentBlocks,
      relationships,
      ___validateAndNormalize: (data: unknown) =>
        validateAndNormalizeDocument(data, documentFeatures, componentBlocks, relationships),
    } as any,
    getAdminMeta(): Parameters<typeof import('./views').controller>[0]['fieldMeta'] {
      return {
        relationships,
        documentFeatures,
        componentBlocksPassedOnServer: Object.keys(componentBlocks),
      };
    },
    views,
  };
};
