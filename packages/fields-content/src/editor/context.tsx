import { createContext, useContext } from 'react'

type ContextType = { id: string }
const EditorContext = createContext<ContextType>({ id: '' })

export const EditorContextProvider = EditorContext.Provider
export function useEditorContext() {
  return useContext(EditorContext)
}

export function getRootId(id: string) {
  return `keystatic-editor-root-${id}`
}
export function getToolbarId(id: string) {
  return `keystatic-editor-toolbar-${id}`
}
export function getContentId(id: string) {
  return `keystatic-editor-content-${id}`
}
export function getRoot(id: string) {
  return document.getElementById(getRootId(id))
}
export function getToolbar(id: string) {
  return document.getElementById(getToolbarId(id))
}
export function getContent(id: string) {
  return document.getElementById(getContentId(id))
}
