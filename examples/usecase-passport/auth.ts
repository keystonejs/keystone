import { randomBytes } from "crypto";
import { Router } from "express";
import { Passport, Profile } from "passport";
import { Strategy, StrategyOptions } from "passport-github2";
import { hashSync } from "bcryptjs";
import { createAuth } from "@keystone-6/auth";
import { statelessSessions } from "@keystone-6/core/session";
import type { KeystoneContext } from "@keystone-6/core/types";
import type { VerifyCallback, VerifyFunction } from "passport-oauth2";
import type { Lists, TypeInfo } from ".keystone/types";
import type { User as PrismaUser } from ".myprisma/client";

type BaseSession<TData extends Record<string, unknown>> = {
  listKey: string;
  itemId: string;
  // Usually is added by @keystone-6/auth if enabled
  data?: TData;
};

type SessionData = {
  name: string;
  createdAt: string;
};

export type Session = BaseSession<SessionData>;

export const { withAuth } = createAuth<Lists.User.TypeInfo<Session>>({
  listKey: "User",
  identityField: "email",
  // Strictly typed sessionData (see Join at the end)
  sessionData: "name createdAt" satisfies Join<keyof SessionData>,
  secretField: "password",
});

export const session = statelessSessions<Session>({
  maxAge: 60 * 60 * 24 * 30,
  secret: process.env.SESSION_SECRET!,
});

// From here down is related to Passport Authentication

declare global {
  namespace Express {
    // Augment the global user added by Passport to be the same as the Prisma User
    interface User extends Omit<PrismaUser, "password"> {}
  }
}

const options: StrategyOptions = {
  // https://github.com/settings/applications/new
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  scope: ["user:email"],
  callbackURL: "http://localhost:3000/auth/github/callback",
};

export function createAuthenticationMiddleware(
  commonContext: KeystoneContext<TypeInfo<Session>>
): Router {
  const router = Router();
  const instance = new Passport();
  const strategy = new Strategy(options, createVerify(commonContext));

  instance.use(strategy);

  const middleware = instance.authenticate("github", {
    // No need to use express-session internally
    session: false,
  });

  router.get("/auth/github", middleware);
  router.get("/auth/github/callback", middleware, async (req, res) => {
    const context = await commonContext.withRequest(req, res);

    // Start the session in the same way authenticateItemWithPassword does
    // see: packages/auth/src/gql/getBaseAuthSchema.ts
    await context.sessionStrategy?.start({
      context,
      data: {
        listKey: "User",
        itemId: req.user?.id!,
      },
    });

    res.redirect("/auth/session");
  });

  // This URL will show current session object
  router.get("/auth/session", async (req, res) => {
    const context = await commonContext.withRequest(req, res);
    const session = await context.sessionStrategy?.get({ context });
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(session));
    res.end();
  });

  return router;
}

function createVerify(context: KeystoneContext<TypeInfo>): VerifyFunction {
  return async (_a: string, _r: string, p: Profile, done: VerifyCallback) => {
    const name = p.displayName;
    const email = p.emails?.map((e) => e.value).at(0);

    if (!email || !name) {
      return done(new Error("No email or name"));
    }

    // Find or create user with this email
    const user = await context.prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        // Generate random password
        password: hashSync(randomBytes(32).toString("hex"), 10),
      },
      update: { name },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return done(null, user);
  };
}

// TODO: Remove this?
type Join<T extends string, U extends string = T> =
  | U
  | (T extends any ? `${T} ${Join<Exclude<U, T>>}` : never);
