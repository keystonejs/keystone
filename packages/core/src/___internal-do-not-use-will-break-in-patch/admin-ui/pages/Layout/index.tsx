import type { ReactNode } from 'react'
import type { KeystoneConfig } from '../../../../types'
import { Layout } from './layout'
import { createSystem } from '../../../../lib/createSystem'
import { adminMetaQuery } from '../../../../admin-ui/admin-meta-graphql'
import { weakMemoize } from '../../../../lib/core/utils'

export const initKeystoneForAdminUI = weakMemoize((config: KeystoneConfig) => {
  const { adminMeta, getKeystone } = createSystem(config)
  const allViews = Promise.all(
    adminMeta.lists.map(
      async list =>
        [
          list.key,
          Object.fromEntries(
            await Promise.all(
              list.fields.map(async field => {
                const [main, custom] = await Promise.all([field.views(), field.customViews?.()])
                return [
                  field.path,
                  { main: { ...main }, custom: custom ? { ...custom } : custom },
                ] as const
              })
            )
          ),
        ] as const
    )
  ).then(entries => Object.fromEntries(entries))
  return { adminMeta, getKeystone: weakMemoize(getKeystone), allViews }
})

export function getLayout(config: KeystoneConfig, PM: any) {
  const { getKeystone, allViews } = initKeystoneForAdminUI(config)
  const keystone = getKeystone(PM)
  return async (props: { children: ReactNode }) => {
    const data = await keystone.context.graphql.run({
      query: adminMetaQuery,
    })

    return (
      <Layout
        config={{
          components: { ...config.ui.components },
          basePath: config.ui.basePath,
          apiPath: config.graphql.path,
          // react server components won't serialize null prototype objects which is what graphql returns
          adminMeta: JSON.parse(JSON.stringify(data)),
          fieldViews: await allViews,
        }}
      >
        {props.children}
      </Layout>
    )
  }
}
