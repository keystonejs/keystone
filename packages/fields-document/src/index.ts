import { g } from '@keystone-6/core'
import {
  type BaseFieldTypeInfo,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldData,
  type FieldTypeFunc,
  type JSONValue,
  fieldType,
} from '@keystone-6/core/types'
import { GraphQLError } from 'graphql'
import type { ComponentBlock } from './DocumentEditor/component-blocks/api-shared'
import { assertValidComponentSchema } from './DocumentEditor/component-blocks/field-assertions'
import type { Relationships } from './DocumentEditor/relationship-shared'
import { addRelationshipData } from './relationship-data'
import { validateAndNormalizeDocument } from './validation'
import type { DocumentFeatures, controller } from './views-shared'

type RelationshipsConfig = Record<
  string,
  {
    listKey: string
    label: string
    labelField?: string
    /** GraphQL fields to select when querying the field */
    selection?: string
  }
>

type FormattingConfig = {
  inlineMarks?:
    | boolean
    | {
        bold?: boolean
        italic?: boolean
        underline?: boolean
        strikethrough?: boolean
        code?: boolean
        superscript?: boolean
        subscript?: boolean
        keyboard?: boolean
      }
  listTypes?:
    | boolean
    | {
        ordered?: boolean
        unordered?: boolean
      }
  alignment?:
    | boolean
    | {
        center?: boolean
        end?: boolean
      }
  headingLevels?: boolean | readonly (1 | 2 | 3 | 4 | 5 | 6)[]
  blockTypes?:
    | boolean
    | {
        blockquote?: boolean
        code?: boolean
      }
  softBreaks?: boolean
}

export type DocumentFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo
> & {
  relationships?: RelationshipsConfig
  componentBlocks?: Record<string, ComponentBlock>
  formatting?: boolean | FormattingConfig
  links?: boolean
  dividers?: boolean
  layouts?: readonly (readonly [number, ...number[]])[]
  db?: { map?: string; extendPrismaSchema?: (field: string) => string }
}

export function document<ListTypeInfo extends BaseListTypeInfo>({
  componentBlocks = {},
  dividers,
  formatting,
  layouts,
  relationships: configRelationships,
  links,
  ...config
}: DocumentFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const documentFeatures = normaliseDocumentFeatures({
      dividers,
      formatting,
      layouts,
      links,
    })
    const relationships = normaliseRelationships(configRelationships, meta)
    const inputResolver = (data: JSONValue | null | undefined): any => {
      if (data === null)
        throw new GraphQLError('Input error: Document fields cannot be set to null')
      if (data === undefined) return data

      return validateAndNormalizeDocument(data, documentFeatures, componentBlocks, relationships)
    }

    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type document")
    }

    const lists = new Set(Object.keys(meta.lists))
    for (const [name, block] of Object.entries(componentBlocks)) {
      try {
        assertValidComponentSchema({ kind: 'object', fields: block.schema }, lists, 'document')
      } catch (err) {
        throw new Error(
          `Component block ${name} in ${meta.listKey}.${meta.fieldKey}: ${(err as any).message}`
        )
      }
    }

    const defaultValue = [{ type: 'paragraph', children: [{ text: '' }] }]
    return fieldType({
      kind: 'scalar',
      scalar: 'Json',
      mode: 'required',
      default:
        meta.provider === 'sqlite'
          ? undefined
          : {
              kind: 'literal',
              // TODO: waiting on https://github.com/prisma/prisma/issues/26571
              //   input.create manages defaultValues anyway
              value: JSON.stringify(defaultValue ?? null),
            },
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/document',
      input: {
        create: {
          arg: g.arg({ type: g.JSON }),
          resolve(val) {
            if (val === undefined) {
              val = defaultValue
            }
            return inputResolver(val)
          },
        },
        update: { arg: g.arg({ type: g.JSON }), resolve: inputResolver },
      },
      output: g.field({
        type: g.object<{ document: JSONValue }>()({
          name: `${meta.listKey}_${meta.fieldKey}_Document`,
          fields: {
            document: g.field({
              args: {
                hydrateRelationships: g.arg({
                  type: g.nonNull(g.Boolean),
                  defaultValue: false,
                }),
              },
              type: g.nonNull(g.JSON),
              resolve({ document }, { hydrateRelationships }, context) {
                return hydrateRelationships
                  ? addRelationshipData(document as any, context, relationships, componentBlocks)
                  : (document as any)
              },
            }),
          },
        }),
        resolve({ value }) {
          if (value === null) return null
          return { document: value }
        },
      }),
      views: '@keystone-6/fields-document/views',
      getAdminMeta(): Parameters<typeof controller>[0]['fieldMeta'] {
        return {
          relationships,
          documentFeatures,
          componentBlocksPassedOnServer: Object.keys(componentBlocks),
        }
      },
    })
  }
}

function normaliseRelationships(
  configRelationships: DocumentFieldConfig<BaseListTypeInfo>['relationships'],
  meta: FieldData
) {
  if (!configRelationships) return {}
  const relationships: Relationships = {}
  for (const [key, relationship] of Object.entries(configRelationships)) {
    if (meta.lists[relationship.listKey] === undefined) {
      throw new Error(
        `An inline relationship ${relationship.label} (${key}) in the field at ${meta.listKey}.${meta.fieldKey} has listKey set to "${relationship.listKey}" but no list named "${relationship.listKey}" exists.`
      )
    }
    relationships[key] = {
      ...relationship,
      labelField: relationship.labelField ?? null,
      selection: relationship.selection ?? null,
    }
  }
  return relationships
}

function normaliseDocumentFeatures(
  config: Pick<
    DocumentFieldConfig<BaseListTypeInfo>,
    'formatting' | 'dividers' | 'layouts' | 'links'
  >
) {
  const {
    alignment,
    blockTypes,
    headingLevels,
    inlineMarks,
    listTypes,
    softBreaks,
  }: FormattingConfig =
    typeof config.formatting === 'boolean'
      ? {
          alignment: config.formatting,
          blockTypes: config.formatting,
          headingLevels: config.formatting,
          inlineMarks: config.formatting,
          listTypes: config.formatting,
          softBreaks: config.formatting,
        }
      : (config.formatting ?? {})

  const documentFeatures: DocumentFeatures = {
    formatting: {
      alignment: {
        center: typeof alignment === 'boolean' ? alignment : !!alignment?.center,
        end: typeof alignment === 'boolean' ? alignment : !!alignment?.end,
      },
      blockTypes: {
        blockquote: typeof blockTypes === 'boolean' ? blockTypes : !!blockTypes?.blockquote,
        code: typeof blockTypes === 'boolean' ? blockTypes : !!blockTypes?.code,
      },
      headingLevels:
        typeof headingLevels === 'boolean'
          ? ([1, 2, 3, 4, 5, 6] as const).filter(_ => headingLevels)
          : [...new Set(headingLevels)].sort(),
      inlineMarks: {
        bold: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.bold,
        code: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.code,
        italic: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.italic,
        strikethrough:
          typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.strikethrough,
        underline: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.underline,
        keyboard: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.keyboard,
        subscript: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.subscript,
        superscript: typeof inlineMarks === 'boolean' ? inlineMarks : !!inlineMarks?.superscript,
      },
      listTypes: {
        ordered: typeof listTypes === 'boolean' ? listTypes : !!listTypes?.ordered,
        unordered: typeof listTypes === 'boolean' ? listTypes : !!listTypes?.unordered,
      },
      softBreaks: typeof softBreaks === 'boolean' ? softBreaks : !!softBreaks,
    },
    links: !!config.links,
    layouts: [...new Set((config.layouts || []).map(x => JSON.stringify(x)))].map(x =>
      JSON.parse(x)
    ),
    dividers: !!config.dividers,
  }
  return documentFeatures
}

export type { Node } from './structure-validation'
export { structure } from './structure'
