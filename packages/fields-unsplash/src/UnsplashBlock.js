import path from 'path';

import { Block } from '@keystonejs/fields-content/Block';
import { Unsplash } from '.';
import { Relationship } from '@keystonejs/fields';

const RelationshipWrapper = {
  ...Relationship,
  implementation: class extends Relationship.implementation {
    async resolveNestedOperations(operations, item, context, ...args) {
      const result = await super.resolveNestedOperations(operations, item, context, ...args);
      context._blockMeta = context._blockMeta || {};
      context._blockMeta[this.listKey] = context._blockMeta[this.listKey] || {};
      context._blockMeta[this.listKey][this.path] = result;
      return result;
    }
  },
};

const unsplashBlockView = path.join(
  path.dirname(require.resolve('@keystonejs/fields-unsplash/package.json')),
  'views/blocks/unsplash-image'
);

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
            type: Relationship,
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
    return 'unsplashImages';
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
    return [unsplashBlockView];
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
