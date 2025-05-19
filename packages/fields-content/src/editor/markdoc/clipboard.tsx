import type { ResolvedPos } from 'prosemirror-model'
import { DOMParser, DOMSerializer, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import { proseMirrorToMarkdoc } from './serialize'
import { format, parse } from '#markdoc'
import { markdocToProseMirror } from './parse'
import { getEditorSchema } from '../schema'

export function markdocClipboard() {
  return new Plugin({
    props: {
      // TODO: for a doc like this:
      // <doc>
      //   <blockquote><paragraph>h<anchor/>ell</head>o</paragraph></blockquote>
      // </doc>
      // you shouldn't get the block quote
      clipboardTextSerializer(content, view) {
        try {
          return format(
            proseMirrorToMarkdoc(view.state.doc.type.create({}, content.content), {
              schema: getEditorSchema(view.state.schema),
            })
          )
        } catch (err) {
          console.log('failed to serialize clipboard text as markdoc', err)
          return content.content.textBetween(0, content.content.size, '\n\n')
        }
      },
      clipboardTextParser(text, $context, plain, view) {
        try {
          return Slice.maxOpen(
            markdocToProseMirror(
              parse(text),
              getEditorSchema(view.state.schema),
              undefined,
              undefined,
              undefined
            ).content
          )
        } catch (err) {
          console.log('failed to parse clipboard text as markdoc', err)
          return defaultClipboardTextParser(text, $context, plain, view)
        }
      },
      handlePaste(view, event) {
        if (view.props.editable && !view.props.editable(view.state)) {
          return false
        }
        if (!event.clipboardData) {
          return false
        }
        const html = event.clipboardData.getData('text/html')
        if (html && isProbablyHtmlFromVscode(html)) {
          const plain = event.clipboardData.getData('text/plain')
          view.pasteText(plain)
          return true
        }
        return false
      },
    },
  })
}

// vscode adds extra data to the DataTransfer but those only exist when pasted into a chromium browser
// this works across browser
function isProbablyHtmlFromVscode(html: string) {
  const parser = new globalThis.DOMParser()
  const parsed = parser.parseFromString(html, 'text/html')
  const firstDiv = parsed.body.firstElementChild
  if (
    parsed.body.childElementCount !== 1 ||
    firstDiv?.tagName !== 'DIV' ||
    !(firstDiv instanceof HTMLElement) ||
    !firstDiv.style.fontFamily.includes('monospace')
  ) {
    return false
  }
  for (const line of firstDiv.children) {
    if (line.tagName === 'BR') continue
    if (line.tagName !== 'DIV') return false
    for (const span of line.children) {
      if (span.tagName !== 'SPAN') return false
    }
  }
  return true
}

function defaultClipboardTextParser(
  text: string,
  $context: ResolvedPos,
  plain: boolean,
  view: EditorView
) {
  let marks = $context.marks()
  let { schema } = view.state,
    serializer = DOMSerializer.fromSchema(schema)
  let dom = document.createElement('div')
  text.split(/(?:\r\n?|\n)+/).forEach(block => {
    let p = dom!.appendChild(document.createElement('p'))
    if (block) {
      p.appendChild(serializer.serializeNode(schema.text(block, marks)))
    }
  })
  let parser =
    view.someProp('clipboardParser') ||
    view.someProp('domParser') ||
    DOMParser.fromSchema(view.state.schema)
  return parser.parseSlice(dom!, {
    preserveWhitespace: true,
    context: $context,
    // @ts-expect-error
    ruleFromNode(dom: HTMLElement) {
      if (
        dom.nodeName == 'BR' &&
        !dom.nextSibling &&
        dom.parentNode &&
        !inlineParents.test(dom.parentNode.nodeName)
      ) {
        return { ignore: true }
      }
      return null
    },
  })
}

const inlineParents =
  /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i
