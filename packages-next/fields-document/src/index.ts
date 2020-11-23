import { DocumentFieldType } from './base-field-type';
import type { FieldType, BaseGeneratedListTypes, FieldConfig } from '@keystone-next/types';
import path from 'path';
import { Relationships } from './DocumentEditor/relationship';

type RelationshipsConfig = Record<
  string,
  {
    listKey: string;
    /** GraphQL fields to select when querying the field */
    selection?: string;
    // TODO: remove the need for this
    /** This must be identical to the labelField of the list specified in the listKey */
    labelField: string;
  } & (
    | {
        kind: 'inline';
        label: string;
      }
    | {
        kind: 'block';
        label: string;
        many?: true;
      }
    | {
        kind: 'prop';
        many?: true;
      }
  )
>;

export type DocumentFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  relationships?: RelationshipsConfig;
  inlineMarks?: {
    bold?: true;
    italic?: true;
    underline?: true;
    strikethrough?: true;
    code?: true;
  };
  listTypes?: {
    ordered?: true;
    unordered?: true;
  };
  alignment?: {
    center?: true;
    end?: true;
  };
  headingLevels?: readonly (1 | 2 | 3 | 4 | 5 | 6)[];
  blockTypes?: {
    blockquote?: true;
    panel?: true;
    quote?: true;
    // code?: true;
  };
  link?: true;
  columns?: readonly (readonly [number, ...number[]])[];
};

const views = path.join(
  path.dirname(require.resolve('@keystone-next/fields-document/package.json')),
  'views'
);

export const document = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: DocumentFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: DocumentFieldType,
  config,
  getAdminMeta(): Parameters<typeof import('./views').controller>[0]['fieldMeta'] {
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
    return {
      relationships,
      documentFeatures: {
        alignment: {
          center: !!config.alignment?.center,
          end: !!config.alignment?.end,
        },
        blockTypes: {
          blockquote: !!config.blockTypes?.blockquote,
          panel: !!config.blockTypes?.panel,
          quote: !!config.blockTypes?.quote,
        },
        headingLevels: [...new Set(config.headingLevels)].sort(),
        inlineMarks: {
          bold: !!config.inlineMarks?.bold,
          code: !!config.inlineMarks?.code,
          italic: !!config.inlineMarks?.italic,
          strikethrough: !!config.inlineMarks?.strikethrough,
          underline: !!config.inlineMarks?.underline,
        },
        listTypes: {
          ordered: !!config.listTypes?.ordered,
          unordered: !!config.listTypes?.unordered,
        },
        link: !!config.link,
        columns: [...new Set((config.columns || []).map(x => JSON.stringify(x)))].map(x =>
          JSON.parse(x)
        ),
      },
    };
  },
  views,
});
