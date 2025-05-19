import { z } from 'zod'
import type { EditorConfig } from './config.ts'

const builtInNodeNames = new Set([
  'doc',
  'paragraph',
  'text',
  'blockquote',
  'divider',
  'code_block',
  'list_item',
  'unordered_list',
  'ordered_list',
  'hard_break',
  'heading',
  'table',
  'table_row',
  'table_cell',
  'table_header',
])

const builtInMarkNames = new Set(['link', 'italic', 'bold', 'strikethrough', 'code'])
const simpleMarkNames = new Set(['italic', 'bold', 'strikethrough', 'code'])
const inlineNodeNames = new Set(['text', 'hard_break'])
const blockNodeNames = new Set([
  'paragraph',
  'blockquote',
  'divider',
  'code_block',
  'unordered_list',
  'ordered_list',
  'heading',
  'table',
])

const zAttrs = z.record(z.string(), z.unknown())

const zMark = z
  .object({
    type: z.string(),
    attrs: zAttrs.optional(),
  })
  .strict()
  .superRefine((mark, context) => {
    if (simpleMarkNames.has(mark.type)) {
      if (mark.attrs !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['attrs'],
          message: `${mark.type} marks must not have attributes`,
        })
      }
      return
    }

    if (mark.type === 'link') {
      validateAttrs(
        mark.attrs,
        z
          .object({
            href: z.string(),
            title: z.string(),
          })
          .strict(),
        context
      )
      return
    }

    if (builtInMarkNames.has(mark.type)) {
      return
    }

    validateCustomAttrs(mark.attrs, context)
  })

type StoredNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: unknown[]
  marks?: z.infer<typeof zMark>[]
  text?: string
}

const zStoredNodeBase = z
  .object({
    type: z.string(),
    attrs: zAttrs.optional(),
    content: z.array(z.unknown()).optional(),
    marks: z.array(zMark).optional(),
    text: z.string().optional(),
  })
  .strict()

export const defaultContentValue = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function createContentStorageSchema(config: EditorConfig): z.ZodType<StoredNode> {
  const enabledMarks = new Set([
    ...(config.link ? ['link'] : []),
    ...(config.italic ? ['italic'] : []),
    ...(config.bold ? ['bold'] : []),
    ...(config.strikethrough ? ['strikethrough'] : []),
    ...(config.code ? ['code'] : []),
  ])

  const enabledNodes = new Set([
    'doc',
    'paragraph',
    'text',
    'hard_break',
    ...(config.blockquote ? ['blockquote'] : []),
    ...(config.divider ? ['divider'] : []),
    ...(config.codeBlock ? ['code_block'] : []),
    ...(config.orderedList ? ['ordered_list'] : []),
    ...(config.unorderedList ? ['unordered_list'] : []),
    ...(config.orderedList || config.unorderedList ? ['list_item'] : []),
    ...(config.heading.levels.length ? ['heading'] : []),
    ...(config.table ? ['table', 'table_row', 'table_cell', 'table_header'] : []),
  ])

  let zStoredNode: z.ZodType<StoredNode>
  zStoredNode = z.lazy(() =>
    zStoredNodeBase.superRefine((node, context) => {
      if (builtInNodeNames.has(node.type) && !enabledNodes.has(node.type)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['type'],
          message: `${node.type} nodes are disabled for this field`,
        })
        return
      }

      for (const [index, mark] of (node.marks ?? []).entries()) {
        if (builtInMarkNames.has(mark.type) && !enabledMarks.has(mark.type)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['marks', index, 'type'],
            message: `${mark.type} marks are disabled for this field`,
          })
        }
      }

      if (!builtInNodeNames.has(node.type)) {
        validateCustomNode(node, context)
        validateChildKinds(node.content, isBlockNode, 'block', context)
        validateChildren(node.content, zStoredNode, context)
        return
      }

      switch (node.type) {
        case 'doc':
          forbidKeys(node, ['attrs', 'marks', 'text'], context)
          requireNonEmptyContent(node, context)
          validateChildKinds(node.content, isBlockNode, 'block', context)
          break
        case 'paragraph':
        case 'heading':
          forbidKeys(node, ['marks', 'text'], context)
          if (node.type === 'paragraph') {
            forbidKeys(node, ['attrs'], context)
          } else {
            validateAttrs(
              node.attrs,
              z
                .object({
                  level: z
                    .number()
                    .int()
                    .refine(level => config.heading.levels.includes(level as 1)),
                })
                .strict(),
              context
            )
          }
          validateChildKinds(node.content, isInlineNode, 'inline', context)
          break
        case 'text':
          forbidKeys(node, ['attrs', 'content'], context)
          if (node.text === undefined || node.text.length === 0) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['text'],
              message: 'text nodes must contain text',
            })
          }
          break
        case 'hard_break':
        case 'divider':
          forbidKeys(node, ['attrs', 'content', 'marks', 'text'], context)
          break
        case 'blockquote':
        case 'list_item':
        case 'table_cell':
        case 'table_header':
          forbidKeys(node, ['marks', 'text'], context)
          if (node.type === 'table_cell' || node.type === 'table_header') {
            validateAttrs(
              node.attrs,
              z
                .object({
                  colspan: z.number().int().positive(),
                  rowspan: z.number().int().positive(),
                })
                .strict(),
              context
            )
          } else {
            forbidKeys(node, ['attrs'], context)
          }
          requireNonEmptyContent(node, context)
          validateChildKinds(node.content, isBlockNode, 'block', context)
          break
        case 'code_block':
          forbidKeys(node, ['marks', 'text'], context)
          validateAttrs(node.attrs, z.object({ language: z.string() }).strict(), context)
          validateChildKinds(node.content, child => child.type === 'text', 'text', context)
          break
        case 'unordered_list':
        case 'ordered_list':
          forbidKeys(node, ['marks', 'text'], context)
          if (node.type === 'ordered_list') {
            validateAttrs(
              node.attrs,
              z.object({ start: z.number().int().positive() }).strict(),
              context
            )
          } else {
            forbidKeys(node, ['attrs'], context)
          }
          requireNonEmptyContent(node, context)
          validateChildKinds(
            node.content,
            child => child.type === 'list_item',
            'list_item',
            context
          )
          break
        case 'table':
          forbidKeys(node, ['attrs', 'marks', 'text'], context)
          requireNonEmptyContent(node, context)
          validateChildKinds(
            node.content,
            child => child.type === 'table_row',
            'table_row',
            context
          )
          break
        case 'table_row':
          forbidKeys(node, ['attrs', 'marks', 'text'], context)
          validateChildKinds(
            node.content,
            child => child.type === 'table_cell' || child.type === 'table_header',
            'table_cell or table_header',
            context
          )
          break
      }

      validateChildren(node.content, zStoredNode, context)
    })
  ) as z.ZodType<StoredNode>

  return zStoredNode.refine(node => node.type === 'doc', {
    path: ['type'],
    message: 'the root node must be a doc',
  })
}

export function validateContentStructure(
  value: unknown,
  config: EditorConfig
): asserts value is StoredNode {
  const result = createContentStorageSchema(config).safeParse(value)
  if (!result.success) {
    throw new Error(`Invalid content structure: ${result.error.message}`)
  }
}

function validateChildren(
  content: unknown[] | undefined,
  schema: z.ZodType<StoredNode>,
  context: z.RefinementCtx
) {
  for (const [index, child] of (content ?? []).entries()) {
    const result = schema.safeParse(child)
    if (!result.success) {
      for (const issue of result.error.issues) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', index, ...issue.path],
          message: issue.message,
        })
      }
    }
  }
}

function validateChildKinds(
  content: unknown[] | undefined,
  predicate: (node: StoredNode) => boolean,
  expected: string,
  context: z.RefinementCtx
) {
  for (const [index, child] of (content ?? []).entries()) {
    if (
      typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      typeof child.type === 'string' &&
      !predicate(child as StoredNode)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content', index, 'type'],
        message: `expected a ${expected} node`,
      })
    }
  }
}

function isInlineNode(node: StoredNode) {
  return inlineNodeNames.has(node.type) || !builtInNodeNames.has(node.type)
}

function isBlockNode(node: StoredNode) {
  return blockNodeNames.has(node.type) || !builtInNodeNames.has(node.type)
}

function requireNonEmptyContent(node: StoredNode, context: z.RefinementCtx) {
  if (!node.content?.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: `${node.type} nodes must have content`,
    })
  }
}

function forbidKeys(
  node: StoredNode,
  keys: readonly (keyof StoredNode)[],
  context: z.RefinementCtx
) {
  for (const key of keys) {
    if (node[key] !== undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${node.type} nodes must not have ${key}`,
      })
    }
  }
}

function validateCustomNode(node: StoredNode, context: z.RefinementCtx) {
  forbidKeys(node, ['text'], context)
  validateCustomAttrs(node.attrs, context)
}

function validateCustomAttrs(attrs: Record<string, unknown> | undefined, context: z.RefinementCtx) {
  if (
    attrs === undefined ||
    !Object.hasOwn(attrs, 'props') ||
    Object.keys(attrs).some(key => key !== 'props')
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['attrs'],
      message: 'custom nodes and marks must have only a props attribute',
    })
  }
}

function validateAttrs(
  attrs: Record<string, unknown> | undefined,
  schema: z.ZodType,
  context: z.RefinementCtx
) {
  const result = schema.safeParse(attrs)
  if (!result.success) {
    for (const issue of result.error.issues) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['attrs', ...issue.path],
        message: issue.message,
      })
    }
  }
}
