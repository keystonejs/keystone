/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
} from '../../../../types';
import { validateImage, validateRef, ImageWrapper } from './Field';

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
      <img alt={data.filename} css={{ maxHeight: '100%', maxWidth: '100%' }} src={data.url} />
    </div>
  );
};

export const CardValue: CardValueComponent = ({ item, field }) => {
  const data = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {data && (
        <ImageWrapper>
          <img css={{ width: '100%' }} alt={data.filename} src={data.url} />
        </ImageWrapper>
      )}
    </FieldContainer>
  );
};

type ImageData = {
  src: string;
  ref: string;
  height: number;
  width: number;
  filesize: number;
  extension: string;
  id: string;
};

export type ImageValue =
  | { kind: 'empty' }
  | {
      kind: 'ref';
      data: {
        ref: string;
      };
      previous: ImageValue;
    }
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
  | { kind: 'remove'; previous?: Exclude<ImageValue, { kind: 'remove' }> };

type ImageController = FieldController<ImageValue>;

export const controller = (config: FieldControllerConfig): ImageController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        url
        id
        ref
        extension
        width
        height
        filesize
      }`,
    defaultValue: { kind: 'empty' },
    deserialize(item) {
      const value = item[config.path];
      if (!value) return { kind: 'empty' };
      return {
        kind: 'from-server',
        data: {
          src: value.url,
          id: value.id,
          extension: value.extension,
          ref: value.ref,
          width: value.width,
          height: value.height,
          filesize: value.filesize,
        },
      };
    },
    validate(value): boolean {
      if (value.kind === 'ref') {
        return validateRef(value.data) === undefined;
      }
      return value.kind !== 'upload' || validateImage(value.data) === undefined;
    },
    serialize(value) {
      if (value.kind === 'upload') {
        return { [config.path]: { upload: value.data.file } };
      }
      if (value.kind === 'ref') {
        return { [config.path]: { ref: value.data.ref } };
      }
      if (value.kind === 'remove') {
        return { [config.path]: null };
      }
      return {};
    },
  };
};
