import React, { type ReactNode, createContext, useContext } from 'react'

import type { Theme } from './types'
import { theme } from './themes/default'

export const ThemeContext = createContext<{
  theme: Theme
}>({
  theme,
})

export const ThemeProvider = ({ theme, children }: { theme: Theme, children: ReactNode }) => {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

// TODO: return type required by pnpm :(
export const useTheme = (): Theme => {
  const { theme } = useContext(ThemeContext)
  return theme
}
