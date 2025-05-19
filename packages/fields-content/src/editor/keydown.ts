import { Plugin, PluginKey } from 'prosemirror-state'
import { useEffect } from 'react'
import { useEventCallback } from './utils'
import { useEditorState } from './editor-view'

type Handlers = Set<{ fn: (event: KeyboardEvent) => boolean }>

const key = new PluginKey<Handlers>('keydown')

/**
 * Generally only one of these should be rendered at a time
 *
 * It's for autocomplete or etc. where you want to handle keydown in a react component
 * because the selection is in a particular place
 */
export function useEditorKeydownListener(handler: (event: KeyboardEvent) => boolean) {
  const state = useEditorState()
  const pluginState = key.getState(state)
  const stableHandler = useEventCallback(handler)
  useEffect(() => {
    if (!pluginState) return
    const obj = { fn: stableHandler }
    pluginState.add(obj)
    return () => {
      pluginState.delete(obj)
    }
  }, [pluginState, stableHandler])
}

export function keydownHandler() {
  return new Plugin<Handlers>({
    key,
    state: {
      init() {
        return new Set()
      },
      apply(tr, value) {
        return value
      },
    },
    props: {
      handleKeyDown(view, event) {
        const pluginState = key.getState(view.state)
        if (!pluginState) return false
        for (const handler of pluginState) {
          if (handler.fn(event)) return true
        }
        return false
      },
    },
  })
}
