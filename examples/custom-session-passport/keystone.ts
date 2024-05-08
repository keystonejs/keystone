import "dotenv/config";
import { config } from "@keystone-6/core";
import { KeystoneConfig } from "@keystone-6/core/types";
import { TypeInfo } from ".keystone/types";
import { lists } from "./schema";
import { session, createAuthenticationMiddleware, Session } from "./auth";
import { fixPrismaPath } from "../example-utils";

const keystoneConfig: KeystoneConfig<TypeInfo<Session>> = config<
  TypeInfo<Session>
>({
  db: {
    provider: "sqlite",
    url: "file:./keystone.db",

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  session,

  server: {
    extendExpressApp(app, context) {
      app.use(createAuthenticationMiddleware(context));
    },
  },
});

export default keystoneConfig;
