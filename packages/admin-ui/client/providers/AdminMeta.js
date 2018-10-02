// @flow
import * as React from 'react';

import List from '../classes/List';

declare var KEYSTONE_ADMIN_META: any;

// TODO: Pull this off `window.X` to support server side permission queries
const { lists, ...srcMeta } = KEYSTONE_ADMIN_META;

const listKeys: Array<string> = Object.keys(lists || {});
const listsByKey = {};
const listsByPath = {};

export type AdminMeta = {
  adminPath: string,
  apiPath: string,
  getListByKey: string => List,
  getListByPath: string => List,
  graphiqlPath: string,
  listKeys: Array<string>,
  name: string,
  sessionPath: string,
  signinPath: string,
  signoutPath: string,
  withAuth: boolean,
};

export const adminMeta: AdminMeta = {
  ...srcMeta,
  listKeys,
  getListByKey(key) {
    return listsByKey[key];
  },
  getListByPath(path) {
    return listsByPath[path];
  },
};

listKeys.forEach(key => {
  const list = new List(lists[key], adminMeta);
  listsByKey[key] = list;
  listsByPath[list.path] = list;
});

// Provider
// TODO: Permission query to see which lists to provide
export const AdminMetaProvider = ({
  children,
}: {
  children: (adminMeta: AdminMeta) => React.Node,
}) => children(adminMeta);

// HOC Wrapper

function setDisplayName(c: React.ComponentType<any>) {
  // $FlowFixMe
  c.displayName = `withAdminMeta(${c.name || c.displayName})`;
}
type AdminMetaProps = {
  adminMeta: AdminMeta,
};

export const withAdminMeta = <Props: AdminMetaProps>(
  Component: React.ComponentType<Props>
): React.ComponentType<$Diff<Props, AdminMetaProps>> => (props: $Diff<Props, AdminMetaProps>) => {
  setDisplayName(Component);
  // TODO: Permission query to see which lists to provide
  return <Component {...props} adminMeta={adminMeta} />;
};
