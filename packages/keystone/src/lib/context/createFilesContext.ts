import { KeystoneConfig, FilesContext } from '@keystone-next/types';

export function createFilesContext(config: KeystoneConfig): FilesContext | undefined {
  if (!config.files) {
    return;
  }

  const { files } = config;
  const { adapter } = files;

  return {
    getSrc: async (mode, filename) => {
      return adapter.getSrc(filename);
    },
    getDataFromRef: async (ref: string) => {
      return adapter.getDataFromRef(ref);
    },
    getDataFromStream: async (stream, originalFilename) => {
      return adapter.getDataFromStream(stream, originalFilename);
    },
  };
}
