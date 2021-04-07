import path from 'path';

export function getConfigPath(cwd: string) {
  return path.join(cwd, 'keystone');
}

export function getAdminPath(cwd: string) {
  return path.join(cwd, '.keystone/admin');
}
