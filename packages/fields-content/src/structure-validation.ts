import type { ZodType } from 'zod'
import { z } from 'zod'
import type { EditorSchema } from './editor/schema'

// Generate a Zod schema for marks based on EditorSchema
function getMarkSchemas(schema: EditorSchema) {
  return Object.values(schema.schema.marks).map(mark => {
    return z
      .object({
        type: z.literal(mark.name),
        attrs: z
          .object(
            Object.fromEntries(
              Object.entries(mark.attrs ?? {}).map(([key, _]) => [
                key,
                z.union([z.string(), z.number()]),
              ])
            )
          )
          .strict()
          .optional(),
      })
      .strict()
  })
}

// Generate a Zod schema for nodes based on EditorSchema
function getNodeSchemas(schema: EditorSchema, markSchemas: ZodType<any>[]) {
  const nodeSchemas: Record<string, ZodType<any>> = {}

  for (const node of Object.values(schema.schema.nodes)) {
    let base = z.object({ type: z.literal(node.name) }).strict()
    if (node.attrs) {
      base = base.extend({
        attrs: z
          .object(
            Object.fromEntries(
              Object.entries(node.attrs).map(([key, _]) => [key, z.union([z.string(), z.number()])])
            )
          )
          .strict(),
      })
    }
    if (node.name === 'text') {
      base = base.extend({
        text: z.string(),
        marks: z.array(z.union(markSchemas)).optional(),
      })
    }
    nodeSchemas[node.name] = base
  }
  return nodeSchemas
}

// Main function to generate the Zod schema for the document structure
export function getZodSchema(editorSchema: EditorSchema): ZodType<any> {
  const markSchemas = getMarkSchemas(editorSchema)
  const nodeSchemas = getNodeSchemas(editorSchema, markSchemas)

  // Recursively build children for nodes that allow them
  const nodeTypesWithChildren = Object.entries(editorSchema.schema.nodes)
    .filter(([_, node]) => node.content && node.content.includes('block'))
    .map(([name]) => name)

  const lazyNodeSchemas: Record<string, ZodType<any>> = {}

  for (const [name, schema] of Object.entries(nodeSchemas)) {
    if (nodeTypesWithChildren.includes(name)) {
      lazyNodeSchemas[name] = schema.extend({
        children: z.lazy(() => z.array(z.union(Object.values(lazyNodeSchemas)))),
      })
    } else {
      lazyNodeSchemas[name] = schema
    }
  }

  // The document is an array of top-level blocks
  return z.array(z.union(Object.values(lazyNodeSchemas)))
}
