const pluralize = require('pluralize');
const { Block } = require('../../Block');
const path = require('path');

class CloudinaryBlock extends Block {
  static get type() {
    return 'cloudinaryImage';
  }

  static get isComplexDataType() {
    return true;
  }

  static get viewPath() {
    return require.resolve('../Content/views/editor/blocks/image-container');
  }

  constructor({ adapter }, { fromList, createAuxList, getListByKey, listConfig }) {
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

    // Require here to avoid circular dependencies
    const Relationship = require('../Relationship').implementation;

    // When content blocks are specified that have complex KS5 datatypes, the
    // client needs to send them along as graphQL inputs separate to the
    // `structure`. Those inputs are relationships to our join tables.  Here we
    // create a Relationship field to leverage existing functionality for
    // generating the graphQL schema.
    const fieldName = pluralize.plural(CloudinaryBlock.type);
    this._inputFields = [
      new Relationship(fieldName, { ref: auxListKey, many: true, withMeta: false }, listConfig),
    ];

    this._outputFields = [
      new Relationship(fieldName, { ref: auxListKey, many: true, withMeta: false }, listConfig),
    ];
  }

  getGqlInputFields() {
    return this._inputFields;
  }

  static get viewPath() {
    return path.join(__dirname, '../Content/views/blocks/image-container');
  }

  getGqlOutputFields() {
    return this._outputFields;
  }
}

module.exports = {
  CloudinaryBlock,
};
