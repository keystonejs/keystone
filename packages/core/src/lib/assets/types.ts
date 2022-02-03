import { Readable } from 'stream';
import { ImageMetadata, ImageExtension, FileData } from '../../types';

export type AssetsAPI = {
  images: {
    upload(stream: Readable, id: string): Promise<ImageMetadata>;
    url(id: string, extension: ImageExtension): string;
    metadata(id: string, extension: ImageExtension): Promise<ImageMetadata>;
  };
  files: {
    upload(stream: Readable, filename: string): Promise<FileData>;
    url(filename: string): string;
    metadata(filename: string): Promise<FileData>;
  };
};
