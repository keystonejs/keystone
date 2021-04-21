import fs from 'fs-extra';
import { getDMMF } from '@prisma/sdk';

const providers = ['postgresql', 'sqlite'] as const;

type Provider = typeof providers[number];

const scalarTypes = [
  'String',
  'Boolean',
  'Int',
  'Float',
  'DateTime',
  'BigInt',
  'Json',
  'SomeEnum',
] as const;

const enumDecl = `enum SomeEnum {
  a
  b
}`;

const getSchemaForProvider = (provider: Provider) => {
  const scalarTypesForProvider: readonly typeof scalarTypes[number][] =
    provider === 'sqlite' ? scalarTypes.filter(x => x !== 'Json' && x !== 'SomeEnum') : scalarTypes;
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

    const dmmf = await getDMMF({ datamodel: schema });

    await fs.outputFile(`${__dirname}/generated/${provider}.json`, JSON.stringify(dmmf, null, 2));
  }
})();
