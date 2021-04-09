/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '@keystone-next/types';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { validateImage } from './Field';

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
  src: string;
  height: number;
  width: number;
};

type ImageValue =
  | { kind: 'empty' }
  | { kind: 'ref'; data: string }
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
      previous: ImageValue;
    }
  | { kind: 'remove'; previous: Exclude<ImageValue, { kind: 'remove' }> };

type ImageController = FieldController<ImageValue>;

export const controller = (config: FieldControllerConfig): ImageController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        id
        extension
        width
        height
      }`,
    defaultValue: { kind: 'empty' },
    deserialize(item) {
      const value = item[config.path];
      if (!value) return { kind: 'empty' };
      return {
        kind: 'from-server',
        data: {
          src: `/images/${value.id}.${value.extension}`,
          width: value.width,
          height: value.height,
        },
      };
    },
    validate(value) {
      return value.kind !== 'upload' || validateImage(value.data) === undefined;
    },
    serialize(value) {
      if (value.kind === 'upload') {
        return { [config.path]: { upload: value.data.file } };
      }
      if (value.kind === 'ref') {
        return { [config.path]: { ref: value.data } };
      }
      if (value.kind === 'remove') {
        return { [config.path]: null };
      }
      return {};
    },
  };
};
