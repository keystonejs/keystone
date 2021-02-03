import { resolveView } from './resolve-view';

import { Block } from '@keystonejs/fields-content/Block';
import { imageContainer, caption } from '@keystonejs/fields-content/blocks';
import { CloudinaryImage } from '.';
import { Select as SelectType, Relationship as RelationshipType } from '@keystonejs/fields';

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

export class ImageBlock extends Block {
  constructor({ adapter }, { fromList, joinList, createAuxList, getListByKey }) {
    super(...arguments);

    this.joinList = joinList;
    const auxListKey =
      getListByKey(fromList).adapter.parentAdapter.name === 'prisma'
        ? `KS_Block_${fromList}_${this.type}`
        : `_Block_${fromList}_${this.type}`;

    // Ensure the list is only instantiated once per server instance.
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
      auxList = createAuxList(auxListKey, {
        fields: {
          image: {
            type: CloudinaryImage,
            isRequired: true,
            adapter,
            schemaDoc: 'Cloudinary Image data returned from the Cloudinary API',
          },
          align: {
            type: SelectType,
            defaultValue: 'center',
            options: ['left', 'center', 'right'],
            schemaDoc: 'Set the image alignment',
          },
          // Useful for doing reverse lookups such as:
          // - "Get all images in this post"
          // - "List all users mentioned in comment"
          from: {
            type: RelationshipType,
            isRequired: true,
            ref: `${joinList}.${this.path}`,
            schemaDoc:
              'A reference back to the Slate.js Serialised Document this image is embedded within',
          },
        },
      });
    }

    this.auxList = auxList;
  }

  get type() {
    return 'cloudinaryImage';
  }

  get path() {
    return 'cloudinaryImages';
  }

  getAdminViews() {
    return [
      resolveView('views/blocks/single-image'),
      ...new imageContainer().getAdminViews(),
      ...new caption().getAdminViews(),
    ];
  }

  getFieldDefinitions() {
    return {
      [this.path]: {
        type: RelationshipWrapper,
        ref: `${this.auxList.key}.from`,
        many: true,
        schemaDoc: 'Images which have been added to the Content field',
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

  getViewOptions() {
    return {
      query: `
        cloudinaryImages {
          id
          image {
            publicUrl
          }
          align
        }
      `,
    };
  }
}
