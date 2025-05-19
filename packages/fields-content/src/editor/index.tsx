import type { EditorView } from 'prosemirror-view'
import type { EditorState } from 'prosemirror-state'
import type { Ref } from 'react'
import { forwardRef, useId, useMemo } from 'react'
import { Box } from '@keystar/ui/layout'
import { useProseStyleProps } from '@keystar/ui/typography'
import { css, tokenSchema } from '@keystar/ui/style'

import { Toolbar } from './Toolbar.tsx'
import { prosemirrorStyles } from './utils.ts'
import { EditorPopoverDecoration } from './popovers/index.tsx'
import { ProseMirrorEditable, ProseMirrorEditor } from './editor-view.tsx'
import { AutocompleteDecoration } from './autocomplete/decoration.tsx'
import { NodeViews } from './react-node-views.tsx'
import { CellMenuPortal } from './popovers/table.tsx'
import { EditorContextProvider, getContentId, getRootId, getToolbarId } from './context.tsx'

const contentStyles = css({
  flex: 1,
  height: 'auto',
  minHeight: tokenSchema.size.scale[2000],
  minWidth: 0,
  outline: 0,
  padding: tokenSchema.size.space.medium,
})

export const Editor = forwardRef(function Editor(
  {
    value,
    onChange,
    ...props
  }: {
    value: EditorState
    onChange: (state: EditorState) => void
  },
  ref: Ref<{ view: EditorView | null }>
) {
  const styleProps = useProseStyleProps({
    size: 'regular',
    UNSAFE_className: contentStyles,
  })

  const id = useId()
  const editorContext = useMemo(() => ({ id }), [id])
  return (
    <EditorContextProvider value={editorContext}>
      <ProseMirrorEditor value={value} onChange={onChange} ref={ref}>
        <Box
          id={getRootId(id)}
          backgroundColor="canvas"
          minWidth={0}
          UNSAFE_className={css(prosemirrorStyles, {
            border: `${tokenSchema.size.border.regular} solid ${tokenSchema.color.border.neutral}`,
            borderRadius: tokenSchema.size.radius.medium,
          })}
        >
          <Toolbar id={getToolbarId(id)} />
          <div>
            <ProseMirrorEditable
              {...props}
              {...styleProps}
              role="textbox"
              aria-multiline="true"
              id={getContentId(id)}
            />
          </div>
        </Box>
        <NodeViews state={value} />
        <CellMenuPortal />
        <EditorPopoverDecoration state={value} />
        <AutocompleteDecoration />
      </ProseMirrorEditor>
    </EditorContextProvider>
  )
})
