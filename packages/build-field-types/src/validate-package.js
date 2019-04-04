// @flow
import { FatalError, FixableError } from "./errors";
import { errors } from "./messages";
/*:: 
import { Package } from "./package";
*/

let camelToPkgJsonField = {
  main: "main",
  module: "module",
  umdMain: "umd:main",
  browser: "browser",
  reactNative: "react-native"
};

export async function fixPackage(pkg: Package) {
  if (pkg.entrypoints.length === 0) {
    throw new FatalError(errors.noEntrypoints, pkg);
  }
  let fields = {
    main: true,
    module: pkg.entrypoints.some(x => x.module),
    umdMain: pkg.entrypoints.some(x => x.umdMain),
    browser: pkg.entrypoints.some(x => x.browser),
    reactNative: pkg.entrypoints.some(x => x.reactNative)
  };

  Object.keys(fields)
    .filter(x => fields[x])
    .forEach(field => {
      pkg.setFieldOnEntrypoints(field);
    });
  return (await Promise.all(pkg.entrypoints.map(x => x.save()))).some(x => x);
}

export function validatePackage(pkg: Package) {
  if (pkg.entrypoints.length === 0) {
    throw new FatalError(errors.noEntrypoints, pkg);
  }
  let fields = {
    // main is intentionally not here, since it's always required
    // it will be validated in validateEntrypoint and the case
    // which this function validates will never happen
    module: !!pkg.entrypoints[0].module,
    umdMain: !!pkg.entrypoints[0].umdMain,
    browser: !!pkg.entrypoints[0].browser,
    reactNative: !!pkg.entrypoints[0].reactNative
  };

  pkg.entrypoints.forEach(entrypoint => {
    Object.keys(fields).forEach(field => {
      if (
        // $FlowFixMe
        entrypoint[field] &&
        !fields[field]
      ) {
        throw new FixableError(
          `${pkg.entrypoints[0].name} has a ${
            camelToPkgJsonField[field]
          } build but ${entrypoint.name} does not have a ${
            camelToPkgJsonField[field]
          } build. Entrypoints in a package must either all have a particular build type or all not have a particular build type.`,
          pkg
        );
      }
      if (
        // $FlowFixMe
        !entrypoint[field] &&
        fields[field]
      ) {
        throw new FixableError(
          `${entrypoint.name} has a ${camelToPkgJsonField[field]} build but ${
            pkg.entrypoints[0].name
          } does not have a ${
            camelToPkgJsonField[field]
          } build. Entrypoints in a package must either all have a particular build type or all not have a particular build type.`,
          pkg
        );
      }
    });
  });
}
