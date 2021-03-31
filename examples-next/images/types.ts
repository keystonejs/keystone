type ImageMode = 'local' | 'cloud';
type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp';
type ImageObjectFit = 'fixed' | 'intrinsic' | 'responsive' | 'fill';

export type Image = {
  mode: ImageMode;
  id: string;
  extension: ImageFormat;
  filesize: number;
  width: number;
  height: number;
};

export type ImageInputType = {
  upload: object;
  id: string;
  mode: ImageMode;
};

export type ImageOutputType = {
  mode: ImageMode;
  id: string;
  ext: string;
  src: string;
  width: number;
  height: number;
  filesize: number;
  transform: (
    width: number,
    height: number,
    quality: number,
    objectFit: ImageObjectFit
  ) => { src: string; width: number; height: number };
};
