import { KeystoneConfig, ImagesContext } from '@keystone-next/types';

export function createImagesContext(config: KeystoneConfig): ImagesContext | undefined {
  if (!config.images) {
    return;
  }

  const { images } = config;
  const { adapter } = images;
  return {
    getSrc: adapter.getSrc,
    getDataFromRef: adapter.getDataFromRef,
    getDataFromStream: adapter.getDataFromStream,
  };
}
