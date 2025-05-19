import { css, injectGlobal, tokenSchema } from '@keystar/ui/style'
import { useRef, useCallback, useEffect } from 'react'

export const classes = {
  blockParent: 'ProseMirror-blockParent',
  focused: 'ProseMirror-focused',
  hideselection: 'ProseMirror-hideselection',
  nodeInSelection: 'ProseMirror-nodeInSelection',
  nodeSelection: 'ProseMirror-selectednode',
  placeholder: 'ProseMirror-placeholder',
}

export function weakMemoize<Arg extends object, Return>(
  func: (arg: Arg) => Return
): (arg: Arg) => Return {
  const cache = new WeakMap<Arg, Return>()
  return (arg: Arg) => {
    if (cache.has(arg)) {
      return cache.get(arg)!
    }
    const result = func(arg)
    cache.set(arg, result)
    return result
  }
}

let maskColor = tokenSchema.color.background.canvas
let borderColor = tokenSchema.color.alias.borderSelected
let borderSize = tokenSchema.size.border.medium
let circleSize = tokenSchema.size.space.regular
injectGlobal({
  '.prosemirror-dropcursor-block': {
    '&::before, &::after': {
      backgroundColor: maskColor,
      border: `${borderSize} solid ${borderColor}`,
      borderRadius: '50%',
      content: '" "',
      height: circleSize,
      position: 'absolute',
      width: circleSize,
      top: `calc(${circleSize} / -2 - ${borderSize} / 2)`,
    },

    '&::before': { left: `calc(${circleSize} * -1)` },
    '&::after': { right: `calc(${circleSize} * -1)` },
  },
})

// void elements cannot have pseudo-elements so we need to style them differently
const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

export const prosemirrorStyles = css`
  /* Provide our own selection indicator */
  .${classes.nodeSelection} {
    position: relative;
  }
  .${classes.nodeSelection}::after {
    background-color: ${tokenSchema.color.alias.backgroundSelected};
    border-radius: ${tokenSchema.size.radius.small};
    content: '';
    inset: calc(${tokenSchema.size.alias.focusRingGap} * -1);
    pointer-events: none;
    position: absolute;
  }
  .${classes.nodeSelection}:is(${voidElements.join(', ')}) {
    outline: ${tokenSchema.size.alias.focusRing} solid ${tokenSchema.color.border.accent};
    outline-offset: ${tokenSchema.size.alias.focusRingGap};
  }
  .${classes.hideselection} *::selection {
    background: transparent;
  }
  .${classes.hideselection} *::-moz-selection {
    background: transparent;
  }
  .${classes.hideselection} {
    caret-color: transparent;
  }

  /* Style the placeholder element */
  .${classes.placeholder} {
    color: ${tokenSchema.color.foreground.neutralTertiary};
    pointer-events: none;
  }

  /* Protect against generic img rules */
  img.ProseMirror-separator {
    display: inline !important;
    border: none !important;
    margin: 0 !important;
  }

  /* Provide an indicator for focusing places that don't allow regular selection */
  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;
  }
  .ProseMirror-gapcursor:after {
    content: '';
    display: block;
    position: absolute;
    top: -2px;
    width: 20px;
    border-top: 1px solid black;
    animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden;
    }
  }

  .ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }
  .ProseMirror > .ProseMirror-yjs-cursor:first-child {
    margin-top: 16px;
  }
  /* This gives the remote user caret. The colors are automatically overwritten*/
  .ProseMirror-yjs-cursor {
    position: relative;
    margin-left: -1px;
    margin-right: -1px;
    border-left: 1px solid black;
    border-right: 1px solid black;
    border-color: orange;
    word-break: normal;
    pointer-events: none;
  }
  /* This renders the username above the caret */
  .ProseMirror-yjs-cursor > div {
    position: absolute;
    top: -1.05em;
    left: -1px;
    font-size: 13px;
    background-color: rgb(250, 129, 0);
    font-family: ${tokenSchema.typography.fontFamily.base};
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    user-select: none;
    color: white;
    padding-left: 2px;
    padding-right: 2px;
    white-space: nowrap;
  }
`

export function useEventCallback<Func extends (...args: any) => any>(callback: Func): Func {
  const callbackRef = useRef(callback)
  const cb = useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, [])
  useEffect(() => {
    callbackRef.current = callback
  })
  return cb as any
}
