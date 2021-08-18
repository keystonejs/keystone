import { ImageExtension } from '@keystone-next/types';

const IMAGEREGEX = /^image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
const FILEREGEX = /^file:([^\\\/:\n]+)/;

export const getImageRef = (id: string, extension: ImageExtension) => `image:${id}.${extension}`;

export const getFileRef = (name: string) => `file:${name}`;
export const parseFileRef = (ref: string) => {
  const match = ref.match(FILEREGEX);
  if (match) {
    const [, filename] = match;
    return {
      filename: filename as string,
    };
  }
  return undefined;
};

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];

export const parseImageRef = (
  ref: string
): { id: string; extension: ImageExtension } | undefined => {
  const match = ref.match(IMAGEREGEX);
  if (match) {
    const [, id, ext] = match;
    return {
      id,
      extension: ext as ImageExtension,
    };
  }
  return undefined;
};
