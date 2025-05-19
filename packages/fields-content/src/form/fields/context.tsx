import { createContext, useContext } from 'react'

export const FIELD_GRID_COLUMNS = 12

const FieldContext = createContext<number>(FIELD_GRID_COLUMNS)

export const useFieldSpan = () => useContext(FieldContext)
export const FieldContextProvider = FieldContext.Provider
