import type { NoAccessPageProps } from './page'
import { NoAccessPage } from './page'

export const getNoAccessPage = (props: NoAccessPageProps) => () => <NoAccessPage {...props} />
