import type { KeystoneContext } from '../context.ts'
import { gWithContext } from './gWithContext.ts'

export const g = gWithContext<KeystoneContext>()
export type g<T> = gWithContext.infer<T>
