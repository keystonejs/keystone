type ImageMode = 'local' | 'cloud';
type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp';
type ImageObjectFit = 'fixed' | 'intrinsic' | 'responsive' | 'fill';
type BlurHash = { hash: string; x: number; y: number };

export type Image = {
  mode: ImageMode;
  id: string;
  extension: ImageFormat;
  filesize: number;
  name: string;
  width: number;
  height: number;
  blurHash: BlurHash;
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
  blurHash: BlurHash;
  transform: (
    width: number,
    height: number,
    quality: number,
    objectFit: ImageObjectFit
  ) => { src: string; width: number; height: number };
};
