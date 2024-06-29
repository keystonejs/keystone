import type { BaseKeystoneTypeInfo, KeystoneContext } from '.'

export type SessionStrategy<
  Session,
  TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo
> = {
  get: (args: { context: KeystoneContext<TypeInfo> }) => Promise<Session | undefined>
  start: (args: { context: KeystoneContext<TypeInfo>, data: Session }) => Promise<unknown>
  end: (args: { context: KeystoneContext<TypeInfo> }) => Promise<unknown>
}
