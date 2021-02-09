import { Request, Response, NextFunction } from 'express';
import { parseCustomAccess } from '@keystonejs/access-control';

export class AppVersionProvider<SN extends string> {
  _access: Record<SN, boolean> & { internal: true };
  _version: string;

  constructor({
    version,
    access,
    schemaNames,
  }: {
    version: string;
    access?: boolean | Record<SN, boolean>;
    schemaNames: SN[];
  }) {
    this._access = parseCustomAccess({
      access: access,
      schemaNames,
      defaultAccess: true,
    }) as Record<SN, boolean> & { internal: true };
    this._version = version;
  }

  getTypes({}: { schemaName: SN }) {
    return [] as string[];
  }
  getQueries({ schemaName }: { schemaName: SN }) {
    return this._access[schemaName]
      ? [
          `"""The version of the Keystone application serving this API."""
          appVersion: String`,
        ]
      : [];
  }
  getMutations({}: { schemaName: SN }) {
    return [] as string[];
  }
  getSubscriptions({}: { schemaName: SN }) {
    return [] as string[];
  }

  getTypeResolvers({}: { schemaName: SN }) {
    return {} as Record<string, any>;
  }
  getQueryResolvers({ schemaName }: { schemaName: SN }) {
    return this._access[schemaName] ? { appVersion: () => this._version } : {};
  }
  getMutationResolvers({}: { schemaName: SN }) {
    return {} as Record<string, any>;
  }
  getSubscriptionResolvers({}: { schemaName: SN }) {
    return {} as Record<string, any>;
  }
}

export function appVersionMiddleware(version: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('X-Keystone-App-Version', version);
    next();
  };
}
