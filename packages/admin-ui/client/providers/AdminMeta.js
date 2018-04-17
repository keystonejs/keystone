/* global KEYSTONE_ADMIN_META */

const sourceMeta = KEYSTONE_ADMIN_META;
const { lists } = sourceMeta;
const listKeys = Object.keys(lists);
const listsByPath = listKeys.reduce((map, key) => {
  const list = lists[key];
  map[list.path] = list;
  return map;
}, {});

const adminMeta = {
  ...sourceMeta,
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
