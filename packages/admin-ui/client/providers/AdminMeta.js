/* global KEYSTONE_ADMIN_META */

const { lists } = KEYSTONE_ADMIN_META;
const listKeys = Object.keys(lists);
const listsByPath = listKeys.reduce((map, key) => {
  const list = lists[key];
  map[list.path] = list;
  return map;
}, {});

const adminMeta = {
  ...KEYSTONE_ADMIN_META,
  listKeys,
  getListByKey(key) {
    return lists[key];
  },
  getListByPath(path) {
    return listsByPath[path];
  },
};

const AdminMetaProvider = ({ children }) => children(adminMeta);

export default AdminMetaProvider;
