import { NoAccessPage } from '../../../admin-ui/pages/NoAccessPage/index.tsx'

export const getNoAccessPage = (props: Parameters<typeof NoAccessPage>[0]) => () => (
  <NoAccessPage {...props} />
)
