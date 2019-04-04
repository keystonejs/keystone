// @flow

export function getDevPath(cjsPath: string) {
  return cjsPath.replace(/\.js$/, '.dev.js');
}

export function getProdPath(cjsPath: string) {
  return cjsPath.replace(/\.js$/, '.prod.js');
}
