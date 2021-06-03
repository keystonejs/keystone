import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { ImageMetadata } from '@keystone-next/types';

const CLOUD_IMAGES_DOMAIN = 'imgix.net';
const CLOUD_GRAPHQL_API_ENDPOINT = 'http://localhost:4000/api/graphql';
const CLOUD_REST_API_ENDPOINT = 'http://localhost:4000/api/rest';

export const buildCloudImageSrc = (subdomain: string, filename: string) =>
  `http://${subdomain}.${CLOUD_IMAGES_DOMAIN}/${filename}`;

/**
 * This function and request to the cloud API will not be necessary if we can
 * encode the project's image subdomain in the apiKey.
 */
export const getImagesDomain = async (apiKey: string) => {
  const response = await fetch(CLOUD_GRAPHQL_API_ENDPOINT, {
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

export const getImageMetadataFromCloud = async ({
  apiKey,
  filename,
}: {
  apiKey: string;
  filename: string;
}): Promise<ImageMetadata> => {
  const response = await fetch(`${CLOUD_REST_API_ENDPOINT}/images/${filename}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

const uploadAssetToCloud = async ({
  apiKey,
  filename,
  stream,
  apiRoute,
}: {
  apiKey: string;
  filename: string;
  stream: Readable;
  apiRoute: string;
}): Promise<any> => {
  const form = new FormData();

  form.append('image', stream, filename);

  const response = await fetch(`${CLOUD_REST_API_ENDPOINT}/${apiRoute}`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const uploadImageToCloud = async (
  apiKey: string,
  stream: Readable,
  filename: string
): Promise<ImageMetadata> => uploadAssetToCloud({ apiKey, stream, filename, apiRoute: 'images' });

export const uploadFileToCloud = async (apiKey: string, filename: string, stream: Readable) =>
  uploadAssetToCloud({ apiKey, stream, filename, apiRoute: 'files' });
