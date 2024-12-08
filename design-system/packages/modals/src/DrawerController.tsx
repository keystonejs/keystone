import React, { type ReactNode, useContext } from 'react'
import { Transition } from 'react-transition-group'

import { type TransitionState } from './types'

type DrawerControllerProps = {
  isOpen: boolean
  children: ReactNode
}

const DrawerControllerContext = React.createContext<null | TransitionState>(null)

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
  return (
    <Transition appear mountOnEnter unmountOnExit in={isOpen} timeout={150}>
      {transitionState => (
        <DrawerControllerContextProvider value={transitionState}>
          {children}
        </DrawerControllerContextProvider>
      )}
    </Transition>
  )
}
