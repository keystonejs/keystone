/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-next/types';
import { validateImage } from './Field';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

export { Field } from './Field';

export const Cell: CellComponent = ({ item, field }) => {
  const data = item[field.path];
  if (!data) return null;
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        height: 24,
        lineHeight: 0,
        width: 24,
      }}
    >
      <img
        alt={data.filename}
        css={{ maxHeight: '100%', maxWidth: '100%' }}
        src={data.publicUrlTransformed}
      />
    </div>
  );
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  const data = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {data && <img alt={data.filename} src={data.publicUrlTransformed} />}
    </FieldContainer>
  );
};

type ImageData = {
  id: string;
  filename: string;
  publicUrlTransformed: string;
};

type CloudinaryImageValue =
  | { kind: 'empty' }
  | {
      kind: 'from-server';
      data: ImageData;
    }
  | {
      kind: 'upload';
      data: {
        file: File;
        validity: ValidityState;
      };
      previous: CloudinaryImageValue;
    }
  | { kind: 'remove'; previous: Exclude<CloudinaryImageValue, { kind: 'remove' }> };

type CloudinaryImageController = FieldController<CloudinaryImageValue>;

export const controller = (config: FieldControllerConfig): CloudinaryImageController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        id
        filename
        publicUrlTransformed(transformation: { width: "120" crop: "limit" })
      }`,
    defaultValue: { kind: 'empty' },
    deserialize(item) {
      const value = item[config.path];
      if (!value) return { kind: 'empty' };
      return {
        kind: 'from-server',
        data: value,
      };
    },
    validate(value) {
      return value.kind !== 'upload' || validateImage(value.data) === undefined;
    },
    serialize(value) {
      if (value.kind === 'upload') {
        return { [config.path]: value.data.file };
      }
      if (value.kind === 'remove') {
        return { [config.path]: null };
      }
      return {};
    },
  };
};
