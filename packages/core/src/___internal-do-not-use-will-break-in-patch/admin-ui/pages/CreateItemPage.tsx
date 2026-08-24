import { CreateItemPage } from '../../../admin-ui/pages/CreateItemPage/index.tsx'

export const getCreateItemPage = (props: Parameters<typeof CreateItemPage>[0]) => () => (
  <CreateItemPage {...props} />
)
