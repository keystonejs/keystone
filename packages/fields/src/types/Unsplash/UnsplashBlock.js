import pluralize from 'pluralize';
import { importView } from '@keystonejs/build-field-types';

import { Block } from '@keystonejs/field-content/Block';
import Unsplash from './';
import RelationshipType from '../Relationship';

const RelationshipWrapper = {
  ...RelationshipType,
  implementation: class extends RelationshipType.implementation {
    async resolveNestedOperations(operations, item, context, ...args) {
      const result = await super.resolveNestedOperations(operations, item, context, ...args);
      context._blockMeta = context._blockMeta || {};
      context._blockMeta[this.listKey] = context._blockMeta[this.listKey] || {};
      context._blockMeta[this.listKey][this.path] = result;
      return result;
    }
  },
};

export class UnsplashBlock extends Block {
  constructor(
    { accessKey, secretKey, attribution },
    { fromList, joinList, createAuxList, getListByKey }
  ) {
    super(...arguments);

    this.joinList = joinList;

    if (typeof attribution === 'string' && attribution) {
      this.attribution = { source: attribution };
    } else if (typeof attribution === 'object' && attribution.source) {
      this.attribution = attribution;
    } else {
      throw new Error(
        'The unsplash-image block requires the `attribution` option to be either a string, or object { source<String>, medium<String?> }'
      );
    }

    const auxListKey = `_Block_${fromList}_${this.type}`;

    // Ensure the list is only instantiated once per server instance.
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
      auxList = createAuxList(auxListKey, {
        fields: {
          image: {
            type: Unsplash,
            isRequired: true,
            accessKey,
            secretKey,
            schemaDoc: 'Unsplash image data',
          },
          // Useful for doing reverse lookups such as:
          // - "Get all embeds in this post"
          // - "List all users mentioned in comment"
          from: {
            type: RelationshipType,
            isRequired: true,
            ref: `${joinList}.${this.path}`,
            schemaDoc:
              'A reference back to the Slate.js Serialised Document this unsplash image is contained within',
          },
        },
      });
    }

    this.auxList = auxList;
  }

  get type() {
    return 'unsplashImage';
  }

  get path() {
    return pluralize.plural(this.type);
  }

  getFieldDefinitions() {
    return {
      [this.path]: {
        type: RelationshipWrapper,
        ref: `${this.auxList.key}.from`,
        many: true,
        schemaDoc: 'Unsplash Images which have been added to the Content field',
      },
    };
  }

  getMutationOperationResults({ context }) {
    return {
      [this.path]:
        context._blockMeta &&
        context._blockMeta[this.joinList] &&
        context._blockMeta[this.joinList][this.path],
    };
  }

  getAdminViews() {
    return [importView('./views/blocks/unsplash-image')];
  }

  getViewOptions() {
    return {
      query: `
        unsplashImages {
          id
          image {
            id
            unsplashId
            publicUrl: publicUrlTransformed(transformation: { w: "620" })
            description
            user {
              name
              url
            }
          }
        }
      `,
      attribution: this.attribution,
    };
  }
}
