import { Text } from '@keystonejs/fields';

function resolveDocumentAccess(nodes, access, auth) {
  return nodes.map(node => resolveNodeAccess(node, access, auth)).filter(node => node);
}

function resolveNodeAccess(node, access, auth) {
  if (node.type === 'access-boundary' && Array.isArray(node.roles) && node.roles.length) {
    let canAccess = false;
    node.roles.forEach(role => {
      if (access.roles[role] && access.roles[role].resolveAccess(auth)) canAccess = true;
    });
    if (!canAccess) return undefined;
  }
  if (Array.isArray(node.children)) {
    node.children = resolveDocumentAccess(node.children, access, auth);
  }
  return node;
}

export class DocumentImplementation extends Text.implementation {
  constructor(path, { documentFeatures }) {
    super(...arguments);

    this.documentFeatures = documentFeatures;
  }
  gqlOutputFieldResolvers() {
    // async (item, args, context, info)
    return {
      [`${this.path}`]: (item, args, context) => {
        let document = item[this.path];
        if (!document || typeof document !== 'string') return undefined;

        // TODO: we should possibly do schema validation here, regardless of whether we need to check access,
        // but doing so requires deserialisation and researialisation and that could have a significant
        // performance cost so it probably shouldn't be done on ever ready.

        const {
          documentFeatures: { access },
        } = this;

        if (!access || !access.roles) {
          return document;
        }

        try {
          document = JSON.parse(item[this.path]);
        } catch (e) {
          return undefined;
        }
        // TODO: we should probably do more comprehensive schema validation here
        if (!Array.isArray(document)) return undefined;

        const { authedItem, authedListKey } = context;
        const auth = { item: authedItem, listKey: authedListKey };

        if (!access.authorAccess || !access.authorAccess(auth)) {
          document = resolveDocumentAccess(document, access, auth);
        }

        return JSON.stringify(document);
      },
    };
  }

  extendAdminMeta(meta) {
    const { documentFeatures: documentFeatureConfig } = this;
    const documentFeatures = {};
    // TODO: This need to be guarded, we're not validating config or throwing helpful warnings
    if (documentFeatureConfig.access) {
      const { roles: rolesConfig } = documentFeatureConfig.access;
      const roles = Object.keys(rolesConfig).map(value => ({
        value,
        label: rolesConfig[value].label || value,
      }));
      documentFeatures.access = {
        roles,
      };
    }
    return { ...meta, documentFeatures };
  }
}
