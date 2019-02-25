// TODO: FIXME
const { Block } = require('../../Block');

class CloudinaryBlock extends Block {
  constructor({ adapter }, { fromList, createAuxList, getListByKey }) {
    super();

    this.fromList = fromList;

    const auxListKey = `_Block_${fromList}_${CloudinaryBlock.type}`;
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
      const Relationship = require('@voussoir/field-relationship');
      const Text = require('@voussoir/field-text');
      const CloudinaryImage = require('@voussoir/field-cloudinary-image');
      auxList = createAuxList(auxListKey, {
        fields: {
          // We perform the requires here to avoid circular dependencies
          image: { type: CloudinaryImage, isRequired: true, adapter },
          from: { type: Relationship, isRequired: true, ref: fromList },
          field: { type: Text, isRequired: true },
        },
      });
    }

    this.auxList = auxList;
  }

  static get type() {
    return 'cloudinaryImage';
  }

  static get isComplexDataType() {
    return true;
  }

  static get viewPath() {
    // TODO: FIXME
    return require.resolve('../Content/views/editor/blocks/image-container');
  }
}

module.exports = {
  CloudinaryBlock,
};
