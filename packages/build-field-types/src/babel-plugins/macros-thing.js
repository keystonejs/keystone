// todo: add the transformer stuff from the babel-plugin-emotion import mapping stuff
// todo: i should put this thing into a package at some point
module.exports = macros => babel => {
  let t = babel.types;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        // most of this is from https://github.com/kentcdodds/babel-plugin-macros/blob/master/src/index.js
        if (macros[path.node.source.value] === undefined) {
          return;
        }
        if (t.isImportNamespaceSpecifier(path.node.specifiers[0])) {
          return;
        }
        const imports = path.node.specifiers.map(s => ({
          localName: s.local.name,
          importedName: s.type === 'ImportDefaultSpecifier' ? 'default' : s.imported.name,
        }));
        let shouldExit = false;
        let hasReferences = false;
        const referencePathsByImportName = imports.reduce((byName, { importedName, localName }) => {
          let binding = path.scope.getBinding(localName);
          if (!binding) {
            shouldExit = true;
            return byName;
          }
          byName[importedName] = binding.referencePaths;
          hasReferences = hasReferences || Boolean(byName[importedName].length);
          return byName;
        }, {});
        if (!hasReferences || shouldExit) {
          return;
        }
        /**
         * Other plugins that run before babel-plugin-macros might use path.replace, where a path is
         * put into its own replacement. Apparently babel does not update the scope after such
         * an operation. As a remedy, the whole scope is traversed again with an empty "Identifier"
         * visitor - this makes the problem go away.
         *
         * See: https://github.com/kentcdodds/import-all.macro/issues/7
         */
        state.file.scope.path.traverse({
          Identifier() {},
        });

        macros[path.node.source.value]({
          references: referencePathsByImportName,
          state,
          babel,
          isBabelMacrosCall: true,
          isEmotionCall: true,
        });
        path.remove();
      },
    },
  };
};
