export function getNameForDist(name) {
  return name.replace(/.*\//, '');
}

export function getValidMainField(pkgName) {
  let nameForDist = getNameForDist(pkgName);
  return `dist/${nameForDist}.cjs.js`;
}

export function getValidModuleField(pkgName) {
  let nameForDist = getNameForDist(pkgName);
  return `dist/${nameForDist}.esm.js`;
}
