import { KeystoneContext } from '@keystone-next/types';
import { FileUpload } from 'graphql-upload';

type FileInput = {
  upload?: Promise<FileUpload> | null;
  ref?: string | null;
};

type ValidatedFileInput =
  | {
      kind: 'upload';
      upload: Promise<FileUpload>;
    }
  | {
      kind: 'ref';
      ref: string;
    };

function validateFileInput({ ref, upload }: FileInput): ValidatedFileInput {
  if (ref != null) {
    if (upload) {
      throw new Error('Only one of ref and upload can be passed to FileFieldInput');
    }
    return { kind: 'ref', ref };
  }
  if (!upload) {
    throw new Error('Either ref or upload must be passed to FileFieldInput');
  }
  return { kind: 'upload', upload };
}

export async function handleFileData(input: FileInput, context: KeystoneContext) {
  const data = validateFileInput(input);
  if (data.kind === 'upload') {
    const uploadedFile = await data.upload;
    return context.files!.getDataFromStream(uploadedFile.createReadStream(), uploadedFile.filename);
  }
  return context.files!.getDataFromRef(data.ref);
}
