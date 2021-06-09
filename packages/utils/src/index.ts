import { AssetMode, ImageExtension } from '@keystone-next/types';

const IMAGEREGEX = /^(local|keystone-cloud):image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
const FILEREGEX = /^(local):file:([^\\\/:\n]+)/;

export const getImageRef = (mode: AssetMode, id: string, extension: ImageExtension) =>
  `${mode}:image:${id}.${extension}`;

export const getFileRef = (mode: AssetMode, name: string) => `${mode}:file:${name}`;
export const parseFileRef = (ref: string) => {
  const match = ref.match(FILEREGEX);
  if (match) {
    const [, mode, filename] = match;
    return {
      mode: mode as AssetMode,
      filename: filename as string,
    };
  }
  return undefined;
};

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

export const isLocalAsset = (mode: AssetMode) => mode === 'local';

export const isKeystoneCloudAsset = (mode: AssetMode) => mode === 'keystone-cloud';
