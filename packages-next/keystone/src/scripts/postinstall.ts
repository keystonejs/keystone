import { createSystem } from '../lib/createSystem';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  validateCommittedArtifacts,
} from '../artifacts';
import { requireSource } from '../lib/config/requireSource';
import { initConfig } from '../lib/config/initConfig';
import { getConfigPath } from './utils';

// The postinstall step serves two purposes:

// There’s some files that we need to generate into node_modules and it’s
// important to have them available immediately so things like TypeScript
// won’t fail.

// We want to validate that your Prisma and GraphQL schemas are up to date
// to prevent the awkward “this is changing because of a previous PR that
// didn’t update these things”.

// Why do validation in the postinstall rather than a separate validate command?
//
// It means that it’s hard to get it wrong. You have to run the postinstall
// script anyway so it prevents “oh no, you forgot add this to your CI”

// node_modules
//   .prisma/client (this is where Prisma generates the client to by default,
//      this means we can have a conversation about whether we should tell
//      people to use @prisma/client directly for certain things though we
//      are not necessarily saying that’s what we should do)
//   .keystone
//     - All .js files will have a corresponding .d.ts file for TypeScript.
//       We are generating vanilla JavaScript because:
//         * the user may not be using TypeScript
//         * we can’t/shouldn’t rely on files in node_modules being transpiled even if they are
//     - types.{js,.ts}: .d.ts will be the same as current .keystone/schema-types.ts, the .js will be empty
//     - next/graphql-api.js: to be imported into a next app as an api route
//         * only generated with generateNextGraphqlAPI option
//     - api.js:  includes the lists API (full exports to be decided elsewhere
//         * only generated with generateNodeAPI option

export async function postinstall(cwd: string, shouldFix: boolean) {
  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const { graphQLSchema } = createSystem(config);

  if (shouldFix) {
    await generateCommittedArtifacts(graphQLSchema, config, cwd);
    console.log('✨ Generated GraphQL and Prisma schemas');
  } else {
    await validateCommittedArtifacts(graphQLSchema, config, cwd);
    console.log('✨ GraphQL and Prisma schemas are up to date');
  }
  await generateNodeModulesArtifacts(graphQLSchema, config, cwd);
}
