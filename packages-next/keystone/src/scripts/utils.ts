import path from 'path';
// TODO: Read config path from process args
export const CONFIG_PATH = path.join(process.cwd(), 'keystone');

export function getAdminPath(cwd: string) {
  return path.join(cwd, '.keystone/admin');
}
