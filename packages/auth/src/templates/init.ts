import { BaseListTypeInfo } from '@keystone-6/core/types';
import { AuthConfig } from '../types';

type InitTemplateArgs = {
  listKey: string;
  initFirstItem: NonNullable<AuthConfig<BaseListTypeInfo>['initFirstItem']>;
};

export const initTemplate = ({ listKey, initFirstItem }: InitTemplateArgs) => {
  // -- TEMPLATE START
  return `import { getInitPage } from '@keystone-6/auth/pages/InitPage';

const fieldPaths = ${JSON.stringify(initFirstItem.fields)};

export default getInitPage(${JSON.stringify({
    listKey,
    fieldPaths: initFirstItem.fields,
    enableWelcome: !initFirstItem.skipKeystoneWelcome,
  })});
`;
  // -- TEMPLATE END
};
