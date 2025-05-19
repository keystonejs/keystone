import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { ReadonlyPropPath } from '../../api'

export function AddToPathProvider(props: {
  part: (string | number) | readonly (string | number)[]
  children: ReactNode
}) {
  const path = useContext(PathContext)
  const newPath = useMemo(() => path.concat(props.part), [path, props.part])
  return <PathContext.Provider value={newPath}>{props.children}</PathContext.Provider>
}

export const PathContext = createContext<ReadonlyPropPath>([])

export const PathContextProvider = PathContext.Provider
