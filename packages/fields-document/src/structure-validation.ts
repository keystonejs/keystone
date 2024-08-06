import { z } from 'zod'
import { type RelationshipData } from './DocumentEditor/component-blocks/api-shared'
import { isValidURL } from './DocumentEditor/isValidURL'

// leaf types
const zMarkValue = z.union([
  z.literal(true),
  z.undefined(),
])

const zText = z.object({
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
}).strict()

const zTextAlign = z.union([
  z.undefined(),
  z.literal('center'),
  z.literal('end')
])

// recursive types
const zLink = z.object({
  type: z.literal('link'),
  href: z.string().refine(isValidURL),
}).strict()

const zHeading = z.object({
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
}).strict()

const zParagraph = z.object({
  type: z.literal('paragraph'),
  textAlign: zTextAlign,
}).strict()

const zElements = z.object({
  type: z.union([
    z.literal('blockquote'),
    z.literal('layout-area'),
    z.literal('code'),
    z.literal('divider'),
    z.literal('list-item'),
    z.literal('list-item-content'),
    z.literal('ordered-list'),
    z.literal('unordered-list'),
  ]),
}).strict()

const zLayout = z.object({
  type: z.literal('layout'),
  layout: z.array(z.number()),
}).strict()

const zRelationshipData = z.object({
  id: z.string(),
  label: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
}).strict()

const zRelationship = z.object({
  type: z.literal('relationship'),
  relationship: z.string(),
  data: z.union([zRelationshipData, z.null()]),
}).strict()

const zComponentBlock = z.object({
  type: z.literal('component-block'),
  component: z.string(),
  props: z.record(z.string(), z.any()),
}).strict()

const zComponentProp = z.object({
  type: z.union([
    z.literal('component-block-prop'),
    z.literal('component-inline-prop'),
  ]),
  propPath: z.array(z.union([z.string(), z.number()])).optional(),
}).strict()

type Children =
  // inline
  | (z.infer<typeof zText>)
  | (z.infer<typeof zLink> & { children: Children[] })
  | (z.infer<typeof zRelationship> & { children: Children[] })
  // block
  | (z.infer<typeof zComponentBlock> & { children: Children[] })
  | (z.infer<typeof zComponentProp> & { children: Children[] })
  | (z.infer<typeof zElements> & { children: Children[] })
  | (z.infer<typeof zHeading> & { children: Children[] })
  | (z.infer<typeof zLayout> & { children: Children[] })
  | (z.infer<typeof zParagraph> & { children: Children[] })

const zBlock: z.ZodType<Children> = z.union([
  zComponentBlock.extend({ children: z.lazy(() => zChildren) }),
  zComponentProp.extend({ children: z.lazy(() => zChildren) }),
  zElements.extend({ children: z.lazy(() => zChildren) }),
  zHeading.extend({ children: z.lazy(() => zChildren) }),
  zLayout.extend({ children: z.lazy(() => zChildren) }),
  zParagraph.extend({ children: z.lazy(() => zChildren) }),
])

const zInline: z.ZodType<Children> = z.union([
  zText,
  zLink.extend({ children: z.lazy(() => zChildren) }),
  zRelationship.extend({ children: z.lazy(() => zChildren) }),
])

const zChildren: z.ZodType<Children[]> = z.array(z.union([
  zBlock,
  zInline,
]))

const zEditorCodec = z.array(zBlock)

// exports
export type TextWithMarks = z.infer<typeof zText>
export type ElementFromValidation = Children

export function isRelationshipData (val: unknown): val is RelationshipData {
  return zRelationshipData.safeParse(val).success
}

export function validateDocumentStructure (val: unknown): asserts val is ElementFromValidation[] {
  const result = zEditorCodec.safeParse(val)
  if (!result.success) {
    throw new Error('Invalid document structure')
  }
}
