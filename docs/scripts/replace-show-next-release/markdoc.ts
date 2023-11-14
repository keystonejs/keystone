import Markdoc from '@markdoc/markdoc'
import { baseMarkdocConfig } from '../../markdoc/config'

const pattern =
  /{%\s+if\s+\$nextRelease\s+%}\s*([^]+?)\s*(?:{%\s+else\s+\/%}[^]*?)?{%\s+\/if\s+%}/g

export function removeNextReleaseConditions (contents: string) {
  // ideally this would be a transform
  // but Markdoc's formatter is experimental and as of the time of writing this
  // doesn't seem to break some of our content
  const newContent = contents.replace(pattern, '$1')

  // this will report usages of variables in case the transform here is broken
  const parsed = Markdoc.parse(newContent)
  const errors = Markdoc.validate(parsed, baseMarkdocConfig)

  return { contents: newContent, errors }
}
