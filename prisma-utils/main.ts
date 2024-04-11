import fs from 'node:fs/promises'
import type { DMMF } from '@prisma/generator-helper'
import { getDMMF } from '@prisma/internals'

// https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-scalar-types
//
// missing
// - Bytes
// - Json
// - Unsupported (this one can't be interacted with in the prisma client (and therefore cannot be filtered) so it's irrelevant here)

const PROVIDERS = ['postgresql', 'sqlite', 'mysql'] as const
type Provider = (typeof PROVIDERS)[number]
const SCALARS = ['String', 'Boolean', 'Int', 'Float', 'DateTime', 'Decimal', 'BigInt'] as const

type Scalar = (typeof SCALARS)[number]
const GRAPHQL_SCALARS = {
  String: 'graphql.String',
  Boolean: 'graphql.Boolean',
  Int: 'graphql.Int',
  Float: 'graphql.Float',
  Json: 'graphql.JSON',
  DateTime: 'graphql.DateTime',
  Decimal: 'graphql.Decimal',
  BigInt: 'graphql.BigInt',
} as const

function getSchemaForProvider (provider: Provider) {
  return `
datasource ${provider} {
  url = env("DATABASE_URL")
  provider = "${provider}"
}

generator client {
  provider = "prisma-client-js"
}

model Optional {
  id Int @id @default(autoincrement())
  ${SCALARS.map(scalarType => `${scalarType} ${scalarType}?`).join('\n')}
}

model Required {
  id Int @id @default(autoincrement())
  ${SCALARS.map(scalarType => `${scalarType} ${scalarType}`).join('\n')}
}

${
  provider === 'postgresql'
    ? `model Many {
  id Int @id @default(autoincrement())
  ${SCALARS.map(scalarType => `${scalarType} ${scalarType}[]`).join('\n')}
}`
    : ''
}
`
}

function generateTSType (scalar: Scalar, filter: DMMF.InputType, nesting: boolean = false) {
  const gqlType = GRAPHQL_SCALARS[scalar]

  // we use Boolean, Prisma uses Bool, oh well
  const filterName = filter.name.replace(/Bool/g, 'Boolean')

  return [
    `type ${filterName}Type = graphql.InputObjectType<{`,
    ...filter.fields.map(field => {
      const suffix = field.isNullable ? ` // can be null` : ``

      if (field.name === 'not') {
        if (nesting) return `  ${field.name}: graphql.Arg<Nested${filterName}Type>${suffix}`
        return `  ${field.name}: graphql.Arg<${filterName}Type>${suffix}`
      }

      if (['in', 'notIn'].includes(field.name)) {
        return `  ${field.name}: graphql.Arg<graphql.ListType<graphql.NonNullType<typeof ${gqlType}>>>${suffix}`
      }

      if (field.name === 'mode') {
        return `  ${field.name}: graphql.Arg<typeof QueryMode>${suffix}`
      }

      return `  ${field.name}: graphql.Arg<typeof ${gqlType}>${suffix}`
    }),
    `}>`,
  ].join('\n')
}

function generateGQLType (scalar: Scalar, filter: DMMF.InputType, nesting: boolean = false) {
  const gqlType = GRAPHQL_SCALARS[scalar]

  // we use Boolean, Prisma uses Bool, oh well
  const filterName = filter.name.replace(/Bool/g, 'Boolean')

  return [
    `const ${filterName}: ${filterName}Type = graphql.inputObject({`,
    `  name: '${filterName}',`,
    `  fields: () => ({`,
    ...filter.fields.map(field => {
      const suffix = field.isNullable ? ` // can be null` : ``

      if (field.name === 'mode') {
        return `    ${field.name}: graphql.arg({ type: QueryMode }),${suffix}`
      }

      if (field.name === 'not') {
        if (nesting) {
          return `    ${field.name}: graphql.arg({ type: Nested${filterName} }),${suffix}`
        }
        return `    ${field.name}: graphql.arg({ type: ${filterName} }),${suffix}`
      }

      if (['in', 'notIn'].includes(field.name)) {
        return `    ${field.name}: graphql.arg({ type: graphql.list(graphql.nonNull(${gqlType})) }),${suffix}`
      }

      return `    ${field.name}: graphql.arg({ type: ${gqlType} }),${suffix}`
    }),
    `  }),`,
    `})`,
  ].join('\n')
}

async function generate (provider: Provider) {
  const schema = getSchemaForProvider(provider)
  const prismaFilterTypes = (await getDMMF({ datamodel: schema })).schema.inputObjectTypes.prisma as DMMF.InputType[] // TODO: why...

  // for generation
  const filters = []
  const exports_ = []
  for (const scalar of SCALARS) {
    // we use Boolean, Prisma uses Bool, oh well
    const prismaScalar = scalar === 'Boolean' ? 'Bool' : scalar

    for (const filter of prismaFilterTypes) {
      // why? for String, the case insensitivity mode argument is not recursively supported
      const nesting = scalar === 'String'

      if (filter.name === `${prismaScalar}Filter`) {
        filters.push(generateTSType(scalar, filter, nesting))
        filters.push(generateGQLType(scalar, filter, nesting))
      }

      if (filter.name === `${prismaScalar}NullableFilter`) {
        filters.push(generateTSType(scalar, filter))
        filters.push(generateGQLType(scalar, filter))
      }

      if (nesting) {
        if (filter.name === `Nested${prismaScalar}Filter`) {
          filters.push(generateTSType(scalar, filter))
          filters.push(generateGQLType(scalar, filter))
        }

        if (filter.name === `Nested${prismaScalar}NullableFilter`) {
          filters.push(generateTSType(scalar, filter))
          filters.push(generateGQLType(scalar, filter))
        }
      }
    }

    exports_.push(
      [
        `export const ${scalar} = {`,
        `  optional: ${scalar}NullableFilter,`,
        `  required: ${scalar}Filter,`,
        `}`,
      ].join('\n')
    )
  }

  return [
    `// Do not manually modify this file, it is automatically generated by the package at /prisma-utils in this repo.`,
    `import { graphql } from '../../../types/schema'`,

    // case sensitivity is only supported for POSTGRES
    ...(provider === 'postgresql'
      ? [`import { QueryMode } from '../../../types/next-fields'`]
      : []),

    ...filters,
    ...exports_,
    `export { enumFilters as enum } from '../enum-filter'\n`,
  ].join('\n\n')
}

async function main () {
  if (process.argv.includes('--verify')) {
    for (const provider of PROVIDERS) {
      console.log(`verifying ${provider} prisma filter types`)
      const before = await fs.readFile(
        `${__dirname}/../packages/core/src/fields/filters/providers/${provider}.ts`,
        { encoding: 'utf-8' }
      )
      const now = await generate(provider)

      if (before !== now) throw new Error(`${provider} filter types mismatch`)
    }

    return
  }

  for (const provider of PROVIDERS) {
    console.log(`generating ${provider} prisma filter types`)
    const outputPath = `${__dirname}/../packages/core/src/fields/filters/providers/${provider}.ts`
    await fs.writeFile(outputPath, await generate(provider))
  }
}

main()
