import { ListPage } from './page'

export const getListPage = (props: { listKey: string }) => () => <ListPage {...props} />
