import { Readable } from 'stream';
import { ImageExtension, FileMetadata } from '../../types';

export type ImageAdapter = {
  upload(stream: Buffer, id: string, extension: string): Promise<void>;
  delete(id: string, extension: ImageExtension): Promise<void>;
  url(id: string, extension: ImageExtension): Promise<string>;
};

export type FileAdapter = {
  upload(stream: Readable, filename: string): Promise<FileMetadata>;
  delete(id: string): Promise<void>;
  url(filename: string): Promise<string>;
};
