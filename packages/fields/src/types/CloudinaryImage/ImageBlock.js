import pluralize from 'pluralize';
import { Block } from '../../Block';
import CloudinaryImage from './';
import SelectType from '../Select';
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

export class ImageBlock extends Block {
  constructor({ adapter }, { fromList, joinList, createAuxList, getListByKey }) {
    super(...arguments);

    this.joinList = joinList;

    const auxListKey = `_Block_${fromList}_${this.type}`;

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

  get path() {
    return pluralize.plural(this.type);
  }

  get fieldDefinitions() {
    return {
      [this.path]: {
        type: RelationshipWrapper,
        ref: this.auxList.key,
        many: true,
        schemaDoc: 'Images which have been added to the Content field',
      },
    };
  }

  getMutationOperationResults({ context }) {
    return {
      [this.path]: context._blockMeta[this.joinList][this.path],
    };
  }
}
