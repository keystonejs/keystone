import { list } from "@keystone-6/core";
import { allOperations, allowAll, denyAll, unfiltered } from "@keystone-6/core/access";
import { checkbox, text } from "@keystone-6/core/fields";
import type { Lists } from ".keystone/types";
import RoleNames, { hasRole, SwaClientPrincipal } from "./session";

function hasSession({ session }: { session?: SwaClientPrincipal }) {
  return Boolean(session);
}

function isAdmin({ session }: { session?: SwaClientPrincipal }) {
  if (!session) return false;
  return hasRole({ session }, RoleNames.Admin);
}

function isBlogContributor({ session }: { session?: SwaClientPrincipal }) {
  if (!session) return false;
  return hasRole({ session }, RoleNames.BlogContributor);
}

function isBlogReader({ session }: { session?: SwaClientPrincipal }) {
  if (!session) return false;  
  return hasRole({ session }, RoleNames.BlogReader);
}

function isAdminOrOnlySameUser({ session }: { session?: SwaClientPrincipal }) {
  if (!session) return false;
  if (hasRole({ session }, RoleNames.Admin)) return {}; // unfiltered for admins
  return {
    id: { equals: session.userId },
  };
}

export const lists = {
  Post: list({
    access: {
      operation: {   
         query: ({ session}) => isBlogReader({ session }) || isBlogContributor({ session }),              
         create: isBlogContributor,
         update: isBlogContributor,
         delete: isBlogContributor,
      },
      filter: {        
        // this is redundant as it is the default
        //   but it may help readability
        query: unfiltered,
      },
    },
    fields: {
      title: text(),
      content: text(),
    },
  }),

  User: list({
    access: {
      operation: {
        query: isAdmin,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        query: isAdminOrOnlySameUser,
      },
    },
    fields: {
      name: text(),
      admin: checkbox(),
    },
  }),
} satisfies Lists<SwaClientPrincipal>;
