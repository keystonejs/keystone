import type { KeystoneContext } from '../context'
import { gWithContext } from './gWithContext'

export const g = gWithContext<KeystoneContext>()
export type g<T> = gWithContext.infer<T>
