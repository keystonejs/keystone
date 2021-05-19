export const itemTemplate = (listKey: string) =>
  `import { getItemPage } from '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/admin-ui/pages/ItemPage';

export default getItemPage(${JSON.stringify({ listKey })})
`;
