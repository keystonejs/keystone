export const listTemplate = (listKey: string) =>
  `import { getListPage } from '@keystone-next/admin-ui/pages/ListPage';

export default getListPage(${JSON.stringify({ listKey })});
`;
