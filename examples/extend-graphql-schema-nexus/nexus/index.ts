import path from 'path';
import { makeSchema } from 'nexus';

import * as types from './types';

export const nexusSchema = makeSchema({
  types,
  outputs: {
    typegen: path.join(process.cwd(), 'nexus', 'nexus-typegen.ts'),
  },
  // __dirname is absolute in Node but under webpack it is not so this is
  // "only generate when running under webpack and not in production"
  shouldGenerateArtifacts: !path.isAbsolute(__dirname) && process.env.NODE_ENV !== 'production',
  // This binds the Keystone Context with correctly generated types for the
  // Keystone `db` and `query` args, as well as the prisma client
  contextType: {
    module: path.join(process.cwd(), 'node_modules', '.keystone', 'types.d.ts'),
    export: 'KeystoneContext',
  },
});
