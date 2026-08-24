import { ItemPage } from '../../../admin-ui/pages/ItemPage/index.tsx'

export const getItemPage = (props: Parameters<typeof ItemPage>[0]) => () => <ItemPage {...props} />
