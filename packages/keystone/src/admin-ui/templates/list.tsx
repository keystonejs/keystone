export const listTemplate = (listKey: string) =>
  `import { getListPage } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/ListPage';

export default getListPage(${JSON.stringify({ listKey })});
`;
