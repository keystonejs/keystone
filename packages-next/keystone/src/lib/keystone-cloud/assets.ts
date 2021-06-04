import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { ImageMetadata } from '@keystone-next/types';

/**
 * This function and request to the cloud API will not be necessary if we can
 * encode the project's image subdomain in the apiKey.
 */
const getImagesSubdomain = async ({
  apiKey,
  graphqlApiEndpoint,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
}) => {
  const response = await fetch(graphqlApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query($apiKey:String) {
          allImgixSources(where: { project: { apiKeys: { apiKey: $apiKey } } }) {
            domain
          }
        }
      `,
      variables: {
        apiKey,
      },
    }),
  });
  const json = await response.json();
  const { data } = json;
  const { allImgixSources } = data;

  return allImgixSources[0].domain;
};

const uploadAsset = async ({
  apiKey,
  filename,
  stream,
  apiRoute,
  restApiEndpoint,
}: {
  apiKey: string;
  filename: string;
  stream: Readable;
  apiRoute: string;
  restApiEndpoint: string;
}): Promise<any> => {
  const form = new FormData();

  form.append('image', stream, filename);

  const response = await fetch(`${restApiEndpoint}/${apiRoute}`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const buildKeystoneCloudImageSrc = async ({
  apiKey,
  graphqlApiEndpoint,
  filename,
  imagesDomain,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
  filename: string;
  imagesDomain: string;
}) => {
  const imagesSubdomain = await getImagesSubdomain({ apiKey, graphqlApiEndpoint });

  return `http://${imagesSubdomain}.${imagesDomain}/${filename}`;
};

export const getImageMetadataFromKeystoneCloud = async ({
  apiKey,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  filename: string;
  restApiEndpoint: string;
}): Promise<ImageMetadata> => {
  const response = await fetch(`${restApiEndpoint}/images/${filename}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const uploadImageToKeystoneCloud = async ({
  apiKey,
  stream,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  stream: Readable;
  filename: string;
  restApiEndpoint: string;
}): Promise<ImageMetadata> =>
  uploadAsset({ apiKey, stream, filename, restApiEndpoint, apiRoute: 'images' });

export const uploadFileToKeystoneCloud = async ({
  apiKey,
  stream,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  stream: Readable;
  filename: string;
  restApiEndpoint: string;
}) => uploadAsset({ apiKey, stream, filename, restApiEndpoint, apiRoute: 'files' });
