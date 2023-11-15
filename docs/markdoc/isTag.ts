import type { Tag } from '@markdoc/markdoc'

// this is Tag.isTag but we don't want to have to load all of markdoc client side
// so it's duplicated
export function isTag (tag: unknown): tag is Tag {
  return (
    typeof tag === 'object' && tag !== null && '$$mdtype' in tag && (tag as any).$$mdtype === 'Tag'
  )
}
