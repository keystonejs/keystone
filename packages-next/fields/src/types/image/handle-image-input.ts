import { KeystoneContext } from '@keystone-next/types';
import { FileUpload } from 'graphql-upload';

type ImageInput = {
  upload?: FileUpload | null;
  ref?: string | null;
};

type ValidatedImageInput =
  | {
      kind: 'upload';
      upload: FileUpload;
    }
  | {
      kind: 'ref';
      ref: string;
    };

function validateImageInput({ ref, upload }: ImageInput): ValidatedImageInput {
  if (ref != null) {
    if (upload) {
      throw new Error('Only one of ref and upload can be passed to ImageFieldInput');
    }
    return { kind: 'ref', ref };
  }
  if (!upload) {
    throw new Error('Either ref or upload must be passed to ImageFieldInput');
  }
  return { kind: 'upload', upload };
}

export async function handleImageData(input: ImageInput, context: KeystoneContext) {
  const data = validateImageInput(input);
  if (data.kind === 'upload') {
    return context.images.getDataFromStream(data.upload.createReadStream());
  }
  return context.images.getDataFromRef(data.ref);
}
