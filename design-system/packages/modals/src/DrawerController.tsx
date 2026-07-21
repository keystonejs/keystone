import React, { type ReactNode, useContext, useRef } from 'react'
import { Transition } from 'react-transition-group'

import { type TransitionState } from './types'

type DrawerControllerProps = {
  isOpen: boolean
  children: ReactNode
}

const DrawerControllerContext = React.createContext<null | {
  nodeRef: React.RefObject<HTMLDivElement | HTMLFormElement | null>
  transitionState: TransitionState
}>(null)

export const DrawerControllerContextProvider = DrawerControllerContext.Provider

export const useDrawerControllerContext = () => {
  const context = useContext(DrawerControllerContext)
  if (!context) {
    throw new Error(
      'Drawers must be wrapped in a <DrawerController>. You should generally do this outside of the component that renders the <Drawer> or <TabbedDrawer>.'
    )
  }

  return context
}

export const DrawerController = ({ isOpen, children }: DrawerControllerProps) => {
  const nodeRef = useRef<HTMLDivElement | HTMLFormElement | null>(null)

  return (
    <Transition appear mountOnEnter unmountOnExit in={isOpen} nodeRef={nodeRef} timeout={150}>
      {transitionState => (
        <DrawerControllerContextProvider value={{ nodeRef, transitionState }}>
          {children}
        </DrawerControllerContextProvider>
      )}
    </Transition>
  )
}
