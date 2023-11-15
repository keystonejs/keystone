export const createItemTemplate = (listKey: string) =>
  `import { getCreateItemPage } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/CreateItemPage';

export default getCreateItemPage(${JSON.stringify({ listKey })})
`
