import React, { type ReactNode, useCallback, useEffect, useState } from 'react'

export type ModalState = {
  drawerStack: string[]
  pushToDrawerStack: (drawerKey: string) => void
  popFromDrawerStack: () => void
}

const ModalContext = React.createContext<ModalState | null>(null)

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [drawerStack, setDrawerStack] = useState<string[]>([])

  const pushToDrawerStack = useCallback((key: string) => {
    setDrawerStack(stack => [...stack, key])
  }, [])
  const popFromDrawerStack = useCallback(() => {
    setDrawerStack(stack => {
      const less = stack.slice(0, -1)
      return less
    })
  }, [])

  const context = {
    drawerStack,
    pushToDrawerStack,
    popFromDrawerStack,
  }

  return <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
}

// Utils
// ------------------------------
export const useDrawerManager = (uniqueKey: string) => {
  const modalState = React.useContext(ModalContext)

  if (modalState === null) {
    throw new Error(
      'This component must have a <DrawerProvider/> ancestor in the same React tree.'
    )
  }

  // keep the stack in sync on mount/unmount
  useEffect(() => {
    modalState.pushToDrawerStack(uniqueKey)
    return () => {
      modalState.popFromDrawerStack()
    }
  }, [])
  // the last key in the array is the "top" modal visually, so the depth is the inverse index
  // be careful not to mutate the stack
  const depth = modalState.drawerStack.slice().reverse().indexOf(uniqueKey)
  // if it's not in the stack already,
  // we know that it should be the last drawer in the stack but the effect hasn't happened yet
  // so we need to make the depth 0 so the depth is correct even though the effect hasn't happened yet
  return depth === -1 ? 0 : depth
}
