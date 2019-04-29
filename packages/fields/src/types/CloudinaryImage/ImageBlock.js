import pluralize from 'pluralize';
import { Block } from '../../Block';
import RelationshipFieldType from '../Relationship';
import CloudinaryImage from './';

export class ImageBlock extends Block {
  constructor({ adapter }, { type, fromList, createAuxList, getListByKey, listConfig }) {
    super();

    this.fromList = fromList;
    this.type = type;

    const auxListKey = `_Block_${fromList}_${this.type}`;

    // Ensure the list is only instantiated once per server instance.
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
      auxList = createAuxList(auxListKey, {
        fields: {
          // We perform the requires here to avoid circular dependencies
          image: { type: CloudinaryImage, isRequired: true, adapter },
        },
      });
    }

    this.auxList = auxList;

    // Require here to avoid circular dependencies
    const Relationship = RelationshipFieldType.implementation;

    // When content blocks are specified that have complex KS5 datatypes, the
    // client needs to send them along as graphQL inputs separate to the
    // `document`. Those inputs are relationships to our join tables.  Here we
    // create a Relationship field to leverage existing functionality for
    // generating the graphQL schema.
    this._inputFields = [
      new Relationship(this.path, { ref: auxListKey, many: true, withMeta: false }, listConfig),
    ];

    this._outputFields = [
      new Relationship(this.path, { ref: auxListKey, many: true, withMeta: false }, listConfig),
    ];
  }

  get path() {
    return pluralize.plural(this.type);
  }

  getGqlInputFields() {
    return this._inputFields;
  }

  getGqlOutputFields() {
    return this._outputFields;
  }
}
