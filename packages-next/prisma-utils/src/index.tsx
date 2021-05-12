import { deepStrictEqual } from 'assert';
import fs from 'fs-extra';
import { DMMF } from '@prisma/generator-helper';
import { getDMMF } from '@prisma/sdk';

const providers = ['postgresql', 'sqlite'] as const;

type Provider = typeof providers[number];

// https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-scalar-types
// (Unsupported isn't included here because it's special and isn't surfaced in the client which is what we're snapshotting here)
const scalarTypes = [
  'String',
  'Boolean',
  'Int',
  'Float',
  'DateTime',
  'BigInt',
  'Json',
  // we're gonna ignore Bytes because how do you want to filter by bytes?
  // 'Bytes',
  'SomeEnum',
] as const;

const enumDecl = `enum SomeEnum {
  a
  b
}`;

const getScalarTypesForProvider = (provider: Provider): readonly typeof scalarTypes[number][] =>
  provider === 'sqlite'
    ? scalarTypes.filter(x => x !== 'Json' && x !== 'SomeEnum' && x !== 'Bytes')
    : scalarTypes;

const getSchemaForProvider = (provider: Provider) => {
  const scalarTypesForProvider = getScalarTypesForProvider(provider);
  return `datasource ${provider} {
  url = env("DATABASE_URL")
  provider = "${provider}"
}

${provider === 'postgresql' ? enumDecl : ''}

generator client {
  provider = "prisma-client-js"
}

model Optional {
  id Int @id @default(autoincrement())
  ${scalarTypesForProvider.map(scalarType => `${scalarType} ${scalarType}?`).join('\n')}
}

model Required {
  id Int @id @default(autoincrement())
  ${scalarTypesForProvider.map(scalarType => `${scalarType} ${scalarType}`).join('\n')}
}

${
  provider === 'postgresql'
    ? `model Many {
  id Int @id @default(autoincrement())
  ${scalarTypesForProvider.map(scalarType => `${scalarType} ${scalarType}[]`).join('\n')}
}`
    : ''
}

`;
};

(async () => {
  for (const provider of providers) {
    const schema = getSchemaForProvider(provider);
    console.log(schema);
    const dmmf = await getDMMF({ datamodel: schema });

    await fs.outputFile(
      `${__dirname}/generated/${provider}.json`,
      JSON.stringify(dmmf.schema.inputObjectTypes, null, 2)
    );
    const types = getInputTypesByName(dmmf.schema.inputObjectTypes.prisma);
    const rootTypes = getScalarTypesForProvider(provider).flatMap((scalar: string) => {
      if (scalar === 'Boolean') {
        scalar = 'Bool';
      }
      if (scalar === 'SomeEnum') {
        scalar = 'EnumSomeEnum';
      }
      let types = [`${scalar}NullableFilter`, `${scalar}Filter`];
      if (provider === 'postgresql') {
        // i'm not sure this is says nullable when they're not nullable?
        // i don't think there is a nullable and non-nullable list?
        types.push(`${scalar}NullableListFilter`);
      }
      return types;
    });
    const referencedTypes = new Set<string>();
    for (const typeName of rootTypes) {
      collectReferencedTypes(types, typeName, referencedTypes);
    }
    if (provider !== 'sqlite') {
      deepStrictEqual(
        dmmf.schema.enumTypes.prisma.find(x => x.name === 'QueryMode'),
        { name: 'QueryMode', values: ['default', 'insensitive'] }
      );
    }

    await fs.outputFile(
      `${__dirname}/generated/only-filters/${provider}.json`,
      JSON.stringify(
        Object.fromEntries([...referencedTypes].map(typeName => [typeName, types[typeName]])),
        null,
        2
      )
    );
    await fs.outputFile(
      `${__dirname}/generated/${provider}.ts`,
      `import {types} from '@keystone-next/types'
      
${
  provider !== 'sqlite'
    ? `const QueryMode = types.enum({
  name: 'QueryMode',
  values:types.enumValues(['default','insensitive'])
})`
    : ''
}

      ${[...referencedTypes].map(typeName => printInputTypeForTSGQL(typeName, types)).join('\n\n')}`
    );
  }
})();

function getInputTypesByName(types: DMMF.InputType[]) {
  return Object.fromEntries(types.map(x => [x.name, x]));
}

function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    debugger;
    throw new Error(`assertion failed${message === undefined ? '' : `: ${message}`}`);
  }
}

const expectedScalars = new Set(['Null', 'QueryMode', ...scalarTypes]);

function collectReferencedTypes(
  inputTypesByName: Record<string, DMMF.InputType>,
  inputTypeName: string,
  referencedTypes: Set<string>
) {
  referencedTypes.add(inputTypeName);
  const inputType = inputTypesByName[inputTypeName];
  assert(inputType !== undefined, `could not find input type ${inputTypeName}`);

  for (const field of inputType.fields) {
    assert(!field.isRequired, 'unexpected required field');
    for (const inputType of field.inputTypes) {
      assert(typeof inputType.type === 'string', 'unexpected non-type name in input types');
      if (inputType.location === 'scalar' || inputType.location === 'enumTypes') {
        assert(expectedScalars.has(inputType.type), `unexpected scalar ${inputType.type}`);
        continue;
      }
      assert(inputType.location === 'inputObjectTypes', `unexpected ${inputType.location} type`);
      if (!referencedTypes.has(inputType.type)) {
        collectReferencedTypes(inputTypesByName, inputType.type, referencedTypes);
      }
    }
  }
}

function printInputTypeForTSGQL(
  inputTypeName: string,
  inputTypesByName: Record<string, DMMF.InputType>
) {
  const inputType = inputTypesByName[inputTypeName];
  assert(inputType !== undefined, `could not find input type ${inputTypeName}`);
  if (inputTypeName.endsWith('NullableListFilter')) {
    assert(inputType.constraints.maxNumFields === 1);
    assert(inputType.constraints.minNumFields === 1);
  } else {
    assert(inputType.constraints.maxNumFields === null);
    assert(inputType.constraints.minNumFields === null);
  }
  return `export const ${inputTypeName} = types.inputObject({
    name: '${inputTypeName}',
    fields: {
      ${inputType.fields
        .map(field => {
          assert(!field.isRequired, 'unexpected required field');
          // null is already represented with field.isNullable
          const inputTypesWithoutNull = field.inputTypes.filter(type => {
            if (type.type === 'Null') {
              assert(!type.isList, 'unexpected null list');
              assert(field.isNullable, 'unexpected isNullable false when null type in input types');
              return false;
            }
            return true;
          });

          assert(
            inputTypesWithoutNull.length + Number(field.isNullable) === field.inputTypes.length,
            'unexpected isNullable false when null type in input types'
          );
          assert(
            inputTypesWithoutNull.length <= 2,
            'unexpected more than two input types excluding null'
          );
          const complexTypes = inputTypesWithoutNull.filter(x => x.location === 'inputObjectTypes');
          assert(complexTypes.length <= 1, 'unexpected more than one rich input type');
          const scalarTypes = inputTypesWithoutNull.filter(
            x => x.location === 'scalar' || x.location === 'enumTypes'
          );
          assert(scalarTypes.length <= 1, 'unexpected more than one scalar input type');

          let typeName: string | undefined = undefined;
          let isList = false;
          if (complexTypes.length) {
            assert(typeof complexTypes[0].type === 'string');
            typeName = complexTypes[0].type;
            isList = complexTypes[0].isList;
          }
          if (scalarTypes.length === 1) {
            assert(typeof scalarTypes[0].type === 'string');
            typeName = scalarsToGqlScalars[scalarTypes[0].type] || scalarTypes[0].type;
            isList = scalarTypes[0].isList;
          }
          assert(typeName !== undefined, 'could not get type name');

          return `${field.isNullable ? '// can be null\n' : ''}${field.name}: types.arg({ type: ${
            isList ? `types.list(types.nonNull(${typeName}))` : typeName
          } })`;
        })
        .join(',\n')}
    }
  })`;
}

const scalarsToGqlScalars: Record<string, string> = {
  String: 'types.String',
  Boolean: 'types.Boolean',
  Int: 'types.Int',
  Float: 'types.Float',
  Json: 'types.JSON',
  DateTime: 'types.String',
  BigInt: 'types.String',
};
