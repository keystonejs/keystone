import { sanitizeUrl } from '@braintree/sanitize-url'
import type { ResolvedPos} from 'prosemirror-model';
import { Fragment, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import type { EditorSchema } from './schema'

function isValidURL(url: string) {
  return url === sanitizeUrl(url)
}

const urlPattern = /^https?:\/\//

function rangeHasLink($from: ResolvedPos, $to: ResolvedPos, schema: EditorSchema) {
  let hasLink = false
  $from.doc.nodesBetween($from.pos, $to.pos, node => {
    if (node.marks.some(x => x.type === schema.marks.link)) {
      hasLink = true
      return false
    }
  })
  return hasLink
}

export function pasteLinks(schema: EditorSchema) {
  if (!schema.marks.link) return new Plugin({})
  const linkType = schema.marks.link
  return new Plugin({
    props: {
      transformPasted(slice) {
        if (
          slice.content.childCount === 1 &&
          slice.content.firstChild?.type === schema.nodes.paragraph &&
          slice.content.firstChild.firstChild?.text !== undefined &&
          urlPattern.test(slice.content.firstChild.firstChild.text) &&
          isValidURL(slice.content.firstChild.firstChild.text) &&
          slice.content.firstChild.firstChild.marks.length === 0
        ) {
          return Slice.maxOpen(
            Fragment.from(
              schema.nodes.paragraph.createChecked(
                null,
                schema.schema.text(slice.content.firstChild.firstChild.text, [
                  linkType.create({
                    href: slice.content.firstChild.firstChild.text,
                    title: '',
                  }),
                ])
              )
            )
          )
        }
        return slice
      },
      handlePaste(view, event) {
        const plain = event.clipboardData?.getData('text/plain')
        if (
          plain && // isValidURL is a bit more permissive than a user might expect
          // so for pasting, we'll constrain it to starting with https:// or http://
          urlPattern.test(plain) &&
          isValidURL(plain) &&
          !view.state.selection.empty &&
          view.state.selection.$from.parent === view.state.selection.$to.parent &&
          !rangeHasLink(view.state.selection.$from, view.state.selection.$to, schema)
        ) {
          const { tr } = view.state
          tr.addMark(
            view.state.selection.from,
            view.state.selection.to,
            linkType.create({ href: plain, title: '' })
          )
          view.dispatch(tr)
          return true
        }
        return false
      },
    },
  })
}
