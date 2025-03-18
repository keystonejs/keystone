import type { ReactNode } from 'react'
import {
  getLayout,
  initKeystoneForAdminUI,
} from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/Layout'
import type { KeystoneConfig } from '../types'
import { HomePage } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/HomePage'
import { CreateItemPage } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/CreateItemPage/page'
import { ListPage } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage/page'
import { ItemPage } from '../___internal-do-not-use-will-break-in-patch/admin-ui/pages/ItemPage/page'

export function KeystoneLayout(props: {
  config: KeystoneConfig
  Prisma: any
  children: ReactNode
}) {
  // while creating a component inside render is normally bad, it doesn't really matter a in a server component
  // since components aren't really "mounted"
  const Layout = getLayout(props.config, props.Prisma)
  return <Layout>{props.children}</Layout>
}

export async function KeystonePage(props: {
  params: Promise<{
    params: readonly string[] | undefined
  }>
  config: KeystoneConfig
}) {
  const params = (await props.params).params
  if (!params?.length) {
    return <HomePage />
  }
  const { adminMeta } = initKeystoneForAdminUI(props.config)
  const listPath = params[0]
  const list = adminMeta.lists.find(list => list.path === listPath)
  if (!list) {
    return <div>List not found</div>
  }
  const itemId = params[1]
  if (!itemId) {
    return <ListPage listKey={list.key} />
  }
  if (itemId === 'create') {
    return <CreateItemPage listKey={list.key} />
  }
  return <ItemPage listKey={list.key} id={itemId} />
}
