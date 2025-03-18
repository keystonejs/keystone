import { ItemPage } from './page'

export const getItemPage =
  ({ listKey }: { listKey: string }) =>
  async (props: { params: Promise<{ id: string }> }) => (
    <ItemPage listKey={listKey} id={(await props.params).id} />
  )
