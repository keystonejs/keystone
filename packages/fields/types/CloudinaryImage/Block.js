const { Block } = require('../../Block');

class CloudinaryBlock extends Block {
  constructor({ adapter }, { fromList, createAuxList, getListByKey }) {
    super();

    this.fromList = fromList;

    const auxListKey = `_Block_${fromList}_${CloudinaryBlock.type}`;
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
      auxList = createAuxList(auxListKey, {
        fields: {
          // We perform the requires here to avoid circular dependencies
          image: { type: require('./'), isRequired: true, adapter },
          from: { type: require('../Relationship'), isRequired: true, ref: fromList },
          field: { type: require('../Text'), isRequired: true },
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
    return require.resolve('../Content/views/editor/blocks/image-container');
  }
}

module.exports = {
  CloudinaryBlock,
};
