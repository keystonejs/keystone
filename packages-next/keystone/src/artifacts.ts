import path from 'path';
import { printSchema, GraphQLSchema } from 'graphql';
import * as fs from 'fs-extra';
import type { KeystoneConfig } from '@keystone-next/types';
import { getGenerator, formatSchema } from '@prisma/sdk';
import { format } from 'prettier';
import { predefinedGeneratorResolvers } from '@prisma/sdk/dist/predefinedGeneratorResolvers';
import { confirmPrompt, shouldPrompt } from './lib/prompts';
import { printGeneratedTypes } from './lib/schema-type-printer';
import { ExitError } from './scripts/utils';
import { initialiseLists } from './lib/core/types-for-lists';
import { printPrismaSchema } from './lib/core/prisma-schema';
import { getDBProvider } from './lib/createSystem';

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
  config: KeystoneConfig
): Promise<CommittedArtifacts> {
  const lists = initialiseLists(config.lists, getDBProvider(config.db));
  const prismaSchema = printPrismaSchema(
    lists,
    getDBProvider(config.db),
    'node_modules/.prisma/client'
  );
  return {
    graphql: format(printSchema(graphQLSchema), { parser: 'graphql' }),
    prisma: await formatSchema({
      schema: prismaSchema,
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
  config: KeystoneConfig,
  cwd: string
) {
  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
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
    if (shouldPrompt && (await confirmPrompt(`Would you like to update your ${term}?`))) {
      await writeCommittedArtifacts(artifacts, cwd);
    } else {
      console.log(`Please run keystone-next postinstall --fix to update your ${term}`);
      throw new ExitError(1);
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
  config: KeystoneConfig,
  cwd: string
) {
  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  await writeCommittedArtifacts(artifacts, cwd);
  return artifacts;
}

const nodeAPIJS = (
  cwd: string,
  config: KeystoneConfig
) => `import keystoneConfig from '../../keystone';
import { PrismaClient } from '.prisma/client';
import { createListsAPI } from '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/node-api';
${makeVercelIncludeTheSQLiteDB(cwd, path.join(cwd, 'node_modules/.keystone/next'), config)}

export const lists = createListsAPI(keystoneConfig, PrismaClient);
`;

const nodeAPIDTS = `import { KeystoneListsAPI } from '@keystone-next/types';
import { KeystoneListsTypeInfo } from './types';

export const lists: KeystoneListsAPI<KeystoneListsTypeInfo>;`;

const makeVercelIncludeTheSQLiteDB = (
  cwd: string,
  directoryOfFileToBeWritten: string,
  config: KeystoneConfig
) => {
  if (config.db.adapter === 'prisma_sqlite' || config.db.provider === 'sqlite') {
    const sqliteDbAbsolutePath = path.resolve(cwd, config.db.url.replace('file:', ''));

    return `import path from 'path';

    path.join(__dirname, ${JSON.stringify(
      path.relative(directoryOfFileToBeWritten, sqliteDbAbsolutePath)
    )});
    path.join(process.cwd(), ${JSON.stringify(path.relative(cwd, sqliteDbAbsolutePath))});
    `;
  }
  return '';
};

const nextGraphQLAPIJS = (
  cwd: string,
  config: KeystoneConfig
) => `import keystoneConfig from '../../../keystone';
import { PrismaClient } from '.prisma/client';
import { nextGraphQLAPIRoute } from '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/next-graphql';
${makeVercelIncludeTheSQLiteDB(cwd, path.join(cwd, 'node_modules/.keystone/next'), config)}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default nextGraphQLAPIRoute(keystoneConfig, PrismaClient);
`;

// note the export default config is just a lazy way of going "this is also any"
const nextGraphQLAPIDTS = `export const config: any;
export default config;
`;

export async function generateNodeModulesArtifacts(
  graphQLSchema: GraphQLSchema,
  config: KeystoneConfig,
  cwd: string
) {
  const lists = initialiseLists(config.lists, getDBProvider(config.db));

  const printedSchema = printSchema(graphQLSchema);
  const dotKeystoneDir = path.join(cwd, 'node_modules/.keystone');
  await Promise.all([
    generatePrismaClient(cwd),
    fs.outputFile(
      path.join(dotKeystoneDir, 'types.d.ts'),
      printGeneratedTypes(printedSchema, graphQLSchema, lists)
    ),
    fs.outputFile(path.join(dotKeystoneDir, 'types.js'), ''),
    ...(config.experimental?.generateNodeAPI
      ? [
          fs.outputFile(path.join(dotKeystoneDir, 'api.js'), nodeAPIJS(cwd, config)),
          fs.outputFile(path.join(dotKeystoneDir, 'api.d.ts'), nodeAPIDTS),
        ]
      : []),
    ...(config.experimental?.generateNextGraphqlAPI
      ? [
          fs.outputFile(
            path.join(dotKeystoneDir, 'next/graphql-api.js'),
            nextGraphQLAPIJS(cwd, config)
          ),
          fs.outputFile(path.join(dotKeystoneDir, 'next/graphql-api.d.ts'), nextGraphQLAPIDTS),
        ]
      : []),
  ]);
}

const prismaClientDir = path.dirname(require.resolve('@prisma/client/package.json'));

async function generatePrismaClient(cwd: string) {
  const prevPredefinedGeneratorResolver = predefinedGeneratorResolvers['prisma-client-js'];
  try {
    // this is ofc v bad and relying on implementation details of prisma
    // but we use fixed versions of prisma so we will know exactly when this breaks
    // this hack exists because predefinedGeneratorResolvers['prisma-client-js']
    // does some really slow things that aren't really necessary for us
    // the big thing seems to be it traverses like every directory inside of your cwd trying the @prisma/client package
    // (not sure if it's exactly that but something like that)
    predefinedGeneratorResolvers['prisma-client-js'] = async () => {
      return {
        outputPath: prismaClientDir,
        generatorPath: path.resolve(prismaClientDir, 'generator-build/index.js'),
        isNode: true,
      };
    };

    const generator = await getGenerator({ schemaPath: getSchemaPaths(cwd).prisma });
    await generator.generate();
    generator.stop();
  } finally {
    predefinedGeneratorResolvers['prisma-client-js'] = prevPredefinedGeneratorResolver;
  }
}

export function requirePrismaClient(cwd: string) {
  return require(path.join(cwd, 'node_modules/.prisma/client')).PrismaClient;
}
