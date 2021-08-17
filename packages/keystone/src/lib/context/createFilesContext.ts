import { KeystoneConfig, FilesContext } from '@keystone-next/types';

export function createFilesContext(config: KeystoneConfig): FilesContext | undefined {
  if (!config.files) {
    return;
  }

  const { files } = config;
  const { adapter } = files;

  return {
    getSrc: adapter.getSrc,
    getDataFromRef: adapter.getDataFromRef,
    getDataFromStream: adapter.getDataFromStream,
  };
}
