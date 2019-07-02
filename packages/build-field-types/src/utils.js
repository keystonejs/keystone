// @flow

export function getNameForDist(name: string): string {
  return name.replace(/.*\//, '');
}

export function getValidMainField(pkgName: string) {
  let nameForDist = getNameForDist(pkgName);
  return `dist/${nameForDist}.cjs.js`;
}

export function getValidModuleField(pkgName: string) {
  let nameForDist = getNameForDist(pkgName);
  return `dist/${nameForDist}.esm.js`;
}
