import type { Command, EditorState } from 'prosemirror-state'
import type { EditorSchema } from './schema'
import { getEditorSchema } from './schema'
import type { HTMLAttributes, ReactNode, Ref, RefObject } from 'react'
import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { useEventCallback } from './utils'
import { EditorView } from 'prosemirror-view'

const EditorStateContext = React.createContext<EditorState | null>(null)

export function useEditorState() {
  const state = useContext(EditorStateContext)
  if (state === null) {
    throw new Error('useEditorState must be used inside ProseMirrorEditorView')
  }
  return state
}

export function useEditorDispatchCommand() {
  return useStableEditorContext().dispatchCommand
}

export function useEditorSchema() {
  return useStableEditorContext().schema
}

export function useEditorViewRef() {
  return useStableEditorContext().view
}

export function useEditorViewInEffect() {
  const editorViewRef = useEditorViewRef()
  const state = useEditorState()
  return useCallback(() => {
    if (editorViewRef.current && editorViewRef.current.state !== state) {
      editorViewRef.current?.updateState(state)
    }
    return editorViewRef.current
  }, [editorViewRef, state])
}

export function useLayoutEffectWithEditorUpdated(effect: () => void) {
  const editorView = useEditorViewRef()
  const state = useEditorState()

  const update = useEventCallback(() => {
    if (editorView.current && editorView.current.state !== state) {
      editorView.current?.updateState(state)
    }
  })

  useLayoutEffect(() => {
    update()
    return effect()
  }, [update, effect])
}

export function useEditorView(
  state: EditorState,
  _onEditorStateChange: (state: EditorState) => void
) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onEditorStateChange = useEventCallback(_onEditorStateChange)
  useLayoutEffect(() => {
    if (mountRef.current === null) {
      return
    }
    const view = new EditorView(
      { mount: mountRef.current },
      {
        state: state,
        dispatchTransaction(tr) {
          const newEditorState = view.state.apply(tr)
          view.updateState(newEditorState)
          onEditorStateChange(newEditorState)
        },
      }
    )
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountRef, onEditorStateChange])
  useLayoutEffect(() => {
    viewRef.current?.updateState(state)
  }, [state])
  return {
    view: viewRef,
    mount: mountRef,
  }
}

/**
 * This cannot be moved after mount
 *
 * This could be fixed by storing the editable ref in state but that would be more initial re-renders
 * and moving the editable isn't a thing that we actually would want to do.
 */
export function ProseMirrorEditable(props: HTMLAttributes<HTMLElement>) {
  const { mount } = useStableEditorContext()
  return <div {...props} ref={mount} />
}

type StableContext = {
  view: RefObject<EditorView | null>
  mount: RefObject<HTMLDivElement | null>
  dispatchCommand: (command: Command) => void
  schema: EditorSchema
}

const StableEditorContext = React.createContext<StableContext | null>(null)

function useStableEditorContext() {
  const context = useContext(StableEditorContext)
  if (context === null) {
    throw new Error('editor hooks must be used inside a ProseMirrorEditorView')
  }
  return context
}

export const ProseMirrorEditor = forwardRef(function ProseMirrorEditorView(
  props: {
    value: EditorState
    onChange: (state: EditorState) => void
    children: ReactNode
  },
  ref: Ref<{ view: EditorView | null }>
) {
  const { view, mount } = useEditorView(props.value, props.onChange)

  useImperativeHandle(
    ref,
    () => ({
      get view() {
        return view.current
      },
    }),
    [view]
  )

  const stableContext = useMemo((): StableContext => {
    return {
      view,
      mount,
      dispatchCommand: command => {
        if (!view.current) return
        command(view.current.state, view.current.dispatch, view.current)
        view.current.focus()
      },
      schema: getEditorSchema(props.value.schema),
    }
  }, [mount, props.value.schema, view])

  return (
    <StableEditorContext.Provider value={stableContext}>
      <EditorStateContext.Provider value={props.value}>
        {props.children}
      </EditorStateContext.Provider>
    </StableEditorContext.Provider>
  )
})
