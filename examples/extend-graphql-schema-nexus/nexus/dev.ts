/*
The only purpose of this file is so we have something to run that ts-node-dev
can watch, which imports the Nexus schema and generates the types.

It's run with the `yarn dev-nexus` command, and loops on a timeout so the
process stays alive which means ts-node-dev will reload it when the Nexus
schema is changed; if the process exits, ts-node-dev stops watching.

It's a massive hack, but gives us a nice dev experience with Nexus.
*/

import { extendGraphqlSchema } from './';

function loop() {
  /** @ts-ignore */
  if (extendGraphqlSchema) {
  }
  setTimeout(loop, 1000000);
}
loop();
