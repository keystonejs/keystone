import type { Context } from ".keystone/types";

enum RoleNames {  
  Guest = "guest",
  Admin = "admin",
  BlogContributor = "blogContributor",
  BlogReader = "blogReader",
}
export default RoleNames;

export type SwaClientPrincipal = {
  userId: string;
  userRoles: RoleNames[];
  identityProvider: string;
  userDetails: string;
};

export type ListAccessArgs = {
  itemId?: string;
  session?: SwaClientPrincipal;
};

export function hasRole(
  { session }: ListAccessArgs,
  ...roles: RoleNames[]
): boolean {
  if (!session) {
    return false;
  }
  
  // console.log("roles", roles);
  var hasRequiredRole = session.userRoles.some((r: RoleNames) => roles.includes(r));
  // console.log("hasRequiredRole", hasRequiredRole);
  return hasRequiredRole;
}

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

const anonymousSession: SwaClientPrincipal = {
  userId: "",
  userRoles: [RoleNames.Guest],
  identityProvider: "",
  userDetails: "",  
};

export const AzStaticWebAppAuthSessionStrategy = {
  async start() {},
  async end() {},
  async get({
    context,
  }: {
    context: Context;
  }): Promise<SwaClientPrincipal | undefined> {
    const { req } = context;
    const { headers } = req ?? {};

    // Read the x-ms-client-principal header
    const clientPrincipalHeader = headers?.["x-ms-client-principal"] as string;

    if (!clientPrincipalHeader) {
      // If there is no header, the user is anonymous
      return anonymousSession;
    }

    let decodedBase64;
    let clientPrincipal: SwaClientPrincipal;

    try {
      // Decode the Base64 value
      decodedBase64 = Buffer.from(clientPrincipalHeader, "base64").toString(
        "utf-8"
      );

      // Deserialize into the required structure
      clientPrincipal = JSON.parse(decodedBase64);
    } catch (e: unknown) {      
      let errorToTrack: Error;
      if (e instanceof Error) {
        errorToTrack = e;
      } else {
        const message = typeof e === "string" ? e : "Unknown error";
        errorToTrack = new Error(message);
        
      }
      // log the error if needed
      // console.error(errorToTrack);
      return undefined;
    }

    if (
      !clientPrincipal ||
      !clientPrincipal.identityProvider ||
      !clientPrincipal.userId ||
      !clientPrincipal.userDetails ||
      !Array.isArray(clientPrincipal.userRoles)
    ) {
      // If the deserialized object doesn't have the expected shape, return
      return undefined;
    }    

    const result: SwaClientPrincipal = {
      ...clientPrincipal,      
    };

    return result;
  },
};
