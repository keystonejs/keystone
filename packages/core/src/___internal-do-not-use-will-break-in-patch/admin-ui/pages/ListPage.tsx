import { ListPage } from '../../../admin-ui/pages/ListPage/index.tsx'

export const getListPage = (props: Parameters<typeof ListPage>[0]) => () => <ListPage {...props} />
