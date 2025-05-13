import { z } from 'zod'
import { type RelationshipData } from './DocumentEditor/component-blocks/api-shared'
import { isValidURL } from './DocumentEditor/isValidURL'

// leaf types
const zMarkValue = z.union([z.literal(true), z.undefined()])

const zText = z
  .object({
    type: z.never().optional(),
    text: z.string(),
    bold: zMarkValue,
    italic: zMarkValue,
    underline: zMarkValue,
    strikethrough: zMarkValue,
    code: zMarkValue,
    superscript: zMarkValue,
    subscript: zMarkValue,
    keyboard: zMarkValue,
    insertMenu: zMarkValue,
  })
  .strict()

const zTextAlign = z.union([z.undefined(), z.literal('center'), z.literal('end')])

// recursive types
const zLink = z
  .object({
    type: z.literal('link'),
    href: z.string().refinement(isValidURL as (url: string) => url is any, val => ({
      code: 'custom',
      message: `Invalid URL: ${val}`,
    })),
  })
  .strict()

const zHeading = z
  .object({
    type: z.literal('heading'),
    textAlign: zTextAlign,
    level: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
  })
  .strict()

const zParagraph = z
  .object({
    type: z.literal('paragraph'),
    textAlign: zTextAlign,
  })
  .strict()

const zBasicElement = <T extends string>(type: T) =>
  z
    .object({
      type: z.literal(type),
    })
    .strict()

const zBasicElements = [
  zBasicElement('blockquote'),
  zBasicElement('layout-area'),
  zBasicElement('code'),
  zBasicElement('divider'),
  zBasicElement('list-item'),
  zBasicElement('list-item-content'),
  zBasicElement('ordered-list'),
  zBasicElement('unordered-list'),
] as const

const zLayout = z
  .object({
    type: z.literal('layout'),
    layout: z.array(z.number()),
  })
  .strict()

const zRelationshipData = z
  .object({
    id: z.string(),
    label: z.string().optional(),
    data: z.record(z.string(), z.any()).optional(),
  })
  .strict()

const zRelationship = z
  .object({
    type: z.literal('relationship'),
    relationship: z.string(),
    data: z.union([zRelationshipData, z.null()]),
  })
  .strict()

const zComponentBlock = z
  .object({
    type: z.literal('component-block'),
    component: z.string(),
    props: z.record(z.string(), z.any()),
  })
  .strict()

const zComponentProp = <T extends string>(type: T) =>
  z
    .object({
      type: z.literal(type),
      propPath: z.array(z.union([z.string(), z.number()])).optional(),
    })
    .strict()

const zComponentProps = [
  zComponentProp('component-block-prop'),
  zComponentProp('component-inline-prop'),
] as const

type Children =
  // inline
  | z.infer<typeof zText>
  | (z.infer<typeof zLink> & { children: Children[] })
  | (z.infer<typeof zRelationship> & { children: Children[] })
  // block
  | (z.infer<typeof zComponentBlock> & { children: Children[] })
  | (z.infer<(typeof zComponentProps)[keyof typeof zComponentProps & number]> & {
      children: Children[]
    })
  | (z.infer<(typeof zBasicElements)[keyof typeof zBasicElements & number]> & {
      children: Children[]
    })
  | (z.infer<typeof zHeading> & { children: Children[] })
  | (z.infer<typeof zLayout> & { children: Children[] })
  | (z.infer<typeof zParagraph> & { children: Children[] })

const zBlock: z.ZodType<Children> = z.discriminatedUnion('type', [
  zComponentBlock.extend({ children: z.lazy(() => zChildren) }),
  ...zComponentProps.map(prop => prop.extend({ children: z.lazy(() => zChildren) })),
  ...zBasicElements.map(prop => prop.extend({ children: z.lazy(() => zChildren) })),
  zHeading.extend({ children: z.lazy(() => zChildren) }),
  zLayout.extend({ children: z.lazy(() => zChildren) }),
  zParagraph.extend({ children: z.lazy(() => zChildren) }),
])

const zInline: z.ZodType<Children> = z.discriminatedUnion('type', [
  zText,
  zLink.extend({ children: z.lazy(() => zChildren) }),
  zRelationship.extend({ children: z.lazy(() => zChildren) }),
])

const zChildren: z.ZodType<Children[]> = z.array(z.union([zBlock, zInline]))

const zEditorCodec = z.array(zBlock)

// exports
export type TextWithMarks = z.infer<typeof zText>
export type ElementFromValidation = Children

export function isRelationshipData(val: unknown): val is RelationshipData {
  return zRelationshipData.safeParse(val).success
}

export function validateDocumentStructure(val: unknown): asserts val is ElementFromValidation[] {
  const result = zEditorCodec.safeParse(val)
  if (!result.success) {
    throw new Error(`Invalid document structure: ${result.error.message}`)
  }
}
