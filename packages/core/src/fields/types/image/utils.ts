import mime from 'mime-types';

export const SUPPORTED_IMAGE_EXTENSIONS = Object.keys(mime.extensions).filter((ext) => {
  const mimeType = mime.lookup(ext);
  return mimeType && mimeType.startsWith('image/');
});
