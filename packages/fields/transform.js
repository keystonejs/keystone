// Press ctrl+space for code completion
export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.VariableDeclaration)
    .forEach(path => {
      if (path.value.declarations.length === 1) {
        let decl = path.value.declarations[0];
        console.log(decl);
        if (
          decl.init.type === 'CallExpression' &&
          decl.init.callee.type === 'Identifier' &&
          decl.init.callee.name === 'require'
        ) {
          let pathname = decl.init.arguments[0].value;
          if (decl.id.type === 'Identifier') {
            j(path).replaceWith(
              j.importDeclaration(
                [j.importDefaultSpecifier(j.identifier(decl.id.name))],
                j.stringLiteral(pathname)
              )
            );
          }
          if (decl.id.type === 'ObjectPattern') {
            let specifiers = [];
            let shouldConvert = true;
            decl.id.properties.forEach(property => {
              if (
                property.type === 'Property' &&
                property.key.type === 'Identifier' &&
                property.value.type === 'Identifier'
              ) {
                specifiers.push(j.importSpecifier(property.value, property.key));
              } else {
                shouldConvert = false;
              }
            });
            if (shouldConvert) {
              j(path).replaceWith(j.importDeclaration(specifiers, j.stringLiteral(pathname)));
            }
          }
        }
      }
    })
    .toSource();
}
