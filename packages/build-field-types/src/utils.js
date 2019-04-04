// @flow
import { Entrypoint } from "./entrypoint";

export function getNameForDist(name: string): string {
  return name.replace(/.*\//, "");
}

export function getValidMainField(entrypoint: Entrypoint) {
  let nameForDist = getNameForDist(entrypoint.package.name);
  return `dist/${nameForDist}.cjs.js`;
}

export function getValidModuleField(entrypoint: Entrypoint) {
  let nameForDist = getNameForDist(entrypoint.package.name);
  return `dist/${nameForDist}.esm.js`;
}

export function getValidCjsBrowserPath(entrypoint: Entrypoint) {
  return getValidMainField(entrypoint).replace("cjs", "browser.cjs");
}

export function getValidModuleBrowserPath(entrypoint: Entrypoint) {
  return getValidModuleField(entrypoint).replace("esm", "browser.esm");
}

export function getValidCjsReactNativePath(entrypoint: Entrypoint) {
  return getValidMainField(entrypoint).replace("cjs", "native.cjs");
}

export function getValidModuleReactNativePath(entrypoint: Entrypoint) {
  return getValidModuleField(entrypoint).replace("esm", "native.esm");
}

export function getValidBrowserField(entrypoint: Entrypoint) {
  let obj = {
    [`./${getValidMainField(entrypoint)}`]:
      "./" + getValidCjsBrowserPath(entrypoint)
  };
  if (entrypoint.module !== null) {
    obj[`./${getValidModuleField(entrypoint)}`] =
      "./" + getValidModuleBrowserPath(entrypoint);
  }
  return obj;
}

export function getValidReactNativeField(entrypoint: Entrypoint) {
  let obj = {
    [`./${getValidMainField(entrypoint)}`]:
      "./" + getValidCjsReactNativePath(entrypoint)
  };
  if (entrypoint.module !== null) {
    obj[`./${getValidModuleField(entrypoint)}`] =
      "./" + getValidModuleReactNativePath(entrypoint);
  }
  return obj;
}

export function getValidUmdMainField(entrypoint: Entrypoint) {
  let nameForDist = getNameForDist(entrypoint.package.name);
  return `dist/${nameForDist}.umd.min.js`;
}
