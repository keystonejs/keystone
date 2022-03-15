import { AssetMode, ImageExtension } from '../../../types';

export const getImageRef = (mode: AssetMode, id: string, extension: ImageExtension) =>
  `${mode}:image:${id}.${extension}`;

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];
