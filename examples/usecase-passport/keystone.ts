import "dotenv/config";
import { config } from "@keystone-6/core";
import { lists } from "./schema";
import { withAuth, session, createAuthenticationMiddleware } from "./auth";
import { fixPrismaPath } from "../example-utils";

export default withAuth(
  config({
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
  })
);
