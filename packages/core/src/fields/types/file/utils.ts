import { AssetMode } from '../../../types';

const FILEREGEX = /^(local|cloud):file:([^\\\/:\n]+)/;

export const getFileRef = (mode: AssetMode, name: string) => `${mode}:file:${name}`;
export const parseFileRef = (ref: string) => {
  const match = ref.match(FILEREGEX);
  if (match) {
    const [, mode, filename] = match;
    return {
      mode: mode as AssetMode,
      filename: filename as string,
    };
  }
  return undefined;
};
