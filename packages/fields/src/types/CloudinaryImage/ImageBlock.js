import pluralize from 'pluralize';
import { Block } from '../../Block';
import CloudinaryImage from './';
import SelectType from '../Select';
import RelationshipType from '../Relationship';

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
          image: { type: CloudinaryImage, isRequired: true, adapter },
          align: {
            type: SelectType,
            defaultValue: 'center',
            options: ['left', 'center', 'right'],
          },
          // TODO: Inject the back reference to the item & field which created
          // this entry in the aux list
          //from: { type: RelationshipType, isRequired: true, ref: fromList },
          //field: { type: TextType, isRequired: true },
        },
      });
    }

    this.auxList = auxList;

    // When content blocks are specified that have complex KS5 datatypes, the
    // client needs to send them along as graphQL inputs separate to the
    // `document`. Those inputs are relationships to our join tables.  Here we
    // create a Relationship field to leverage existing functionality for
    // generating the graphQL schema.
    this._inputFields = [
      new RelationshipType.implementation(
        this.path,
        { ref: auxListKey, many: true, withMeta: false },
        listConfig
      ),
    ];

    this._outputFields = [
      new RelationshipType.implementation(
        this.path,
        { ref: auxListKey, many: true, withMeta: false },
        listConfig
      ),
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

  async processMutations(input, { existingItem, context }) {
    const mutationState = {
      afterChangeStack: [], // post-hook stack
      queues: {}, // backlink queues
      transaction: {}, // transaction
    };
    // TODO: Inject the back reference into `input` once we have the `from`
    // field setup on the aux list.
    const operations = await this._inputFields[0].resolveNestedOperations(
      input,
      existingItem,
      context,
      undefined,
      mutationState
    );

    return operations;
  }
}
