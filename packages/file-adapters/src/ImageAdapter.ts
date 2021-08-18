import { Readable } from 'stream';
import { ImageExtension, ImageData } from '@keystone-next/types';

abstract class ImageAdapter {
  abstract getSrc(id: string, extension: ImageExtension): Promise<string>;
  abstract getDataFromRef(ref: string): Promise<ImageData>;
  abstract getDataFromStream(stream: Readable): Promise<ImageData>;
  // Called when the adapter is being provisioned for use in the context
  // or when the admin ui is being built
  bootstrap(): Promise<void> {
    return Promise.resolve();
  }
}

export { ImageAdapter };
