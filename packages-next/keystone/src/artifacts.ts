import path from 'path';
import { printSchema, GraphQLSchema } from 'graphql';
import * as fs from 'fs-extra';
import type { BaseKeystone } from '@keystone-next/types';
import { getGenerator, formatSchema } from '@prisma/sdk';
import { confirmPrompt } from './lib/prompts';
import { printGeneratedTypes } from './lib/schema-type-printer';

export function getSchemaPaths(cwd: string) {
  return {
    prisma: path.join(cwd, 'schema.prisma'),
    graphql: path.join(cwd, 'schema.graphql'),
  };
}

type CommittedArtifacts = {
  graphql: string;
  prisma: string;
};

export async function getCommittedArtifacts(
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone
): Promise<CommittedArtifacts> {
  return {
    graphql: printSchema(graphQLSchema),
    prisma: await formatSchema({
      schema: keystone.adapter._generatePrismaSchema({
        rels: keystone._consolidateRelationships(),
        clientDir: 'node_modules/.prisma/client',
      }),
    }),
  };
}

async function readFileButReturnNothingIfDoesNotExist(filename: string) {
  try {
    return await fs.readFile(filename, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}

export async function validateCommittedArtifacts(
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  cwd: string
) {
  const artifacts = await getCommittedArtifacts(graphQLSchema, keystone);
  const schemaPaths = getSchemaPaths(cwd);
  const [writtenGraphQLSchema, writtenPrismaSchema] = await Promise.all([
    readFileButReturnNothingIfDoesNotExist(schemaPaths.graphql),
    readFileButReturnNothingIfDoesNotExist(schemaPaths.prisma),
  ]);
  const outOfDateSchemas = (() => {
    if (writtenGraphQLSchema !== artifacts.graphql && writtenPrismaSchema !== artifacts.prisma) {
      return 'both';
    }
    if (writtenGraphQLSchema !== artifacts.graphql) {
      return 'graphql';
    }
    if (writtenPrismaSchema !== artifacts.prisma) {
      return 'prisma';
    }
  })();
  if (outOfDateSchemas) {
    const message = {
      both: 'Your Prisma and GraphQL schemas are not up to date',
      graphql: 'Your GraphQL schema is not up to date',
      prisma: 'Your GraphQL schema is not up to date',
    }[outOfDateSchemas];
    console.log(message);
    const term = {
      both: 'Prisma and GraphQL schemas',
      prisma: 'Prisma schema',
      graphql: 'GraphQL schema',
    }[outOfDateSchemas];
    if (process.stdout.isTTY && (await confirmPrompt(`Would you like to update your ${term}?`))) {
      await writeCommittedArtifacts(artifacts, cwd);
    } else {
      console.log(`Please run keystone-next postinstall --fix to update your ${term}`);
      process.exit(1);
    }
  }
}

export async function writeCommittedArtifacts(artifacts: CommittedArtifacts, cwd: string) {
  const schemaPaths = getSchemaPaths(cwd);
  await Promise.all([
    fs.writeFile(schemaPaths.graphql, artifacts.graphql),
    fs.writeFile(schemaPaths.prisma, artifacts.prisma),
  ]);
}

export async function generateCommittedArtifacts(
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  cwd: string
) {
  const artifacts = await getCommittedArtifacts(graphQLSchema, keystone);
  await writeCommittedArtifacts(artifacts, cwd);
  return artifacts;
}

export async function generateNodeModulesArtifacts(
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  cwd: string
) {
  const printedSchema = printSchema(graphQLSchema);

  await Promise.all([
    generatePrismaClient(cwd),
    fs.outputFile(
      path.join(cwd, 'node_modules/.keystone/types.d.ts'),
      printGeneratedTypes(printedSchema, keystone, graphQLSchema)
    ),
    fs.outputFile(path.join(cwd, 'node_modules/.keystone/types.js'), ''),
  ]);
}

async function generatePrismaClient(cwd: string) {
  const generator = await getGenerator({ schemaPath: getSchemaPaths(cwd).prisma });
  await generator.generate();
  generator.stop();
}

export function requirePrismaClient(cwd: string) {
  return require(path.join(cwd, 'node_modules/.prisma/client')).PrismaClient;
}
