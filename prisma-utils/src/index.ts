import { deepStrictEqual } from 'assert';
import fs from 'fs-extra';
import { DMMF } from '@prisma/generator-helper';
import { getDMMF } from '@prisma/sdk';
import { format, resolveConfig } from 'prettier';

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
  'Decimal',
  // we're gonna ignore Bytes because how do you want to filter by bytes and what GraphQL scalar do we use?
  // 'Bytes',
  // 'SomeEnum',
] as const;

// const enumDecl = `enum SomeEnum {
//   a
//   b
// }`;

const getScalarTypesForProvider = (provider: Provider): readonly typeof scalarTypes[number][] =>
  provider === 'sqlite' ? scalarTypes.filter(x => x !== 'Json') : scalarTypes;

const getSchemaForProvider = (provider: Provider) => {
  const scalarTypesForProvider = getScalarTypesForProvider(provider);
  return `datasource ${provider} {
  url = env("DATABASE_URL")
  provider = "${provider}"
}

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
  const prettierConfig = await resolveConfig(`${__dirname}/index.ts`);
  assert(prettierConfig !== null);
  for (const provider of providers) {
    const schema = getSchemaForProvider(provider);
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
        // the filter types have to be generic over the enum so it's just easier to write it out manually
        // but we still want this here to snapshot what the filters look like for a given prisma version & provider combination
        return [];
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
    const filepath = `${__dirname}/../../packages-next/types/src/filters/providers/${provider}.ts`;
    await fs.outputFile(
      filepath,
      format(
        `import {types,tsgql} from '../../next-fields'

${
  provider !== 'sqlite'
    ? `const QueryMode = types.enum({
  name: 'QueryMode',
  values:types.enumValues(['default','insensitive'])
})`
    : ''
}

${[...referencedTypes].map(typeName => printInputTypeForTSGQL(typeName, types)).join('\n\n')}

${getScalarTypesForProvider(provider)
  .map(scalar => {
    const scalarInFilterName = scalar === 'Boolean' ? 'Bool' : scalar;
    return `export const ${scalar} = {
  optional: ${scalarInFilterName}NullableFilter,
  required: ${scalarInFilterName}Filter,
  ${provider === 'postgresql' ? `many: ${scalarInFilterName}NullableListFilter` : ''}
}`;
  })
  .join('\n\n')}

export {enumFilters as enum } from '../enum-filter'
        `,
        { ...prettierConfig, filepath }
      )
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

/**
 * Note a field can be both nullable and a list.
 *
 * Translated into typescript, that means `Array<T> | null`,
 * not `Array<T | null>` or `Array<T | null> | null`
 */
type TransformedInputTypeField = {
  type: string;
  isNullable: boolean;
  isList: boolean;
};

function pickInputTypeForField(field: DMMF.SchemaArg): TransformedInputTypeField {
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
  const inputType = (() => {
    if (inputTypesWithoutNull.length === 1) {
      return inputTypesWithoutNull[0];
    }
    assert(
      inputTypesWithoutNull.length === 2,
      'unexpected more than two input types excluding null'
    );
    const inputType = inputTypesWithoutNull.find(x => x.location == 'inputObjectTypes');
    assert(
      !!inputType,
      'could not find input object type when more than one input type excluding null'
    );
    return inputType;
  })();
  assert(typeof inputType.type === 'string');
  return {
    isList: inputType.isList,
    isNullable: field.isNullable,
    type: scalarsToGqlScalars[inputType.type] ?? inputType.type,
  };
}

function printInputTypeForTSGQL(
  inputTypeName: string,
  inputTypesByName: Record<string, DMMF.InputType>
) {
  const inputType = inputTypesByName[inputTypeName];
  assert(inputType !== undefined, `could not find input type ${inputTypeName}`);
  const expectedMaxMinNumFields = inputTypeName.endsWith('NullableListFilter') ? 1 : null;
  assert(inputType.constraints.maxNumFields === expectedMaxMinNumFields);
  assert(inputType.constraints.minNumFields === expectedMaxMinNumFields);
  const nameOfInputObjectTypeType = `${inputTypeName}Type`;
  const fields = inputType.fields.map(x => [x.name, pickInputTypeForField(x)] as const);
  return `type ${nameOfInputObjectTypeType} = tsgql.InputObjectType<{
    ${fields
      .map(([name, field]) => {
        return `${field.isNullable ? '// can be null\n' : ''}${name}: tsgql.Arg<${
          field.isList
            ? `tsgql.ListType<tsgql.NonNullType<typeof ${field.type}>>`
            : `typeof ${field.type}`
        }>`;
      })
      .join(',\n')}
  }>
  
  const ${inputTypeName}: ${nameOfInputObjectTypeType} = types.inputObject({
    name: '${inputTypeName}',
    fields: () => ({
      ${fields
        .map(([name, field]) => {
          return `${field.isNullable ? '// can be null\n' : ''}${name}: types.arg({ type: ${
            field.isList ? `types.list(types.nonNull(${field.type}))` : field.type
          } })`;
        })
        .join(',\n')}
    })
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
  Decimal: 'types.Decimal',
};
