import { AssetMode, ImageExtension } from '../../../types';

const IMAGEREGEX = /^(local|cloud):image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;

export const getImageRef = (mode: AssetMode, id: string, extension: ImageExtension) =>
  `${mode}:image:${id}.${extension}`;

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];

export const parseImageRef = (
  ref: string
): { mode: AssetMode; id: string; extension: ImageExtension } | undefined => {
  const match = ref.match(IMAGEREGEX);
  if (match) {
    const [, mode, id, ext] = match;
    return {
      mode: mode as AssetMode,
      id,
      extension: ext as ImageExtension,
    };
  }
  return undefined;
};
