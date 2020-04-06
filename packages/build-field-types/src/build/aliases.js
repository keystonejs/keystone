import path from 'path';

export function getAliases(project, getKey = x => x) {
  let aliases = {};
  project.packages.forEach(pkg => {
    pkg.entrypoints
      .map(x => x.strict())
      .forEach(entrypoint => {
        aliases[getKey(entrypoint.name)] = path.join(
          pkg.name,
          path.relative(entrypoint.directory, entrypoint.source)
        );
      });
  });
  return aliases;
}
