export const itemTemplate = (listKey: string) =>
  `import { getItemPage } from '@keystone-next/admin-ui/pages/ItemPage';

export default getItemPage(${JSON.stringify({ listKey })})
`;
