export const itemTemplate = (listKey: string) =>
  `import { getItemPage } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/ItemPage';

export default getItemPage(${JSON.stringify({ listKey })})
`;
