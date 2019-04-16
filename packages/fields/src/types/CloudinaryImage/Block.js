import { Block } from '../../Block';
import { importView } from '@keystone-alpha/build-field-types';
import CloudinaryImage from './';
import Relationship from '../Relationship';
import Text from '../Text';

export class CloudinaryBlock extends Block {
  constructor({ adapter }, { fromList, createAuxList, getListByKey }) {
    super();

    this.fromList = fromList;

    const auxListKey = `_Block_${fromList}_${CloudinaryBlock.type}`;
    let auxList = getListByKey(auxListKey);

    if (!auxList) {
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
    return importView('../Content/views/editor/blocks/image-container');
  }
}
