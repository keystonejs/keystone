// our monorepo examples have their @prisma/client dependencies hoisted
//   to build them and use them without conflict, we need to ensure .prisma/client
//   resolves to somewhere else
//
import * as Path from 'path';
//   we use node_modules/.myprisma to differentiate from node_modules/.prisma, but
//   still use node_modules/... to skip the painful experience that is jest/babel
//   transforms
export const fixPrismaPath = {
  prismaClientPath: 'node_modules/.myprisma/client',
};

// we use preconstruct to build our packages, for our monorepo examples we need to use @preconstruct/next
export const fixNextConfig = {
  getAdditionalFiles: [
    () => [
      {
        mode: 'copy' as const,
        inputPath: Path.resolve('../example-next-config-fix.js'),
        outputPath: 'next.config.js',
      },
    ],
  ],
};
